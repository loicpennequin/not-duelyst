import mitt from 'mitt';
import { InputReducer, SerializedInput } from './input/input-reducer';
import { Entity, SerializedEntity, EntityEvent, EntityEventMap } from './entity/entity';
import { EntityManager } from './entity/entity-manager';
import { ActionHistory } from './action/action-history';
import { GameMap, GameMapOptions } from './map/map';
import { PlayerId, Player } from './player/player';
import { PlayerManager, SerializedPlayer } from './player/player-manager';
import { SerializedAction } from './action/action-deserializer';
import { ActionQueue } from './action/action-queue';
import { FXContext, GameAction } from './action/action';

export type GameState = {
  map: Pick<GameMap, 'height' | 'width' | 'cells' | 'interactables'>;
  entities: Entity[];
  players: Player[];
  activePlayer: Player;
  winner?: Player;
  turn: number;
  history: GameAction<any>[];
};

export type SerializedGameState = {
  map: GameMapOptions;
  entities: Array<SerializedEntity>;
  players: [SerializedPlayer, SerializedPlayer];
  history: SerializedAction[];
  activePlayerId: PlayerId;
  turn: number;
};

type EntityLifecycleEvent = 'created' | 'destroyed';
type GlobalEntityEvents = {
  [Event in
    | EntityEvent
    | EntityLifecycleEvent as `entity:${Event}`]: Event extends EntityEvent
    ? EntityEventMap[Event]
    : Entity;
};

type GlobalGameEvents = GlobalEntityEvents & {
  'game:action': GameAction<any>;
  'game:turn-end': Player;
  'game:turn-start': Player;
  'game:client-ready': void;
};

export class GameSession {
  static createServerSession(state: SerializedGameState) {
    return new GameSession(state, true);
  }

  static createClientSession(state: SerializedGameState) {
    return new GameSession(state, false);
  }

  // create empty session for test purposes or accessing the session context outside of a gaùe (in the collection for example)
  static createEmptySession() {
    return new GameSession(
      {
        history: [],
        players: [
          {
            generalId: 'fire-general',
            id: 'player1',
            gold: 0,
            name: 'player1',
            loadout: { units: {} }
          },
          {
            generalId: 'fire-general',
            id: 'player2',
            gold: 0,
            name: 'player2',
            loadout: { units: {} }
          }
        ],
        activePlayerId: 'player1',
        entities: [],
        map: {
          cells: [
            { position: { x: 0, y: 0, z: 0 }, spriteIds: [], tileId: 'ground' },
            { position: { x: 0, y: 1, z: 0 }, spriteIds: [], tileId: 'ground' },
            { position: { x: 1, y: 0, z: 0 }, spriteIds: [], tileId: 'ground' },
            { position: { x: 1, y: 1, z: 0 }, spriteIds: [], tileId: 'ground' }
          ],
          height: 2,
          width: 2,
          interactables: [],
          startPositions: [
            { x: 0, y: 0, z: 0 },
            { x: 0, y: 0, z: 0 }
          ]
        },
        turn: 1
      },
      false
    );
  }
  map = new GameMap(this);

  playerManager = new PlayerManager(this);

  entityManager = new EntityManager(this);

  history = new ActionHistory(this);

  actionQueue = new ActionQueue(this);

  inputReducer = new InputReducer(this);

  emitter = mitt<GlobalGameEvents>();

  nextEventId = 1;

  fxContext?: FXContext;

  winner?: PlayerId;

  turn: number;

  clientReady = false;

  private constructor(
    private initialState: SerializedGameState,
    readonly isAuthoritative: boolean
  ) {
    this.turn = this.initialState.turn;
    this.setup();
  }

  private async setup() {
    this.map.setup(this.initialState.map);
    this.playerManager.setup(this.initialState.activePlayerId, this.initialState.players);
    this.entityManager.setup(this.initialState.entities);

    if (!this.entityManager.getList().length) {
      this.playerManager.getList().forEach((player, index) => {
        this.entityManager.addEntity({
          playerId: player.id,
          unitId: player.generalId,
          position: this.initialState.map.startPositions[index]
        });
      });
    }
    await this.history.setup(this.initialState.history);
    if (!this.isAuthoritative) {
      this.clientReady = true;
      this.emitter.emit('game:client-ready');
    }
  }

  getState(): Readonly<GameState> {
    return {
      map: {
        height: this.map.height,
        width: this.map.width,
        cells: this.map.cells.map(cell => cell.clone()),
        interactables: this.map.interactables
      },
      turn: this.turn,
      entities: this.entityManager.getList().map(entity => entity.clone()),
      players: this.playerManager.getList().map(player => player.clone()),
      activePlayer: this.playerManager.getActivePlayer(),
      winner: this.winner ? this.playerManager.getPlayerById(this.winner) : undefined,
      history: this.history.get()
    };
  }

  dispatchPlayerInput(action: SerializedInput) {
    this.inputReducer.reduce(action);
  }

  dispatchAction(action: SerializedAction) {
    this.actionQueue.push(action);
  }

  onReady(cb: () => void) {
    if (this.isAuthoritative) return;
    if (this.clientReady) return cb();
    this.emitter.on('game:client-ready', cb);
  }

  subscribe(cb: (e: GameAction<any>) => void) {
    this.emitter.on('game:action', cb);
    return () => this.emitter.off('game:action', cb);
  }

  serialize(): SerializedGameState {
    return {
      ...this.initialState,
      history: this.history.serialize()
    };
  }
}
