import { FACTIONS } from '../faction/faction-lookup';
import { Heal } from '../skill/heal.skill';
import { MeleeAttack } from '../skill/melee-attack.skill';
import { UNIT_KIND } from './constants';
import { UnitBlueprint } from './unit-lookup';
import { HealAction } from '../action/heal.action';
import { AddEffectAction } from '../action/add-effect.action';
import { PlunderOnKillEffect } from '../effect/plunder-on-kill.effect';
import { RushEffect } from '../effect/rush.effect';
import { AoeOnDeathEffect } from '../effect/aoe-on-death.effect';

export const NEUTRAL_UNITS: UnitBlueprint[] = [
  {
    id: 'neutral-healer',
    spriteId: 'neutral-healer',
    kind: UNIT_KIND.SOLDIER,
    faction: FACTIONS.neutral,
    summonCost: 2,
    summonCooldown: 4,
    maxHp: 7,
    maxAp: 3,
    apRegenRate: 1,
    attack: 1,
    defense: 0,
    speed: 3,
    skills: [
      new MeleeAttack({ cooldown: 1, cost: 0, power: 0 }),
      new Heal({ cooldown: 2, cost: 2, power: 2, range: 2 })
    ],
    onSummoned: {
      getDescription() {
        return 'Restore 1 hp to all nearby allies.';
      },
      minTargetCount: 0,
      maxTargetCount: 0,
      isTargetable() {
        return false;
      },
      execute(ctx, targets, summonedEntity) {
        ctx.actionQueue.push(
          new HealAction(
            {
              amount: 1,
              sourceId: summonedEntity.id,
              targets: ctx.entityManager
                .getNearbyAllies(summonedEntity.position, summonedEntity.playerId)
                .map(ally => ally.id)
            },
            ctx
          )
        );
      }
    }
  },

  {
    id: 'neutral-tank',
    spriteId: 'neutral-tank',
    kind: UNIT_KIND.SOLDIER,
    faction: FACTIONS.neutral,
    summonCost: 3,
    summonCooldown: 4,
    maxHp: 8,
    maxAp: 3,
    apRegenRate: 1,
    attack: 2,
    defense: 1,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })],
    onSummoned: {
      getDescription() {
        return 'Taunt nearby enemies for 2 turns';
      },
      minTargetCount: 0,
      maxTargetCount: 0,
      isTargetable() {
        return false;
      },
      execute(ctx, targets, summonedEntity) {
        const nearby = ctx.entityManager.getNearbyEnemies(
          summonedEntity.position,
          summonedEntity.playerId
        );

        nearby.forEach(entity => {
          ctx.actionQueue.push(
            new AddEffectAction(
              {
                attachedTo: entity.id,
                effectId: 'taunted',
                effectArg: { duration: 2, radius: 1 },
                sourceId: summonedEntity.id
              },
              ctx
            )
          );
        });
      }
    }
  },

  {
    id: 'neutral-thief',
    spriteId: 'neutral-thief',
    kind: UNIT_KIND.SOLDIER,
    faction: FACTIONS.neutral,
    summonCost: 3,
    summonCooldown: 4,
    maxHp: 5,
    maxAp: 3,
    apRegenRate: 1,
    attack: 2,
    defense: 0,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })],
    effects: [
      {
        description: `Rush`,
        getEffect: (ctx, entity) => {
          return new RushEffect(ctx, entity, {});
        }
      },
      {
        description: `When this unit takes down an enemy, gain 1 gold.`,
        getEffect: (ctx, entity) => {
          return new PlunderOnKillEffect(ctx, entity, {
            duration: Infinity,
            amount: 1
          });
        }
      }
    ]
  },

  {
    id: 'neutral-willowisp',
    spriteId: 'neutral-willowisp',
    kind: UNIT_KIND.SOLDIER,
    faction: FACTIONS.neutral,
    summonCost: 1,
    summonCooldown: 2,
    maxHp: 1,
    maxAp: 3,
    apRegenRate: 1,
    attack: 1,
    defense: 0,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })],
    effects: [
      {
        description: `Rush`,
        getEffect: (ctx, entity) => {
          return new RushEffect(ctx, entity, {});
        }
      },
      {
        description: `When this unit dies, deal 2 damage to nearby enemies.`,
        getEffect: (ctx, entity) => {
          return new AoeOnDeathEffect(ctx, entity, {
            power: 2,
            attackRatio: 0,
            isTrueDamage: false
          });
        }
      }
    ]
  },

  {
    id: 'neutral-titan',
    spriteId: 'neutral-titan',
    kind: UNIT_KIND.SOLDIER,
    faction: FACTIONS.neutral,
    summonCost: 5,
    summonCooldown: 6,
    maxHp: 12,
    maxAp: 3,
    apRegenRate: 1,
    attack: 5,
    defense: 0,
    speed: 2,
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0, splash: true })]
  }
];
