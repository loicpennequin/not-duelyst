import {
  GameSession,
  config,
  type Player,
  type SerializedGameState,
  type GameAction
} from '@game/sdk';
import type { GameServer, GameSocket } from './types';
import type { Defined } from '@game/shared';
import { type FunctionReturnType } from 'convex/server';
import { api } from '@game/api';
import { parse } from 'zipson';
import { ConvexHttpClient } from 'convex/browser';
import type { Id } from '@game/api/src/convex/_generated/dataModel';

type GameDto = Defined<FunctionReturnType<typeof api.games.getCurrent>>;
type MapDto = Defined<FunctionReturnType<typeof api.gameMaps.getById>>;

export class Game {
  readonly session: GameSession;
  readonly minPlayers = 2;
  private playerJoined = new Set<string>();
  private isStarted = false;
  private turnTimeout?: ReturnType<typeof setTimeout>;
  private turnWarningTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private io: GameServer,
    private convexClient: ConvexHttpClient,
    private game: GameDto,
    private map: MapDto,
    public roomId: string
  ) {
    this.session = GameSession.createServerSession(
      this.getInitialState(),
      this.game.seed
    );

    this.session.on('game:action', this.onGameAction.bind(this));
    this.session.on('game:ended', this.onGameEnded.bind(this));
  }

  private onGameAction(action: GameAction<any>) {
    this.io.in(this.game._id).emit('game:action', action.serialize());
  }

  private onGameEnded(winnerId: string) {
    this.convexClient.action(api.games.end, {
      gameId: this.game._id,
      winnerId: winnerId as Id<'users'>,
      // replay: stringify(this.session.history.serialize())
      replay: ''
    });
  }

  private onPlayerInput(
    socket: GameSocket,
    { type, payload }: { type: any; payload: any }
  ) {
    this.session.dispatch({
      type,
      payload: { ...payload, playerId: socket.data.user._id }
    });
  }

  private onTurnStart(player: Player) {
    if (this.turnTimeout) clearTimeout(this.turnTimeout);
    if (this.turnWarningTimeout) clearTimeout(this.turnWarningTimeout);

    this.turnWarningTimeout = setTimeout(
      () => {
        this.io.in(this.game._id).emit('time-remaining', 20000);
      },
      (Number(process.env.TURN_LIMIT_IN_SECONDS) - 20) * 1000
    );

    this.turnTimeout = setTimeout(
      () => {
        this.session.dispatch({
          type: 'endTurn',
          payload: {
            playerId: player.id
          }
        });
      },
      Number(process.env.TURN_LIMIT_IN_SECONDS) * 1000
    );
  }

  private getInitialState(): SerializedGameState {
    const players = this.game.players
      .slice()
      .sort(a => (a._id === this.game.firstPlayer ? -1 : 1));
    return {
      history: [],
      entities: [],
      players: [
        {
          id: players[0]._id,
          isPlayer1: true,
          name: players[0].name,
          currentGold: config.PLAYER_1_STARTING_GOLD,
          maxGold: config.PLAYER_1_STARTING_GOLD,
          cards: players[0].loadout!.cards.map(({ id, pedestalId }) => ({
            pedestalId,
            blueprintId: id
          })),
          graveyard: []
        },
        {
          id: players[1]._id,
          isPlayer1: false,
          name: players[1].name,
          currentGold: config.PLAYER_1_STARTING_GOLD,
          maxGold: config.PLAYER_1_STARTING_GOLD,
          cards: players[1].loadout!.cards.map(({ id, pedestalId }) => ({
            pedestalId,
            blueprintId: id
          })),
          graveyard: []
        }
      ],
      map: {
        width: this.map.width,
        height: this.map.height,
        player1StartPosition: this.map.startPositions[0],
        player2StartPosition: this.map.startPositions[1],
        cells: parse(this.map.cells)
      }
    };
  }

  private start(sessionId: string) {
    if (this.isStarted) return;
    this.isStarted = true;
    if (this.game.status === 'WAITING_FOR_PLAYERS') {
      this.convexClient.mutation(api.games.start, { gameId: this.game._id, sessionId });
    }

    this.session.on('player:turn_start', this.onTurnStart.bind(this));
    this.onTurnStart(this.session.playerSystem.activePlayer);
  }

  join(socket: GameSocket) {
    socket.join(this.game._id);
    socket.emit('game:init', this.session.serialize());

    socket.on('game:action', (arg: { type: any; payload: any }) => {
      this.onPlayerInput(socket, arg);
    });
    socket.on('p1:emote', (emote: string) => {
      console.log('p1 emote');
      this.io.in(this.game._id).emit('p1:emote', emote);
    });
    socket.on('p2:emote', (emote: string) => {
      console.log('p2 emote');
      this.io.in(this.game._id).emit('p2:emote', emote);
    });

    this.playerJoined.add(socket.data.user._id);

    if (this.playerJoined.size === this.minPlayers) {
      this.start(socket.data.sessionId);
    }
  }

  spectate(socket: GameSocket) {
    socket.join(this.game._id);
    socket.emit('game:init', this.session.serialize());
  }

  async shutdown() {
    try {
      await this.convexClient.action(api.games.cancel, { roomId: this.roomId });
    } catch (err) {
      console.error(`Could not cancel game of roomID ${this.roomId}`);
    }
  }
}
