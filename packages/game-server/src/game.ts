import { GameSession, Player, SerializedGameState } from '@hc/sdk';
import { GameServer, GameSocket } from './types';
import { Defined } from '@hc/shared';
import { type FunctionReturnType } from 'convex/server';
import { api } from '@hc/api';
import { parse, stringify } from 'zipson';
import { GameAction } from '@hc/sdk/src/action/action';
import { ConvexHttpClient } from 'convex/browser';

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
    this.session = GameSession.createServerSession(this.getInitialState());

    this.session.subscribe(this.onSessionAction.bind(this));
  }

  private onSessionAction(action: GameAction<any>) {
    this.io.in(this.game._id).emit('game:action', action.serialize());
    if (action.name !== 'END_GAME') return;
    const { winner } = this.session.getState();

    this.convexClient.action(api.games.end, {
      gameId: this.game._id,
      winnerId: winner!.id as any,
      replay: stringify(this.session.history.serialize())
    });
  }

  private onPlayerInput(
    socket: GameSocket,
    { type, payload }: { type: any; payload: any }
  ) {
    this.session.dispatchPlayerInput({
      type: type,
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
        this.session.dispatchPlayerInput({
          type: 'END_TURN',
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
      activePlayerId: this.game.firstPlayer,
      history: [],
      entities: [],
      turn: 0,
      players: [
        {
          gold: 2,
          id: players[0]._id,
          name: players[0].name,
          loadout: {
            units: Object.fromEntries(
              players[0].loadout!.units.map(unit => [unit, { cooldown: 0 }])
            )
          },
          generalId: players[0].loadout!.generalId
        },
        {
          gold: 2,
          id: players[1]._id,
          name: players[1].name,
          loadout: {
            units: Object.fromEntries(
              players[1].loadout!.units.map(unit => [unit, { cooldown: 0 }])
            )
          },
          generalId: players[1].loadout!.generalId
        }
      ],
      map: {
        ...this.map,
        cells: parse(this.map.cells),
        startPositions: [this.map.startPositions[0], this.map.startPositions[1]]
      }
    };
  }

  private start(sessionId: string) {
    if (this.isStarted) return;
    this.isStarted = true;
    if (this.game.status === 'WAITING_FOR_PLAYERS') {
      this.convexClient.mutation(api.games.start, { gameId: this.game._id, sessionId });
    }

    this.session.emitter.on('game:turn-start', this.onTurnStart.bind(this));
    this.onTurnStart(this.session.playerManager.getActivePlayer());
  }

  join(socket: GameSocket) {
    socket.join(this.game._id);
    socket.emit('game:init', this.session.serialize());

    socket.on('game:input', (arg: { type: any; payload: any }) => {
      this.onPlayerInput(socket, arg);
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
