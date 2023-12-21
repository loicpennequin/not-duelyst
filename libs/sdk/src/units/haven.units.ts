import { AddEffectAction } from '../action/add-effect';
import { Entity } from '../entity/entity';
import { FACTIONS } from '../faction/faction-lookup';
import { GameSession } from '../game-session';
import { Fireball } from '../skill/fireball.skill';
import { Heal } from '../skill/heal.skill';
import { MeleeAttack } from '../skill/melee-attack.skill';
import { RangedAttack } from '../skill/ranged-attack';
import { Skill } from '../skill/skill';
import { isSelf } from '../skill/skill-utils';
import { StatModifier } from '../skill/state-modifier';
import { Point3D } from '../types';
import { UNIT_KIND } from './constants';
import { UnitBlueprint } from './unit-lookup';

export const HAVEN_UNITS: UnitBlueprint[] = [
  {
    id: 'haven-hero',
    spriteId: 'haven-hero-placeholder',
    kind: UNIT_KIND.GENERAL,
    faction: FACTIONS.haven,
    summonCost: 0,
    summonCooldown: 0,
    maxHp: 20,
    maxAp: 4,
    apRegenRate: 1,
    attack: 3,
    defense: 1,
    speed: 4,
    initiative: 8,
    skills: [
      new MeleeAttack({ cooldown: 1, cost: 0, power: 0 }),
      new Heal({ cooldown: 2, cost: 2, power: 3, range: 2 })
    ]
  },
  {
    id: 'haven-melee',
    spriteId: 'haven-melee-placeholder',
    kind: UNIT_KIND.SOLDIER,
    faction: FACTIONS.haven,
    summonCost: 2,
    summonCooldown: 1,
    maxHp: 8,
    maxAp: 3,
    apRegenRate: 1,
    attack: 3,
    defense: 0,
    speed: 4,
    initiative: 7,
    skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })]
  },
  {
    id: 'haven-archer',
    spriteId: 'haven-archer-placeholder',
    kind: UNIT_KIND.SOLDIER,
    faction: FACTIONS.haven,
    summonCost: 2,
    summonCooldown: 3,
    maxHp: 6,
    maxAp: 3,
    apRegenRate: 1,
    attack: 2,
    defense: 0,
    speed: 4,
    initiative: 7,
    skills: [
      new RangedAttack({
        cooldown: 1,
        cost: 0,
        power: 1,
        minRange: { x: 2, y: 2, z: 1 },
        maxRange: 3
      })
    ]
  },
  {
    id: 'haven-tank',
    spriteId: 'haven-tank-placeholder',
    kind: UNIT_KIND.SOLDIER,
    faction: FACTIONS.haven,
    summonCost: 2,
    summonCooldown: 4,
    maxHp: 10,
    maxAp: 3,
    apRegenRate: 1,
    attack: 3,
    defense: 1,
    speed: 3,
    initiative: 6,
    skills: [
      new MeleeAttack({ cooldown: 1, cost: 0, power: 0 }),
      new StatModifier({
        cost: 2,
        cooldown: 5,
        animationFX: 'cast',
        soundFX: 'cast-placeholder',
        spriteId: 'bulwark',
        duration: 2,
        statKey: 'defense',
        range: 0,
        targetType: 'self',
        value: 1
      })
    ]
  },
  {
    id: 'haven-caster',
    spriteId: 'haven-caster-placeholder',
    kind: UNIT_KIND.SOLDIER,
    faction: FACTIONS.haven,
    summonCost: 2,
    summonCooldown: 3,
    maxHp: 6,
    maxAp: 3,
    apRegenRate: 1,
    attack: 1,
    defense: 0,
    speed: 4,
    initiative: 7,
    skills: [
      new MeleeAttack({ cooldown: 1, cost: 0, power: 1 }),
      new Fireball({
        cost: 2,
        cooldown: 2,
        power: 3,
        range: 3,
        dotPower: 1,
        dotDuration: 2,
        spriteId: 'fireball'
      })
    ]
  }
];
