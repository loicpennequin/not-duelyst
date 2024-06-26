import EventEmitter from 'eventemitter3';
import { EntitySystem } from './entity/entity-system';
import { BoardSystem, type BoardSystemOptions } from './board/board-system';
import { PlayerSystem } from './player/player-system';
import {
  ENTITY_EVENTS,
  type EntityEvent,
  type EntityEventMap,
  type SerializedEntity
} from './entity/entity';
import type { GameAction, SerializedAction } from './action/action';
import type { Nullable, Prettify } from '@game/shared';
import {
  PLAYER_EVENTS,
  type PlayerEvent,
  type PlayerEventMap,
  type PlayerId,
  type SerializedPlayer
} from './player/player';
import { ActionSystem } from './action/action-system';
import { noopFXContext, type FXSystem } from './fx-system';
import { ClientRngSystem, ServerRngSystem, type RngSystem } from './rng-system';
import { CARD_EVENTS, type CardEvent, type CardEventMap } from './card/card';

export type SerializedGameState = {
  map: BoardSystemOptions;
  entities: Array<SerializedEntity>;
  players: [SerializedPlayer, SerializedPlayer];
  history: SerializedAction[];
  rng: {
    values: number[];
  };
};

type GlobalEntityEvents = {
  [Event in EntityEvent as `entity:${Event}`]: EntityEventMap[Event];
};
type GlobalPlayerEvents = {
  [Event in PlayerEvent as `player:${Event}`]: PlayerEventMap[Event];
};
type GlobalCardEvents = {
  [Event in CardEvent as `card:${Event}`]: CardEventMap[Event];
};

type GameEventsBase = {
  '*': [string];
  'game:action': [GameAction<any>];
  'scheduler:flushed': [];
  'game:ready': [];
  'game:ended': [PlayerId];
  'game:error': [Error];
};
export type GameEventMap = Prettify<
  GameEventsBase & GlobalEntityEvents & GlobalPlayerEvents & GlobalCardEvents
>;
export type GameEvent = keyof GameEventMap;

export class GameSession extends EventEmitter<GameEventMap> {
  static createServerSession(state: SerializedGameState, seed: string) {
    return new GameSession(state, new ServerRngSystem(seed), noopFXContext, {});
  }

  static createClientSession(
    state: SerializedGameState,

    fxSystem: FXSystem,
    winnerId?: string
  ) {
    return new GameSession(state, new ClientRngSystem(), fxSystem, { winnerId });
  }

  actionSystem = new ActionSystem(this);

  entitySystem = new EntitySystem(this);

  playerSystem = new PlayerSystem(this);

  boardSystem = new BoardSystem(this);

  isReady = false;

  winnerId: Nullable<string> = null;

  protected constructor(
    private initialState: SerializedGameState,
    public rngSystem: RngSystem,
    public fxSystem: FXSystem,
    options: {
      winnerId?: string;
    }
  ) {
    super();

    this.winnerId = options.winnerId;
    this.setup();
    this.emit('game:ready');
    this.isReady = true;
  }

  private setupStarEvents() {
    [
      ...Object.values(ENTITY_EVENTS).map(e => `entity:${e}`),
      ...Object.values(PLAYER_EVENTS).map(e => `player:${e}`),
      ...Object.values(CARD_EVENTS).map(e => `card:${e}`),
      'game:action',
      'game:ready'
    ].forEach(eventName => {
      this.on(eventName as any, () => {
        // console.log(`%c[EVENT:${eventName}]`, 'color: #008b8b');

        this.emit('*', eventName);
      });
    });
  }

  protected setup() {
    if (this.isReady) return;
    this.setupStarEvents();

    this.boardSystem.setup(this.initialState.map);
    this.playerSystem.setup(this.initialState.players);
    this.entitySystem.setup(this.initialState.entities);
    this.actionSystem.setup(this.initialState.history);

    this.on('entity:after_destroy', e => {
      if (e.isGeneral) {
        this.winnerId = e.player.opponent.id;
        this.emit('game:ended', e.player.opponent.id);
      }
    });
  }

  dispatch(action: SerializedAction) {
    this.actionSystem.dispatch(action);
  }

  onReady(cb: () => void) {
    if (this.isReady) return cb();
    this.on('game:ready', cb);
  }

  serialize(): SerializedGameState {
    return {
      ...this.initialState,
      rng: this.rngSystem.serialize(),
      history: this.actionSystem.serialize()
    };
  }
}
