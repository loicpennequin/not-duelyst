import type { MaybePromise, Point3D } from '@game/shared';
import { type Cell } from '../board/cell';
import type { GameSession } from '../game-session';
import { Entity, ENTITY_EVENTS, type EntityId } from '../entity/entity';
import { createEntityModifier, type EntityModifier } from '../modifier/entity-modifier';
import { modifierCardInterceptorMixin } from '../modifier/mixins/card-interceptor.mixin';
import { modifierEntityInterceptorMixin } from '../modifier/mixins/entity-interceptor.mixin';
import { KEYWORDS, type Keyword } from '../utils/keywords';
import { createCardModifier } from './card-modifier';
import { modifierGameEventMixin } from './mixins/game-event.mixin';
import { modifierEntityDurationMixin } from './mixins/duration.mixin';
import { isWithinCells } from '../utils/targeting';
import { modifierSelfEventMixin } from './mixins/self-event.mixin';
import { INTERCEPTOR_PRIORITIES } from '../card/card-enums';
import { Card, CARD_EVENTS } from '../card/card';
import { Unit } from '../card/unit';
import { ARTIFACT_EVENTS, type PlayerArtifact } from '../player/player-artifact';
import { getEntityBehind, isNearbyAlly, isNearbyEnemy } from '../entity/entity-utils';

export const dispelEntity = (entity: Entity) => {
  entity.modifiers.forEach(modifier => {
    entity.removeModifier(modifier.id);
  });
};

export const cleanseEntity = (entity: Entity) => {
  entity.modifiers.forEach(modifier => {
    if (!modifier.source.player.equals(entity.player)) {
      entity.removeModifier(modifier.id);
    }
  });
};

export const purgeEntity = (entity: Entity) => {
  entity.modifiers.forEach(modifier => {
    if (modifier.source.player.equals(entity.player)) {
      entity.removeModifier(modifier.id);
    }
  });
};

export const dispelCell = (cell: Cell) => {
  cell.removeTile();
  if (cell.entity) {
    dispelEntity(cell.entity);
  }
};

export const dispelAt = (session: GameSession, point: Point3D) => {
  const cell = session.boardSystem.getCellAt(point);
  if (cell) {
    dispelCell(cell);
  }
};

export const rush = () => {
  return createCardModifier({
    id: KEYWORDS.RUSH.id,
    stackable: false,
    mixins: [
      modifierCardInterceptorMixin({
        key: 'canMoveAfterSummon',
        interceptor: () => () => true,
        keywords: [KEYWORDS.RUSH]
      }),
      modifierCardInterceptorMixin({
        key: 'canAttackAfterSummon',
        interceptor: () => () => true,
        keywords: [KEYWORDS.RUSH]
      })
    ]
  });
};

export const backstab = ({
  duration,
  source,
  attackBonus
}: {
  source: Card;
  duration?: number;
  attackBonus: number;
}) => {
  return createEntityModifier({
    id: KEYWORDS.BACKSTAB.id,
    source,
    visible: false,
    stackable: false,
    mixins: [
      modifierGameEventMixin({
        duration,
        eventName: 'entity:before_attack',
        keywords: [KEYWORDS.BACKSTAB],
        listener([{ entity, target }], { session, attachedTo }) {
          if (!entity.equals(attachedTo)) return;

          const behind = getEntityBehind(session, target);
          if (!behind?.equals(attachedTo)) return;

          const cleanups = [
            attachedTo.addInterceptor('attack', val => val + attackBonus),
            target.addInterceptor('canRetaliate', () => false)
          ];

          entity.once('after_attack', () => {
            cleanups.forEach(c => c());
          });
        }
      })
    ]
  });
};

export const burn = ({
  duration,
  source,
  stacks = 1
}: {
  source: Card;
  duration?: number;
  stacks?: number;
}) => {
  return createEntityModifier({
    id: KEYWORDS.BURN.id,
    source,
    visible: false,
    stackable: true,
    stacks,
    mixins: [
      modifierGameEventMixin({
        duration,
        eventName: 'player:turn_start',
        keywords: [KEYWORDS.BURN],
        async listener([player], ctx) {
          if (ctx.attachedTo.player.equals(player)) {
            await ctx.attachedTo.takeDamage(ctx.modifier.stacks!, source);
          }
        }
      })
    ]
  });
};

export const regeneration = ({
  duration,
  source,
  stacks = 1
}: {
  source: Card;
  duration?: number;
  stacks?: number;
}) => {
  return createEntityModifier({
    id: KEYWORDS.REGENERATION.id,
    source,
    visible: false,
    stackable: true,
    stacks,
    mixins: [
      modifierGameEventMixin({
        duration,
        eventName: 'player:turn_start',
        keywords: [KEYWORDS.REGENERATION],
        async listener([player], ctx) {
          if (ctx.attachedTo.player.equals(player)) {
            await ctx.attachedTo.heal(ctx.modifier.stacks!, source);
          }
        }
      })
    ]
  });
};

export const fearsome = ({
  source,
  duration = Infinity
}: {
  source: Card;
  duration?: number;
}) => {
  return createEntityModifier({
    source,
    id: KEYWORDS.FEARSOME.id,
    stackable: false,
    visible: false,
    mixins: [
      modifierSelfEventMixin({
        eventName: 'before_attack',
        keywords: [KEYWORDS.FEARSOME],
        duration,
        listener([event]) {
          const unsub = event.target.addInterceptor('canRetaliate', () => false);
          event.entity.once('after_attack', unsub);
        }
      })
    ]
  });
};

export const flying = ({
  source,
  duration = Infinity
}: {
  source: Card;
  duration?: number;
}) => {
  return createEntityModifier({
    id: KEYWORDS.FLYING.id,
    source,
    visible: false,
    stackable: false,
    mixins: [
      modifierEntityInterceptorMixin({
        key: 'canMoveThroughCell',
        keywords: [KEYWORDS.FLYING],
        duration,
        interceptor: () => () => {
          return true;
        }
      })
    ]
  });
};

export const frozen = ({
  source,
  duration = Infinity
}: {
  source: Card;
  duration?: number;
}) => {
  const interceptor = () => false;

  const cleanup = (attachedTo: Entity) => {
    attachedTo.removeInterceptor('canMove', interceptor);
    attachedTo.removeInterceptor('canAttack', interceptor);
  };

  return createEntityModifier({
    id: KEYWORDS.FROZEN.id,
    visible: false,
    stackable: false,
    source,
    mixins: [
      modifierEntityDurationMixin({
        duration,
        keywords: [KEYWORDS.FROZEN],
        onApplied(session, attachedTo) {
          attachedTo.addInterceptor('canAttack', interceptor);
          attachedTo.addInterceptor('canMove', interceptor);
          attachedTo.once('after_take_damage', () => cleanup(attachedTo));
        },
        onRemoved(session, attachedTo) {
          cleanup(attachedTo);
        }
      })
    ]
  });
};

export const rooted = ({
  source,
  duration = Infinity
}: {
  source: Card;
  duration?: number;
}) => {
  return createEntityModifier({
    id: KEYWORDS.ROOTED.id,
    visible: false,
    stackable: false,
    source,
    mixins: [
      modifierEntityInterceptorMixin({
        key: 'canMove',
        duration,
        interceptor: () => () => false,
        keywords: [KEYWORDS.ROOTED]
      })
    ]
  });
};

export const celerity = ({ source, duration }: { source: Card; duration?: number }) => {
  return createEntityModifier({
    source,
    id: KEYWORDS.CELERITY.id,
    visible: false,
    stackable: false,
    mixins: [
      modifierEntityInterceptorMixin({
        key: 'maxMovements',
        interceptor: () => val => val + 1,
        duration,
        tickOn: 'start',
        keywords: [KEYWORDS.CELERITY]
      }),
      modifierEntityInterceptorMixin({
        key: 'maxAttacks',
        interceptor: () => val => val + 1,
        duration,
        tickOn: 'start',
        keywords: [KEYWORDS.CELERITY]
      })
    ]
  });
};

export const structure = (source: Card) => {
  return createEntityModifier({
    source,
    id: KEYWORDS.STRUCTURE.id,
    visible: false,
    stackable: false,
    mixins: [
      {
        keywords: [KEYWORDS.STRUCTURE],
        onApplied(session, attachedTo) {
          attachedTo.addInterceptor(
            'canAttack',
            () => false,
            INTERCEPTOR_PRIORITIES.FINAL
          );
          attachedTo.addInterceptor('canMove', () => false, INTERCEPTOR_PRIORITIES.FINAL);
          attachedTo.addInterceptor(
            'canRetaliate',
            () => false,
            INTERCEPTOR_PRIORITIES.FINAL
          );
          attachedTo.addInterceptor('attack', () => 0, INTERCEPTOR_PRIORITIES.FINAL);
        }
      }
    ]
  });
};

export const ranged = ({ source, duration }: { source: Card; duration?: number }) => {
  return createEntityModifier({
    source,
    id: KEYWORDS.RANGED.id,
    stackable: false,
    visible: false,
    mixins: [
      modifierEntityInterceptorMixin({
        key: 'range',
        duration,
        keywords: [KEYWORDS.RANGED],
        interceptor: () => () => Infinity
      })
    ]
  });
};

export const barrier = ({ source, duration }: { source: Card; duration?: number }) => {
  return createEntityModifier({
    id: KEYWORDS.BARRIER.id,
    source,
    stackable: false,
    visible: false,
    mixins: [
      modifierEntityInterceptorMixin({
        key: 'damageTaken',
        interceptor: () => () => 0,
        priority: INTERCEPTOR_PRIORITIES.FINAL,
        keywords: [KEYWORDS.BARRIER],
        duration
      }),
      modifierSelfEventMixin({
        eventName: 'after_take_damage',
        once: true,
        duration,
        listener(event, { attachedTo }) {
          attachedTo.removeModifier(KEYWORDS.BARRIER.id);
        }
      })
    ]
  });
};

export const aura = ({
  source,
  onGainAura,
  onLoseAura,
  id,
  keywords = [],
  isElligible = (target, source) => isWithinCells(source.position, target.position, 1)
}: {
  source: Card;
  id?: string;
  onGainAura: (entity: Entity, source: Entity, session: GameSession) => void;
  onLoseAura: (entity: Entity, source: Entity, session: GameSession) => void;
  keywords?: Keyword[];
  isElligible?: (target: Entity, source: Entity, session: GameSession) => boolean;
}) => {
  const affectedEntitiesIds = new Set<EntityId>();
  // we need to track this variable because of how the event emitter works
  // basically if we have an event that says "after unit moves, remove this aura modifier"
  // It will not clean up aura's "after unit move" event before all the current listeners have been ran
  // which would lead to removing the aura, THEN check and apply the aura anyways
  let isApplied = true;
  let checkListener: () => void = () => void 0;

  const checkAura = (session: GameSession, attachedTo: Entity) => {
    if (!isApplied) return;
    session.entitySystem.getList().forEach(entity => {
      if (entity.equals(attachedTo)) return;
      const shouldGetAura = isElligible(entity, attachedTo, session);

      const hasAura = affectedEntitiesIds.has(entity.id);

      if (!shouldGetAura && hasAura) {
        affectedEntitiesIds.delete(entity.id);
        onLoseAura(entity, attachedTo, session);
        return;
      }

      if (shouldGetAura && !hasAura) {
        affectedEntitiesIds.add(entity.id);
        onGainAura(entity, attachedTo, session);
        return;
      }
    });
  };

  const cleanup = (session: GameSession, attachedTo: Entity) => {
    session.off('entity:created', checkListener);
    session.off('entity:after_destroy', checkListener);
    session.off('entity:after_move', checkListener);
    affectedEntitiesIds.forEach(id => {
      const entity = session.entitySystem.getEntityById(id);
      if (!entity) return;

      affectedEntitiesIds.delete(entity.id);
      onLoseAura(entity, attachedTo, session);
    });
  };

  return createEntityModifier({
    id,
    source,
    stackable: false,
    visible: false,
    mixins: [
      {
        keywords,
        onApplied(session, attachedTo) {
          isApplied = true;
          checkListener = () => checkAura(session, attachedTo);
          checkListener();

          session.on('entity:created', checkListener);
          session.on('entity:after_destroy', checkListener);
          session.on('entity:after_move', () => {
            checkListener();
          });

          attachedTo.once('after_destroy', () => {
            cleanup(session, attachedTo);
          });
        },
        onRemoved(session, attachedTo) {
          isApplied = false;
          cleanup(session, attachedTo);
        }
      }
    ]
  });
};

export const zeal = ({
  source,
  onGainAura,
  onLoseAura
}: {
  source: Card;
  onGainAura: (entity: Entity, source: Entity, session: GameSession) => void;
  onLoseAura: (entity: Entity, source: Entity, session: GameSession) => void;
}) => {
  return aura({
    source,
    keywords: [KEYWORDS.ZEAL],
    onGainAura(entity, zealed, session) {
      if (entity.equals(source.player.general)) {
        onGainAura(entity, zealed, session);
      }
    },
    onLoseAura(entity, zealed, session) {
      if (entity.equals(source.player.general)) {
        onLoseAura(entity, zealed, session);
      }
    },
    isElligible(target, source, session) {
      return isNearbyAlly(session, source, target.position);
    }
  });
};

export const provoke = ({ source }: { source: Card }) => {
  const interceptorMap = new Map<
    EntityId,
    {
      move: () => boolean;
      attack: (canAttack: boolean, ctx: { target: Entity }) => boolean;
    }
  >();

  const makeInterceptors = (taunter: Entity) => ({
    move: () => false,
    attack: (canAttack: boolean, { target }: { target: Entity }) => {
      // if entity already can't attack, do nothing
      if (!canAttack) return canAttack;

      return taunter.equals(target);
    }
  });

  return aura({
    id: KEYWORDS.PROVOKE.id,
    source,
    keywords: [KEYWORDS.PROVOKE],
    isElligible(target, source, session) {
      return isNearbyEnemy(session, source, target.position);
    },
    onGainAura(entity, taunter) {
      const interceptors = makeInterceptors(taunter);
      interceptorMap.set(entity.id, interceptors);
      entity.addInterceptor('canMove', interceptors.move);
      entity.addInterceptor('canAttack', interceptors.attack);

      if (entity.hasKeyword(KEYWORDS.PROVOKED)) return;
      entity.addKeyword(KEYWORDS.PROVOKED);
    },
    onLoseAura(entity, taunter, session) {
      const interceptors = interceptorMap.get(entity.id)!;
      entity.removeInterceptor('canMove', interceptors.move);
      entity.removeInterceptor('canAttack', interceptors.attack);

      const nearby = session.entitySystem
        .getNearbyEnemies(entity)
        .filter(e => !e.equals(taunter))
        .filter(e => e.hasKeyword(KEYWORDS.PROVOKE));
      if (!nearby.length) {
        entity.removeKeyword(KEYWORDS.PROVOKED);
      }
    }
  });
};

export const whileOnBoard = ({
  source,
  entity,
  onApplied,
  onRemoved
}: {
  entity: Entity;
  source: Card;
  onApplied: EntityModifier['onApplied'];
  onRemoved: EntityModifier['onRemoved'];
}) => {
  entity.addModifier(
    createEntityModifier({
      source,
      stackable: false,
      visible: false,
      mixins: [
        {
          onApplied(session, attachedTo, modifier) {
            onApplied(session, attachedTo, modifier);
            attachedTo.once(ENTITY_EVENTS.BEFORE_DESTROY, () => {
              onRemoved(session, attachedTo, modifier);
            });
          },
          onRemoved
        }
      ]
    })
  );
};

export const whileEquipped = ({
  artifact,
  modifier
}: {
  artifact: PlayerArtifact;
  modifier: EntityModifier;
}) => {
  artifact.card.player.general.addModifier(modifier);
  artifact.once(ARTIFACT_EVENTS.AFTER_DESTROY, () => {
    artifact.card.player.general.removeModifier(modifier.id);
  });
};

export const whileInHand = (
  card: Card,
  cb: (card: Card) => any,
  cleanup: (card: Card) => any
) => {
  card.on(CARD_EVENTS.DRAWN, cb);
  const unsub = () => {
    cleanup(card);
    card.off(CARD_EVENTS.AFTER_PLAYED, unsub);
    card.off(CARD_EVENTS.REPLACED, unsub);
  };
  card.on(CARD_EVENTS.AFTER_PLAYED, unsub);
  card.on(CARD_EVENTS.REPLACED, unsub);
};

export const whileInDeck = (
  card: Card,
  cb: (card: Card) => any,
  cleanup: (card: Card) => any
) => {
  cb(card);
  card.on(CARD_EVENTS.REPLACED, cb);
  card.on(CARD_EVENTS.DRAWN, cleanup);
};

export const dyingWish = ({
  source,
  handler,
  keywords = []
}: {
  source: Card;
  keywords?: Keyword[];
  handler: (
    entity: Entity,
    ctx: { session: GameSession; modifier: EntityModifier }
  ) => MaybePromise<void>;
}) => {
  return createEntityModifier({
    source,
    stackable: false,
    visible: false,
    mixins: [
      modifierSelfEventMixin({
        eventName: 'before_destroy',
        keywords: [...keywords, KEYWORDS.DYING_WISH],
        listener([event], ctx) {
          return handler(event, ctx);
        }
      })
    ]
  });
};

export const openingGambit = ({
  source,
  handler,
  keywords = []
}: {
  source: Card;
  keywords?: Keyword[];
  handler: (
    entity: Entity,
    ctx: { session: GameSession; modifier: EntityModifier }
  ) => MaybePromise<void>;
}) => {
  return createEntityModifier({
    source,
    stackable: false,
    visible: false,
    mixins: [
      modifierSelfEventMixin({
        eventName: 'created',
        keywords: [...keywords, KEYWORDS.OPENING_GAMBIT],
        listener([event], ctx) {
          return handler(event, ctx);
        }
      })
    ]
  });
};

export const deathWatch = ({
  source,
  handler
}: {
  source: Card;
  handler: (
    entity: Entity,
    ctx: { session: GameSession; modifier: EntityModifier }
  ) => MaybePromise<void>;
}) => {
  return createEntityModifier({
    source,
    stackable: false,
    visible: false,
    mixins: [
      modifierGameEventMixin({
        eventName: 'entity:after_destroy',
        listener([event], ctx) {
          return handler(event, ctx);
        }
      })
    ]
  });
};

export const airdrop = () =>
  createCardModifier({
    id: 'airdrop',
    stackable: false,

    mixins: [
      {
        keywords: [KEYWORDS.AIRDROP],
        onApplied(session, attachedTo) {
          if (!(attachedTo instanceof Unit)) {
            console.warn('Airdrop only works on units !');
            return;
          }
          attachedTo.addInterceptor(
            'canPlayAt',
            (value, { point }) => !session.entitySystem.getEntityAt(point)
          );
        }
      }
    ]
  });
