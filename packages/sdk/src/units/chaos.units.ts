import { isGeneral } from '../entity/entity-utils';
import { FACTIONS } from '../faction/faction-lookup';
import { Fireball } from '../skill/fireball.skill';
import { MeleeAttack } from '../skill/melee-attack.skill';
import { RangedAttack } from '../skill/ranged-attack';
import { StatModifier } from '../skill/stat-modifier';
import { UNIT_KIND } from './constants';
import { UnitBlueprint } from './unit-lookup';
import { Knockback } from '../skill/knockback.skill';
import { Thorns } from '../skill/thorns.skill';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Point3D } from '../types';
import { SummonInteractable } from '../skill/summon-interactable.skill';
import { ImmolateEffect } from '../effect/immolate.effect';
import { Teleport } from '../skill/teleport.skill';
import { ExecuteEffect } from '../effect/execute.effect';

// export const CHAOS_UNITS: UnitBlueprint[] = [
//   {
//     id: 'chaos-hero',
//     spriteId: 'chaos-hero2',
//     kind: UNIT_KIND.GENERAL,
//     faction: FACTIONS.chaos,
//     summonCost: 0,
//     summonCooldown: 0,
//     maxHp: 25,
//     attack: 2,
//     speed: 3,
//     skills: [
//       new MeleeAttack({ cooldown: 1, cost: 0, power: 0 }),
//       new (class extends StatModifier {
//         getDescription() {
//           return `Give an ally ${this.value} ${this.statKey}.`;
//         }
//         isTargetable(ctx: GameSession, point: Point3D, caster: Entity): boolean {
//           return (
//             super.isTargetable(ctx, point, caster) &&
//             !isGeneral(ctx.entityManager.getEntityAt(point))
//           );
//         }
//       })({
//         cost: 2,
//         cooldown: 3,
//         spriteId: 'bloodlust',
//         name: 'Blood lust',
//         duration: Infinity,
//         range: 3,
//         statKey: 'attack',
//         targetType: 'ally',
//         value: 1
//       })
//     ]
//   },
//   {
//     id: 'chaos-melee',
//     spriteId: 'chaos-melee',
//     kind: UNIT_KIND.SOLDIER,
//     faction: FACTIONS.chaos,
//     summonCost: 2,
//     summonCooldown: 4,
//     maxHp: 7,
//     attack: 2,
//     speed: 3,
//     skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })]
//   },
//   {
//     id: 'chaos-archer',
//     spriteId: 'chaos-archer',
//     kind: UNIT_KIND.SOLDIER,
//     faction: FACTIONS.chaos,
//     summonCost: 2,
//     summonCooldown: 4,
//     maxHp: 6,
//     attack: 1,
//     speed: 3,
//     skills: [
//       new RangedAttack({
//         cooldown: 1,
//         cost: 0,
//         power: 0,
//         minRange: { x: 2, y: 2, z: 1 },
//         maxRange: 3
//       }),
//       new Knockback({
//         collisionDamage: 1,
//         cooldown: 2,
//         cost: 2,
//         damage: 1,
//         distance: 2,
//         attackRatio: 0,
//         minRange: 0,
//         maxRange: 3
//       })
//     ]
//   },
//   {
//     id: 'chaos-tank',
//     spriteId: 'chaos-tank',
//     kind: UNIT_KIND.SOLDIER,
//     faction: FACTIONS.chaos,
//     summonCost: 3,
//     summonCooldown: 5,
//     maxHp: 8,
//     attack: 3,
//     speed: 2,
//     effects: [
//       {
//         getEffect: (ctx, entity) =>
//           new ImmolateEffect(ctx, entity, {
//             duration: Infinity,
//             power: 1
//           }),
//         description: 'Deals 1 damage to nearby enemies at the beginning of your turn.'
//       }
//     ],
//     skills: [
//       new MeleeAttack({ cooldown: 1, cost: 0, power: 0 }),
//       new Thorns({
//         cost: 2,
//         cooldown: 5,
//         name: 'Thorns',
//         duration: 3,
//         range: 0,
//         targetType: 'self',
//         power: 1,
//         attackRatio: 0,
//         shouldExhaustCaster: false
//       })
//     ]
//   },
//   {
//     id: 'chaos-caster',
//     spriteId: 'chaos-caster',
//     kind: UNIT_KIND.SOLDIER,
//     faction: FACTIONS.chaos,
//     summonCost: 4,
//     summonCooldown: 4,
//     maxHp: 6,
//     attack: 1,
//     speed: 3,
//     skills: [
//       new RangedAttack({
//         cooldown: 1,
//         cost: 0,
//         power: 0,
//         minRange: { x: 2, y: 2, z: 1 },
//         maxRange: 3
//       }),
//       new Fireball({
//         cost: 2,
//         cooldown: 3,
//         power: 3,
//         range: 3,
//         dotPower: 1,
//         dotDuration: 2,
//         spriteId: 'fireball'
//       }),
//       new SummonInteractable({
//         cooldown: 4,
//         cost: 3,
//         interactableId: 'FIREWALL',
//         spriteId: 'firewall',
//         minTargets: 1,
//         maxTargets: 3,
//         name: 'Firewall',
//         allowSeparatedTargets: false,
//         allowNonempty: true
//       })
//     ]
//   },
//   {
//     id: 'chaos-executioner',
//     spriteId: 'chaos-executioner',
//     kind: UNIT_KIND.SOLDIER,
//     faction: FACTIONS.chaos,
//     summonCost: 4,
//     summonCooldown: 5,
//     maxHp: 8,
//     attack: 3,
//     speed: 3,
//     skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })],
//     effects: [
//       {
//         getEffect(ctx, entity) {
//           return new ExecuteEffect(ctx, entity, { duration: Infinity, threshold: 0.25 });
//         },
//         description: 'Whenever a unit drops below 25% HP nearby this unit, destroy it.'
//       }
//     ]
//   },
//   {
//     id: 'chaos-bomber',
//     spriteId: 'chaos-bomber',
//     kind: UNIT_KIND.SOLDIER,
//     faction: FACTIONS.chaos,
//     summonCost: 3,
//     summonCooldown: 5,
//     maxHp: 6,
//     attack: 1,
//     speed: 3,
//     skills: [
//       new RangedAttack({
//         cooldown: 1,
//         cost: 0,
//         power: 0,
//         minRange: { x: 2, y: 2, z: 1 },
//         maxRange: 3
//       }),
//       new RangedAttack({
//         id: 'bomb',
//         spriteId: 'bomb',
//         cooldown: 3,
//         cost: 2,
//         power: 1,
//         minRange: { x: 3, y: 3, z: 1 },
//         maxRange: 4,
//         splash: true
//       })
//     ]
//   },
//   {
//     id: 'chaos-assasin',
//     spriteId: 'chaos-assasin',
//     kind: UNIT_KIND.SOLDIER,
//     faction: FACTIONS.chaos,
//     summonCost: 3,
//     summonCooldown: 5,
//     maxHp: 5,
//     attack: 3,
//     speed: 3,
//     skills: [
//       new MeleeAttack({ cooldown: 1, cost: 0, power: 0, shouldExhaustCaster: false }),
//       new Teleport({
//         cooldown: 3,
//         cost: 2,
//         maxRange: 3,
//         minRange: 0
//       })
//     ]
//   }
// ];
