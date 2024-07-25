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
import {
  CARD_EVENTS,
  type CardBlueprintId,
  type CardEvent,
  type CardEventMap
} from './card/card';
import type { DeckEvent, DeckEventMap } from './card/deck';
import {
  ARTIFACT_EVENTS,
  type ArtifactEvent,
  type ArtifactEventMap
} from './player/player-artifact';
import { type GameSessionConfig } from './config';
import type { CardBlueprint, GenericSerializedBlueprint } from './card/card-blueprint';
import { CARDS } from './card/card-lookup';
import { parseSerializeBlueprint } from './card/card-parser';
import { SafeEventEmitter } from './utils/safe-event-emitter';

export type SerializedGameState = {
  map: BoardSystemOptions;
  entities: Array<SerializedEntity>;
  players: [SerializedPlayer, SerializedPlayer];
  history: SerializedAction[];
  rng: {
    values: number[];
  };
};

export type GameFormat = {
  config: GameSessionConfig;
  cards: Record<string, GenericSerializedBlueprint>;
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
type GlobalDeckEvents = {
  [Event in DeckEvent as `deck:${Event}`]: DeckEventMap[Event];
};
type GlobalArtifactEvents = {
  [Event in ArtifactEvent as `artifact:${Event}`]: ArtifactEventMap[Event];
};

type GameEventsBase = {
  '*': [e: StarEvent];
  'game:action': [GameAction<any>];
  'scheduler:flushed': [];
  'game:ready': [];
  'game:ended': [PlayerId];
  'game:error': [Error];
};
export type GameEventMap = Prettify<
  GameEventsBase &
    GlobalEntityEvents &
    GlobalPlayerEvents &
    GlobalCardEvents &
    GlobalDeckEvents &
    GlobalArtifactEvents
>;

export type StarEvent<T extends Exclude<GameEvent, '*'> = Exclude<GameEvent, '*'>> = {
  eventName: T;
  event: GameEventMap[T];
};
export type GameEvent = keyof GameEventMap;

export class GameSession extends SafeEventEmitter<GameEventMap> {
  static getLoadoutViolations(
    loadout: SerializedGameState['players'][number]['deck'],
    format: GameFormat
  ) {
    const formatCards = { ...CARDS, ...format.cards };
    const violations: string[] = [];
    if (loadout.length !== format.config.MAX_DECK_SIZE) {
      violations.push('deck size is incorrect');
    }

    loadout.forEach(card => {
      if (!formatCards[card.blueprintId]) {
        violations.push(`a card that doesn't belong to this format: ${card.blueprintId}`);
      }
      const copies = loadout.reduce((total, current) => {
        return current.blueprintId === card.blueprintId ? total + 1 : total;
      }, 0);
      if (copies > format.config.MAX_COPIES_PER_CARD) {
        violations.push(`Max copies exceeded for ${card.blueprintId}`);
      }
    });

    return [...new Set(violations)];
  }
  static createServerSession(
    state: SerializedGameState,
    options: { seed: string; format: GameFormat }
  ) {
    return new GameSession(state, new ServerRngSystem(options.seed), noopFXContext, {
      format: {
        config: options.format.config,
        cards: { ...CARDS, ...options.format.cards }
      }
    });
  }

  static createClientSession(
    state: SerializedGameState,
    options: { fxSystem: FXSystem; format: GameFormat; winnderId?: string }
  ) {
    return new GameSession(state, new ClientRngSystem(), options.fxSystem, {
      winnerId: options.winnderId,
      format: {
        config: options.format.config,
        cards: { ...CARDS, ...options.format.cards }
      }
    });
  }

  config: GameSessionConfig;
  cardBlueprints: Record<CardBlueprintId, CardBlueprint>;

  actionSystem = new ActionSystem(this);

  entitySystem = new EntitySystem(this);

  playerSystem = new PlayerSystem(this);

  boardSystem = new BoardSystem(this);

  isReady = false;

  winnerId: Nullable<string> = null;

  logger = console.log;

  protected constructor(
    private initialState: SerializedGameState,
    public rngSystem: RngSystem,
    public fxSystem: FXSystem,
    options: {
      winnerId?: string;
      format: GameFormat;
    }
  ) {
    super();
    this.config = options.format.config;
    console.log(options.format.cards);
    this.cardBlueprints = Object.fromEntries(
      Object.entries(options.format.cards).map(([key, value]) => [
        key,
        parseSerializeBlueprint(value, options.format)
      ])
    );
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
      ...Object.values(ARTIFACT_EVENTS).map(e => `artifact:${e}`),
      'game:action',
      'game:ready'
    ].forEach(eventName => {
      this.on(eventName as any, event => {
        // this.logger(`%c[EVENT:${eventName}]`, 'color: #008b8b');

        this.emit('*', { eventName, event } as any);
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
