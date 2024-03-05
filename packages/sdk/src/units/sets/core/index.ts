import { RARITY } from '../../../enums';
import { FACTIONS } from '../../../faction/faction-lookup';
import { MeleeAttack } from '../../../skill/melee-attack.skill';
import { KEYWORDS } from '../../../utils/keywords';
import { UNIT_KIND } from '../../constants';
import type { UnitBlueprint } from '../../unit-lookup';
import { isEnemy } from '../../../entity/entity-utils';
import { RangedAttack } from '../../../skill/ranged-attack';
import { isWithinCells } from '../../../skill/skill-utils';
import { DealDamageAction } from '../../../action/deal-damage.action';
import { AddEffectAction } from '../../../action/add-effect.action';

export const coreSet: UnitBlueprint[] = [
  {
    id: 'dark-general',
    spriteId: 'dark-hero',
    kind: UNIT_KIND.GENERAL,
    factions: [FACTIONS.DARK],
    rarity: RARITY.LEGENDARY,
    summonCost: 0,
    summonCooldown: 0,
    maxHp: 25,
    attack: 2,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, power: 0 })]
  },
  {
    id: 'light-general',
    spriteId: 'light-hero',
    kind: UNIT_KIND.GENERAL,
    factions: [FACTIONS.LIGHT],
    rarity: RARITY.LEGENDARY,
    summonCost: 0,
    summonCooldown: 0,
    maxHp: 25,
    attack: 2,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, power: 0 })]
  },
  {
    id: 'fire-general',
    spriteId: 'fire-hero',
    kind: UNIT_KIND.GENERAL,
    factions: [FACTIONS.FIRE],
    rarity: RARITY.LEGENDARY,
    summonCost: 0,
    summonCooldown: 0,
    maxHp: 25,
    attack: 2,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, power: 0 })]
  },
  {
    id: 'air-general',
    spriteId: 'air-hero',
    kind: UNIT_KIND.GENERAL,
    factions: [FACTIONS.AIR],
    rarity: RARITY.LEGENDARY,
    summonCost: 0,
    summonCooldown: 0,
    maxHp: 25,
    attack: 2,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, power: 0 })]
  },
  {
    id: 'water-general',
    spriteId: 'water-hero',
    kind: UNIT_KIND.GENERAL,
    factions: [FACTIONS.WATER],
    rarity: RARITY.LEGENDARY,
    summonCost: 0,
    summonCooldown: 0,
    maxHp: 25,
    attack: 2,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, power: 0 })]
  },
  {
    id: 'earth-general',
    spriteId: 'earth-hero',
    kind: UNIT_KIND.GENERAL,
    factions: [FACTIONS.EARTH],
    rarity: RARITY.LEGENDARY,
    summonCost: 0,
    summonCooldown: 0,
    maxHp: 25,
    attack: 2,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, power: 0 })]
  },
  {
    id: 'neutral-swordsman',
    spriteId: 'neutral-swordsman',
    kind: UNIT_KIND.SOLDIER,
    factions: [],
    rarity: RARITY.COMMON,
    summonCost: 2,
    summonCooldown: 3,
    maxHp: 6,
    attack: 2,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, power: 0 })],
    onSummoned: {
      minTargetCount: 0,
      maxTargetCount: 1,
      isTargetable(ctx, point, summonedPoint) {
        const entity = ctx.entityManager.getEntityAt(point);
        if (!entity) return false;

        return (
          isEnemy(ctx, entity.id, ctx.playerManager.getActivePlayer().id) &&
          isWithinCells(ctx, summonedPoint, point, 1)
        );
      }
    },
    effects: [
      {
        description: 'Summon: deal one damage to a nearby enemy.',
        keywords: [KEYWORDS.SUMMON],
        execute(ctx, entity, targets) {
          const enemy = ctx.entityManager.getEntityAt(targets[0])!;

          ctx.actionQueue.push(
            new DealDamageAction(
              {
                amount: 1,
                shouldRetaliate: false,
                sourceId: entity.id,
                targets: [enemy.id]
              },
              ctx
            )
          );
        }
      }
    ]
  },
  {
    id: 'neutral-archer',
    spriteId: 'neutral-archer',
    factions: [],
    kind: UNIT_KIND.SOLDIER,
    rarity: RARITY.COMMON,
    summonCost: 3,
    summonCooldown: 3,
    attack: 1,
    maxHp: 6,
    speed: 3,
    skills: [
      new RangedAttack({
        cooldown: 1,
        power: 0,
        minRange: 2,
        maxRange: 3
      })
    ]
  },
  {
    id: 'neutral-tank',
    spriteId: 'neutral-tank',
    factions: [],
    kind: UNIT_KIND.SOLDIER,
    rarity: RARITY.COMMON,
    summonCost: 4,
    summonCooldown: 4,
    attack: 2,
    maxHp: 8,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, power: 0 })],
    effects: [
      {
        description: 'Summon: taunt nearby enemies.',
        keywords: [KEYWORDS.SUMMON, KEYWORDS.TAUNT],
        execute(ctx, entity) {
          const enemies = ctx.entityManager.getNearbyEnemies(
            entity.position,
            entity.playerId
          );

          enemies.forEach(enemy => {
            ctx.actionQueue.push(
              new AddEffectAction(
                {
                  attachedTo: enemy.id,
                  sourceId: entity.id,
                  effectId: 'taunted',
                  effectArg: { duration: 1, radius: 1 }
                },
                ctx
              )
            );
          });
        }
      }
    ]
  }
];
