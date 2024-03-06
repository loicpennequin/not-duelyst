import { RARITY } from '../../../enums';
import { FACTIONS } from '../../../faction/faction-lookup';
import { MeleeAttack } from '../../../skill/melee-attack.skill';
import { UNIT_KIND } from '../../constants';
import type { UnitBlueprint } from '../../unit-lookup';
import { RangedAttack } from '../../../skill/ranged-attack';
import { targetOneEnemy } from '../../../utils/on-summon-utils';
import { onSummonedTauntNearby } from '../../../effects/on-summoned-taunt-nearby';
import { onSummonedHealNearby } from '../../../effects/on-summoned-heal-nearby';
import { Heal } from '../../../skill/heal.skill';
import { KEYWORDS } from '../../../utils/keywords';
import { addModifierToSelf } from '../../../effects/add-modifier-to-self';
import { Burn } from '../../../skill/burn.skill';
import { addModifierToTargets } from '../../../effects/add-modifier-to-targets';
import { StatModifier } from '../../../skill/stat-modifier';
import { onSummonedFreezeNearby } from '../../../effects/on-summoned-freeze-nearby';
import { RushModifier } from '../../../modifier/rush.modifier';
import { PlunderOnKillModifier } from '../../../modifier/plunder-on-kill.modifier';
import { VigilantModifier } from '../../../modifier/vigilant.modifier';
import { LoneWolfStatModifierModifier } from '../../../modifier/lone-wolf-stat-modifier.modifier';
import { StunnedModifier } from '../../../modifier/frozen.modifier';

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
    skills: [
      new MeleeAttack({ cooldown: 1, power: 0 }),
      new Burn({
        cooldown: 3,
        duration: Infinity,
        power: 2,
        name: 'Ignite',
        range: 3,
        attackRatio: 0,
        allowGeneralAsTarget: false
      })
    ]
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
    skills: [
      new MeleeAttack({ cooldown: 1, power: 0 }),
      new StatModifier({
        cooldown: 3,
        duration: 3,
        name: 'Slow',
        range: 3,
        statKey: 'speed',
        value: -1,
        targetType: 'enemy',
        spriteId: 'meditate'
      })
    ]
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
    skills: [new MeleeAttack({ cooldown: 1, power: 0 })]
  },
  {
    id: 'neutral-archer',
    spriteId: 'neutral-archer',
    factions: [],
    kind: UNIT_KIND.SOLDIER,
    rarity: RARITY.COMMON,
    summonCost: 2,
    summonCooldown: 3,
    attack: 1,
    maxHp: 6,
    speed: 3,
    skills: [new RangedAttack({ cooldown: 1, power: 0, minRange: 2, maxRange: 3 })]
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
    effects: [onSummonedTauntNearby()]
  },
  {
    id: 'neutral-healer',
    spriteId: 'neutral-healer',
    factions: [],
    kind: UNIT_KIND.SOLDIER,
    rarity: RARITY.COMMON,
    summonCost: 3,
    summonCooldown: 4,
    attack: 1,
    maxHp: 5,
    speed: 3,
    skills: [
      new MeleeAttack({ cooldown: 1, power: 0 }),
      new Heal({ cooldown: 2, power: 3, range: 3 })
    ],
    effects: [onSummonedHealNearby(2)]
  },
  {
    id: 'neutral-thief',
    spriteId: 'neutral-thief',
    factions: [],
    kind: UNIT_KIND.SOLDIER,
    rarity: RARITY.COMMON,
    summonCost: 3,
    summonCooldown: 4,
    attack: 2,
    maxHp: 4,
    speed: 3,
    skills: [new MeleeAttack({ cooldown: 1, power: 0 })],
    effects: [
      addModifierToSelf(RushModifier, {
        meta: {},
        description: 'Rush',
        keywords: [KEYWORDS?.RUSH]
      }),
      addModifierToSelf(PlunderOnKillModifier, {
        meta: { amount: 2, duration: Infinity },
        description: 'Slay: Plunder(2)',
        keywords: [KEYWORDS.PLUNDER, KEYWORDS.SLAY]
      })
    ]
  },
  {
    id: 'fire-fighter',
    spriteId: 'fire-fighter',
    factions: [FACTIONS.FIRE],
    kind: UNIT_KIND.SOLDIER,
    rarity: RARITY.RARE,
    summonCost: 4,
    summonCooldown: 4,
    attack: 3,
    maxHp: 7,
    speed: 3,
    skills: [new MeleeAttack({ power: 0, cooldown: 1 })],
    effects: [
      addModifierToSelf(VigilantModifier, {
        meta: { duration: Infinity },
        description: 'Vigilant.',
        keywords: [KEYWORDS.VIGILANT]
      }),
      addModifierToSelf(LoneWolfStatModifierModifier, {
        meta: { statKey: 'attack', value: 1 },
        description: 'Lone wolf: +1 attack.',
        keywords: [KEYWORDS.LONE_WOLF]
      })
    ]
  },
  {
    id: 'ice-mage',
    spriteId: 'ice-mage',
    factions: [FACTIONS.WATER],
    kind: UNIT_KIND.SOLDIER,
    rarity: RARITY.RARE,
    summonCost: 4,
    summonCooldown: 4,
    attack: 2,
    maxHp: 6,
    speed: 3,
    skills: [new RangedAttack({ power: 0, cooldown: 1, minRange: 2, maxRange: 3 })],
    onSummoned: targetOneEnemy(4),
    effects: [
      addModifierToTargets(StunnedModifier, {
        meta: { duration: 1 },
        description: 'Summon: Freeze an enemy',
        keywords: [KEYWORDS.SUMMON, KEYWORDS.FROZEN]
      })
    ]
  },
  {
    id: 'ice-queen',
    spriteId: 'ice-queen',
    kind: UNIT_KIND.SOLDIER,
    factions: [FACTIONS.WATER, FACTIONS.WATER],
    rarity: RARITY.EPIC,
    summonCost: 5,
    summonCooldown: 5,
    attack: 2,
    maxHp: 7,
    speed: 3,
    skills: [
      new MeleeAttack({ power: 0, cooldown: 1 }),
      new RangedAttack({
        cooldown: 2,
        minRange: 2,
        maxRange: 3,
        power: 1,
        spriteId: 'ice-spike'
      })
    ],
    effects: [onSummonedFreezeNearby()]
  }
];
