import { RARITY } from '../../../enums';
import { FACTIONS } from '../../../faction/faction-lookup';
import { MeleeAttack } from '../../../skill/melee-attack.skill';
import { UNIT_KIND } from '../../constants';
import type { UnitBlueprint } from '../../unit-lookup';
import { RangedAttack } from '../../../skill/ranged-attack';
import { onSummonDealDamage } from '../../../effects/on-summoned-deal-damage';
import { targetOneNearbyEnemy } from '../../../utils/on-summon-utils';
import { onSummonedTauntNearby } from '../../../effects/on-summoned-taunt-nearby';

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
    onSummoned: targetOneNearbyEnemy(),
    effects: [onSummonDealDamage(1)]
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
  }
];
