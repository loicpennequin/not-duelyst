import { isDefined } from '@hc/shared';
import { DealDamageAction } from '../action/deal-damage.action';
import { isAlly, isEnemy } from '../entity/entity-utils';
import { FACTIONS } from '../faction/faction-lookup';
import { Fireball } from '../skill/fireball.skill';
import { Heal } from '../skill/heal.skill';
import { MeleeAttack } from '../skill/melee-attack.skill';
import { RangedAttack } from '../skill/ranged-attack';
import { isSelf, isWithinCells } from '../skill/skill-utils';
import { UNIT_KIND } from './constants';
import { UnitBlueprint } from './unit-lookup';
import { Knockback } from '../skill/knockback.skill';
import { SummonInteractable } from '../skill/summon-interactable.skill';
import { Taunt } from '../skill/taunt.skill';
import { Skill } from '../skill/skill';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Cell } from '../map/cell';
import { Point3D } from '../types';
import { HealAction } from '../action/heal.action';
import { ToughEffect } from '../effect/tough.effect';
import { Vulnerable } from '../skill/vulnerable.skill';
import { AddEffectAction } from '../action/add-effect.action';

// export const HAVEN_UNITS: UnitBlueprint[] = [
//   {
//     id: 'haven-hero',
//     spriteId: 'haven-hero2',
//     kind: UNIT_KIND.GENERAL,
//     faction: FACTIONS.haven,
//     summonCost: 0,
//     summonCooldown: 0,
//     maxHp: 25,
//     attack: 2,
//     speed: 3,
//     skills: [
//       new MeleeAttack({ cooldown: 1, cost: 0, power: 0 }),
//       new Heal({ cooldown: 2, cost: 2, power: 3, range: 2 })
//     ]
//   },
//   {
//     id: 'haven-melee',
//     spriteId: 'haven-melee',
//     kind: UNIT_KIND.SOLDIER,
//     faction: FACTIONS.haven,
//     summonCost: 2,
//     summonCooldown: 4,
//     maxHp: 7,
//     attack: 2,
//     speed: 3,
//     skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })]
//   },
//   {
//     id: 'haven-archer',
//     spriteId: 'haven-archer',
//     kind: UNIT_KIND.SOLDIER,
//     faction: FACTIONS.haven,
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
//     id: 'haven-tank',
//     spriteId: 'haven-tank',
//     kind: UNIT_KIND.SOLDIER,
//     faction: FACTIONS.haven,
//     summonCost: 3,
//     summonCooldown: 5,
//     maxHp: 8,
//     attack: 3,
//     speed: 2,
//     skills: [
//       new MeleeAttack({ cooldown: 1, cost: 0, power: 0 }),
//       new Taunt({
//         name: 'Taunt',
//         cooldown: 3,
//         cost: 2,
//         duration: 2,
//         radius: 1
//       })
//     ],
//     effects: [
//       {
//         description: 'Tough',
//         getEffect: (ctx, entity) =>
//           new ToughEffect(ctx, entity, {
//             duration: Infinity
//           })
//       }
//     ]
//   },
//   {
//     id: 'haven-caster',
//     spriteId: 'haven-caster',
//     kind: UNIT_KIND.SOLDIER,
//     faction: FACTIONS.haven,
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
//     id: 'haven-paladin',
//     spriteId: 'haven-paladin',
//     kind: UNIT_KIND.SOLDIER,
//     faction: FACTIONS.haven,
//     summonCost: 4,
//     summonCooldown: 5,
//     maxHp: 8,
//     attack: 2,
//     speed: 3,
//     skills: [
//       new MeleeAttack({ cooldown: 1, cost: 0, power: 0 }),
//       new (class extends Skill {
//         isWithinRange(ctx: GameSession, point: Point3D, caster: Entity) {
//           return isSelf(caster, ctx.entityManager.getEntityAt(point));
//         }

//         isTargetable(ctx: GameSession, point: Point3D, caster: Entity) {
//           return isSelf(caster, ctx.entityManager.getEntityAt(point));
//         }

//         isInAreaOfEffect(ctx: GameSession, point: Point3D, caster: Entity) {
//           return (
//             isWithinCells(ctx, caster.position, point, 1) &&
//             !isSelf(caster, ctx.entityManager.getEntityAt(point))
//           );
//         }

//         getDescription() {
//           return 'Deals 3 true damage to nearby enemies and heal 3hp to nearby allies';
//         }

//         execute(
//           ctx: GameSession,
//           caster: Entity,
//           targets: Point3D[],
//           affectedCells: Cell[]
//         ) {
//           const entities = affectedCells
//             .map(cell => ctx.entityManager.getEntityAt(cell.position))
//             .filter(isDefined);

//           ctx.actionQueue.push(
//             new DealDamageAction(
//               {
//                 amount: 3,
//                 sourceId: caster.id,
//                 targets: entities
//                   .filter(e => isEnemy(ctx, e.id, caster.playerId))
//                   .map(e => e.id)
//               },
//               ctx
//             )
//           );
//           ctx.actionQueue.push(
//             new HealAction(
//               {
//                 amount: 3,
//                 sourceId: caster.id,
//                 targets: entities
//                   .filter(e => isAlly(ctx, e.id, caster.playerId))
//                   .map(e => e.id)
//               },
//               ctx
//             )
//           );
//         }
//       })({
//         id: 'consecration',
//         cooldown: 3,
//         cost: 3,
//         name: 'Consecration',
//         shouldExhaustCaster: true,
//         spriteId: 'consecration',
//         animationFX: 'cast',
//         minTargets: 1,
//         maxTargets: 1,
//         soundFX: 'cast-placeholder'
//       })
//     ]
//   },
//   {
//     id: 'haven-caster-2',
//     spriteId: 'haven-caster-2',
//     kind: UNIT_KIND.SOLDIER,
//     faction: FACTIONS.haven,
//     summonCost: 3,
//     summonCooldown: 4,
//     maxHp: 6,
//     attack: 1,
//     speed: 3,
//     onSummoned: {
//       getDescription() {
//         return 'Deal 2 damage to a unit.';
//       },
//       minTargetCount: 0,
//       maxTargetCount: 1,
//       isTargetable(ctx, point) {
//         return isEnemy(
//           ctx,
//           ctx.entityManager.getEntityAt(point)?.id,
//           ctx.playerManager.getActivePlayer().id
//         );
//       },
//       execute(ctx, targets, caster) {
//         ctx.actionQueue.push(
//           new DealDamageAction(
//             {
//               amount: 2,
//               sourceId: caster.id,
//               targets: targets
//                 .map(point => ctx.entityManager.getEntityAt(point)?.id)
//                 .filter(isDefined)
//             },
//             ctx
//           )
//         );
//       }
//     },
//     skills: [
//       new RangedAttack({
//         cooldown: 1,
//         cost: 0,
//         power: 0,
//         minRange: { x: 2, y: 2, z: 1 },
//         maxRange: 3
//       }),
//       new Vulnerable({
//         cooldown: 3,
//         cost: 2,
//         duration: 3,
//         name: 'Weaken',
//         range: 4,
//         maxTargets: 1
//       })
//     ]
//   },

//   {
//     id: 'haven-smasher',
//     spriteId: 'haven-smasher',
//     kind: UNIT_KIND.SOLDIER,
//     faction: FACTIONS.haven,
//     summonCost: 4,
//     summonCooldown: 5,
//     maxHp: 7,
//     attack: 3,
//     speed: 3,
//     skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })],
//     onSummoned: {
//       minTargetCount: 0,
//       maxTargetCount: 0,
//       isTargetable() {
//         return false;
//       },
//       getDescription() {
//         return 'Grant nearby allies +1 Attack this turn';
//       },
//       execute(ctx, targets, summonedentity) {
//         const nearby = ctx.entityManager.getNearbyAllies(
//           summonedentity.position,
//           summonedentity.playerId
//         );

//         nearby.forEach(entity => {
//           ctx.actionQueue.push(
//             new AddEffectAction(
//               {
//                 attachedTo: entity.id,
//                 sourceId: summonedentity.id,
//                 effectId: 'statModifier',
//                 effectArg: {
//                   duration: 1,
//                   statKey: 'attack',
//                   value: 1
//                 }
//               },
//               ctx
//             )
//           );
//         });
//       }
//     }
//   }
// ];
