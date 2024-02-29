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
import { RangedAttack } from '../skill/ranged-attack';
import { SummonInteractableAction } from '../action/summon-interactable.action';
import { Vec3 } from '../utils/vector';
import { isEnemy, isSoldier } from '../entity/entity-utils';
import { DealDamageAction } from '../action/deal-damage.action';
import { Knockback } from '../skill/knockback.skill';

// export const NEUTRAL_UNITS: UnitBlueprint[] = [
//   {
//     id: 'neutral-healer',
//     spriteId: 'neutral-healer',
//     kind: UNIT_KIND.SOLDIER,
//     faction: FACTIONS.neutral,
//     summonCost: 2,
//     summonCooldown: 4,
//     maxHp: 7,
//     attack: 1,
//     speed: 3,
//     skills: [
//       new MeleeAttack({ cooldown: 1, cost: 0, power: 0 }),
//       new Heal({ cooldown: 2, cost: 2, power: 3, range: 2 })
//     ],
//     onSummoned: {
//       getDescription() {
//         return 'Restore 2 hp to all nearby allies.';
//       },
//       minTargetCount: 0,
//       maxTargetCount: 0,
//       isTargetable() {
//         return false;
//       },
//       execute(ctx, targets, summonedEntity) {
//         ctx.actionQueue.push(
//           new HealAction(
//             {
//               amount: 2,
//               sourceId: summonedEntity.id,
//               targets: ctx.entityManager
//                 .getNearbyAllies(summonedEntity.position, summonedEntity.playerId)
//                 .map(ally => ally.id)
//             },
//             ctx
//           )
//         );
//       }
//     }
//   },

//   {
//     id: 'neutral-tank',
//     spriteId: 'neutral-tank',
//     kind: UNIT_KIND.SOLDIER,
//     faction: FACTIONS.neutral,
//     summonCost: 3,
//     summonCooldown: 4,
//     maxHp: 8,
//     attack: 2,
//     speed: 3,
//     skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })],
//     onSummoned: {
//       getDescription() {
//         return 'Taunt nearby enemies for 1 turn';
//       },
//       minTargetCount: 0,
//       maxTargetCount: 0,
//       isTargetable() {
//         return false;
//       },
//       execute(ctx, targets, summonedEntity) {
//         const nearby = ctx.entityManager.getNearbyEnemies(
//           summonedEntity.position,
//           summonedEntity.playerId
//         );

//         nearby.forEach(entity => {
//           ctx.actionQueue.push(
//             new AddEffectAction(
//               {
//                 attachedTo: entity.id,
//                 effectId: 'taunted',
//                 effectArg: { duration: 1, radius: 1 },
//                 sourceId: summonedEntity.id
//               },
//               ctx
//             )
//           );
//         });
//       }
//     }
//   },

//   {
//     id: 'neutral-thief',
//     spriteId: 'neutral-thief',
//     kind: UNIT_KIND.SOLDIER,
//     faction: FACTIONS.neutral,
//     summonCost: 3,
//     summonCooldown: 4,
//     maxHp: 5,
//     attack: 2,
//     speed: 3,
//     skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })],
//     effects: [
//       {
//         description: `Rush`,
//         getEffect: (ctx, entity) => {
//           return new RushEffect(ctx, entity, {});
//         }
//       },
//       {
//         description: `When this unit takes down an enemy, gain 2 gold.`,
//         getEffect: (ctx, entity) => {
//           return new PlunderOnKillEffect(ctx, entity, {
//             duration: Infinity,
//             amount: 2
//           });
//         }
//       }
//     ]
//   },

//   {
//     id: 'neutral-willowisp',
//     spriteId: 'neutral-willowisp',
//     kind: UNIT_KIND.SOLDIER,
//     faction: FACTIONS.neutral,
//     summonCost: 1,
//     summonCooldown: 2,
//     maxHp: 1,
//     attack: 1,
//     speed: 4,
//     skills: [new MeleeAttack({ cooldown: 1, cost: 0, power: 0 })],
//     effects: [
//       {
//         description: `When this unit dies, deal 2 damage to nearby enemies.`,
//         getEffect: (ctx, entity) => {
//           return new AoeOnDeathEffect(ctx, entity, {
//             power: 2,
//             attackRatio: 0
//           });
//         }
//       }
//     ]
//   },

//   {
//     id: 'neutral-titan',
//     spriteId: 'neutral-titan',
//     kind: UNIT_KIND.SOLDIER,
//     faction: FACTIONS.neutral,
//     summonCost: 5,
//     summonCooldown: 6,
//     maxHp: 12,
//     attack: 5,
//     speed: 2,
//     skills: [
//       new MeleeAttack({
//         cooldown: 1,
//         cost: 0,
//         power: 0,
//         splash: true,
//         splashAttackRatio: 0.5
//       })
//     ]
//   },

//   {
//     id: 'neutral-midas',
//     spriteId: 'neutral-midas',
//     kind: UNIT_KIND.SOLDIER,
//     faction: FACTIONS.neutral,
//     summonCost: 5,
//     summonCooldown: 6,
//     maxHp: 8,
//     attack: 4,
//     speed: 3,
//     skills: [
//       new RangedAttack({ cooldown: 1, cost: 0, power: 0, minRange: 2, maxRange: 4 })
//     ],
//     onSummoned: {
//       getDescription() {
//         return 'Create a gold coin on each unoccupied side of this unit.';
//       },
//       minTargetCount: 0,
//       maxTargetCount: 0,
//       isTargetable() {
//         return false;
//       },
//       execute(ctx, targets, caster) {
//         const cells = [
//           ctx.map.getCellAt(Vec3.add(caster.position, { x: 1, y: 0, z: 0 })),
//           ctx.map.getCellAt(Vec3.add(caster.position, { x: -1, y: 0, z: 0 })),
//           ctx.map.getCellAt(Vec3.add(caster.position, { x: 0, y: 1, z: 0 })),
//           ctx.map.getCellAt(Vec3.add(caster.position, { x: 0, y: -1, z: 0 }))
//         ];
//         cells.forEach(cell => {
//           if (!cell?.isWalkable) return;
//           if (ctx.entityManager.getEntityAt(cell)) return;
//           ctx.actionQueue.push(
//             new SummonInteractableAction(
//               {
//                 id: 'GOLD_COIN',
//                 position: cell.position
//               },
//               ctx
//             )
//           );
//         });
//       }
//     }
//   },

//   {
//     id: 'neutral-ice-queen',
//     spriteId: 'neutral-ice-queen',
//     kind: UNIT_KIND.SOLDIER,
//     faction: FACTIONS.neutral,
//     summonCost: 4,
//     summonCooldown: 5,
//     maxHp: 6,
//     attack: 2,
//     speed: 3,
//     skills: [
//       new RangedAttack({ cooldown: 1, cost: 0, power: 0, minRange: 2, maxRange: 3 })
//     ],
//     onSummoned: {
//       getDescription() {
//         return 'Freezes all nearby enemy soldiers for 2 turns ans deal 2 true damage to them.';
//       },
//       minTargetCount: 0,
//       maxTargetCount: 0,
//       isTargetable() {
//         return false;
//       },
//       execute(ctx, targets, caster) {
//         const enemies = ctx.entityManager
//           .getNearbyEnemies(caster.position, caster.playerId)
//           .filter(isSoldier);
//         ctx.actionQueue.push(
//           new DealDamageAction(
//             {
//               amount: 2,
//               sourceId: caster.id,
//               targets: enemies.map(e => e.id)
//             },
//             ctx
//           )
//         );
//         enemies.forEach(enemy => {
//           ctx.actionQueue.push(
//             new AddEffectAction(
//               {
//                 effectId: 'frozen',
//                 attachedTo: enemy.id,
//                 sourceId: caster.id,
//                 effectArg: {
//                   duration: 2
//                 }
//               },
//               ctx
//             )
//           );
//         });
//       }
//     }
//   },

//   {
//     id: 'neutral-ice-mage',
//     spriteId: 'neutral-ice-mage',
//     kind: UNIT_KIND.SOLDIER,
//     faction: FACTIONS.neutral,
//     summonCost: 3,
//     summonCooldown: 4,
//     maxHp: 5,
//     attack: 2,
//     speed: 3,
//     skills: [
//       new RangedAttack({ cooldown: 1, cost: 0, power: 0, minRange: 2, maxRange: 3 })
//     ],
//     onSummoned: {
//       getDescription() {
//         return 'Freeze an enemy for one turn';
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
//       execute(ctx, targets, summonedentity) {
//         targets.forEach(target => {
//           const entity = ctx.entityManager.getEntityAt(target)!;
//           ctx.actionQueue.push(
//             new AddEffectAction(
//               {
//                 effectId: 'frozen',
//                 attachedTo: entity.id,
//                 sourceId: summonedentity.id,
//                 effectArg: {
//                   duration: 1
//                 }
//               },
//               ctx
//             )
//           );
//         });
//       }
//     }
//   },

//   {
//     id: 'neutral-blind-monk',
//     spriteId: 'neutral-blind-monk',
//     kind: UNIT_KIND.SOLDIER,
//     faction: FACTIONS.neutral,
//     summonCost: 4,
//     summonCooldown: 4,
//     maxHp: 7,
//     attack: 2,
//     speed: 3,
//     skills: [
//       new MeleeAttack({ cooldown: 1, cost: 0, power: 0 }),
//       new Knockback({
//         name: 'IKOU !',
//         collisionDamage: 3,
//         cooldown: 3,
//         cost: 3,
//         damage: 2,
//         distance: 3,
//         minRange: 0,
//         maxRange: 1
//       })
//     ],
//     effects: [
//       {
//         description: `Rush`,
//         getEffect: (ctx, entity) => {
//           return new RushEffect(ctx, entity, {});
//         }
//       }
//     ]
//   }
// ];
