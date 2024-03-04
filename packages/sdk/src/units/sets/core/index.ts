import { PlunderOnKillModifier } from '../../../modifier/plunder-on-kill.modifier';
import { RushModifier } from '../../../modifier/rush.modifier';
import { ToughModifier } from '../../../modifier/tough.modifier';
import { RARITY } from '../../../enums';
import { FACTIONS } from '../../../faction/faction-lookup';
import { MeleeAttack } from '../../../skill/melee-attack.skill';
import type { SkillDescriptionContext } from '../../../skill/skill';
import { KEYWORDS } from '../../../utils/keywords';
import { UNIT_KIND } from '../../constants';
import type { UnitBlueprint } from '../../unit-lookup';
import { MODIFIERS } from '../../../modifier/modifier-lookup';
import { isEnemy } from '../../../entity/entity-utils';
import { RangedAttack } from '../../../skill/ranged-attack';

export const coreSet: UnitBlueprint[] = [
  {
    id: 'dark-general',
    spriteId: 'chaos-hero2',
    kind: UNIT_KIND.GENERAL,
    factions: [FACTIONS.DARK],
    rarity: RARITY.LEGENDARY,
    summonCost: 0,
    summonCooldown: 0,
    maxHp: 25,
    attack: 2,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })]
  },
  {
    id: 'light-general',
    spriteId: 'haven-hero2',
    kind: UNIT_KIND.GENERAL,
    factions: [FACTIONS.LIGHT],
    rarity: RARITY.LEGENDARY,
    summonCost: 0,
    summonCooldown: 0,
    maxHp: 25,
    attack: 2,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })]
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
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })]
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
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })]
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
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })]
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
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })]
  },
  {
    id: 'air-elemental',
    spriteId: 'air-avatar',
    kind: UNIT_KIND.SOLDIER,
    factions: [FACTIONS.AIR],
    rarity: RARITY.COMMON,
    summonCost: 2,
    summonCooldown: 3,
    maxHp: 6,
    attack: 2,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })],
    effects: [
      {
        description: `Rush`,
        keywords: [KEYWORDS.RUSH],
        execute: (ctx, entity) => {
          new RushModifier(ctx, entity, {}).attach(entity);
        }
      }
    ]
  },
  {
    id: 'dark-elemental',
    spriteId: 'dark-avatar',
    kind: UNIT_KIND.SOLDIER,
    factions: [FACTIONS.DARK],
    rarity: RARITY.COMMON,
    summonCost: 2,
    summonCooldown: 3,
    maxHp: 6,
    attack: 2,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })],
    effects: [
      {
        description: `Slay: Plunder(1)`,
        keywords: [KEYWORDS.PLUNDER, KEYWORDS.SLAY],
        execute: (ctx, entity) => {
          new PlunderOnKillModifier(ctx, entity, {
            duration: Infinity,
            amount: 2
          }).attach(entity);
        }
      }
    ]
  },
  {
    id: 'fire-elemental',
    spriteId: 'fire-avatar',
    kind: UNIT_KIND.SOLDIER,
    factions: [FACTIONS.FIRE],
    rarity: RARITY.COMMON,
    summonCost: 2,
    summonCooldown: 3,
    maxHp: 6,
    attack: 2,
    speed: 3,
    skills: [
      new MeleeAttack({ cooldown: 1, cost: 0, power: 0 }),
      new (class extends MeleeAttack {
        getDescription(caster: SkillDescriptionContext): string {
          return `Deals ${this.getDamageAmount(
            caster.attack
          )} damage and Burn(1) to a nearby enemy.`;
        }
      })({
        id: 'Burn attack',
        cooldown: 3,
        cost: 0,
        power: -1,
        spriteId: 'fire',
        keyords: [KEYWORDS.BURN]
      })
    ],
    effects: [
      {
        description: 'Burn(1) aura',
        keywords: [KEYWORDS.BURN, KEYWORDS.AURA],
        execute(ctx, entity) {
          new MODIFIERS.auraBurn(ctx, entity, {
            duration: Infinity,
            power: 1,
            range: 1
          }).attach(entity);
        }
      }
    ]
  },
  {
    id: 'earth-elemental',
    spriteId: 'earth-avatar',
    kind: UNIT_KIND.SOLDIER,
    factions: [FACTIONS.EARTH],
    rarity: RARITY.COMMON,
    summonCost: 2,
    summonCooldown: 3,
    maxHp: 6,
    attack: 2,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })],
    effects: [
      {
        description: 'Tough',
        keywords: [KEYWORDS.TOUGH],
        execute(ctx, entity) {
          new ToughModifier(ctx, entity, {
            duration: Infinity
          }).attach(entity);
        }
      }
    ]
  },
  {
    id: 'light-elemental',
    spriteId: 'light-avatar',
    kind: UNIT_KIND.SOLDIER,
    factions: [FACTIONS.LIGHT],
    rarity: RARITY.COMMON,
    summonCost: 2,
    summonCooldown: 3,
    maxHp: 6,
    attack: 2,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })]
  },
  {
    id: 'water-elemental',
    spriteId: 'water-avatar',
    kind: UNIT_KIND.SOLDIER,
    factions: [FACTIONS.WATER],
    rarity: RARITY.COMMON,
    summonCost: 2,
    summonCooldown: 3,
    maxHp: 6,
    attack: 2,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })],
    effects: [
      {
        description: 'Freeze an enemy for one turn.',
        keywords: [KEYWORDS.FROZEN],
        execute(ctx, entity, targets) {
          new MODIFIERS.onSummonedFreeze(ctx, entity, {
            targets: [targets[0]]
          }).attach(entity);
        }
      }
    ],
    onSummoned: {
      getDescription() {
        return 'Freeze an enemy for one turn';
      },
      minTargetCount: 0,
      maxTargetCount: 1,
      isTargetable(ctx, point) {
        return isEnemy(
          ctx,
          ctx.entityManager.getEntityAt(point)?.id,
          ctx.playerManager.getActivePlayer().id
        );
      }
    }
  },
  {
    id: 'air-archer',
    spriteId: 'air-avatar',
    kind: UNIT_KIND.SOLDIER,
    factions: [FACTIONS.AIR],
    rarity: RARITY.COMMON,
    summonCost: 2,
    summonCooldown: 3,
    maxHp: 6,
    attack: 1,
    speed: 3,
    skills: [
      new RangedAttack({ cooldown: 1, cost: 0, power: 0, minRange: 2, maxRange: 3 })
    ]
  },
  {
    id: 'dark-archer',
    spriteId: 'dark-avatar',
    kind: UNIT_KIND.SOLDIER,
    factions: [FACTIONS.DARK],
    rarity: RARITY.COMMON,
    summonCost: 2,
    summonCooldown: 3,
    maxHp: 6,
    attack: 1,
    speed: 3,
    skills: [
      new RangedAttack({ cooldown: 1, cost: 0, power: 0, minRange: 2, maxRange: 3 })
    ],
    effects: [
      {
        description: 'Lone wolf: +2 attack.',
        keywords: [KEYWORDS.LONE_WOLF],
        execute(ctx, entity) {
          new MODIFIERS.loneWolfStatModifier(ctx, entity, {
            statKey: 'attack',
            value: 2
          }).attach(entity);
        }
      }
    ]
  },
  {
    id: 'fire-archer',
    spriteId: 'fire-avatar',
    kind: UNIT_KIND.SOLDIER,
    factions: [FACTIONS.FIRE],
    rarity: RARITY.COMMON,
    summonCost: 2,
    summonCooldown: 3,
    maxHp: 6,
    attack: 1,
    speed: 3,
    skills: [
      new RangedAttack({ cooldown: 1, cost: 0, power: 0, minRange: 2, maxRange: 3 })
    ]
  },
  {
    id: 'earth-archer',
    spriteId: 'earth-avatar',
    kind: UNIT_KIND.SOLDIER,
    factions: [FACTIONS.EARTH],
    rarity: RARITY.COMMON,
    summonCost: 2,
    summonCooldown: 3,
    maxHp: 6,
    attack: 1,
    speed: 3,
    skills: [
      new RangedAttack({ cooldown: 1, cost: 0, power: 0, minRange: 2, maxRange: 3 })
    ]
  },
  {
    id: 'light-archer',
    spriteId: 'light-avatar',
    kind: UNIT_KIND.SOLDIER,
    factions: [FACTIONS.LIGHT],
    rarity: RARITY.COMMON,
    summonCost: 2,
    summonCooldown: 3,
    maxHp: 6,
    attack: 1,
    speed: 3,
    skills: [
      new RangedAttack({ cooldown: 1, cost: 0, power: 0, minRange: 2, maxRange: 3 })
    ]
  },
  {
    id: 'water-archer',
    spriteId: 'water-avatar',
    kind: UNIT_KIND.SOLDIER,
    factions: [FACTIONS.WATER],
    rarity: RARITY.COMMON,
    summonCost: 2,
    summonCooldown: 3,
    maxHp: 6,
    attack: 1,
    speed: 3,
    skills: [
      new RangedAttack({ cooldown: 1, cost: 0, power: 0, minRange: 2, maxRange: 3 })
    ]
  }
];
