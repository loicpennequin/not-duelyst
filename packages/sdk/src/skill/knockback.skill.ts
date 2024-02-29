import { PartialBy, isNumber } from '@hc/shared';
import { DealDamageAction } from '../action/deal-damage.action';
import { Entity } from '../entity/entity';
import { isEnemy } from '../entity/entity-utils';
import { GameSession } from '../game-session';
import { Point3D } from '../types';
import { Skill, SkillDescriptionContext, SkillOptions } from './skill';
import { isWithinCells, isSelf, isAxisAligned, isMinCells } from './skill-utils';
import { DisplaceAction } from '../action/displace.action';

export type KnockbackOptions = PartialBy<
  SkillOptions,
  'id' | 'spriteId' | 'name' | 'shouldExhaustCaster'
> & {
  damage: number;
  attackRatio?: number;
  collisionDamage: number;
  distance: number;
  minRange: number;
  maxRange: number;
};
export class Knockback extends Skill {
  readonly power: number;
  readonly attackRatio: number;
  readonly collisionDamage: number;
  readonly distance: number;
  readonly minRange: number | Point3D;
  readonly maxRange: number | Point3D;

  constructor(options: KnockbackOptions) {
    super({
      id: options.id ?? 'knockback',
      spriteId: options.spriteId ?? 'knockback',
      name: options.name ?? 'Knock back',
      shouldExhaustCaster: options?.shouldExhaustCaster ?? true,
      ...options
    });
    this.power = options.damage;
    this.attackRatio = options.attackRatio ?? 1;
    this.collisionDamage = options.collisionDamage;
    this.distance = options.distance;
    this.minRange = options.minRange;
    this.maxRange = options.maxRange;
  }

  getDamageAmount(attack: number) {
    return this.power + Math.ceil(attack * this.attackRatio);
  }

  getDescription(caster: SkillDescriptionContext) {
    const direction = this.distance > 0 ? 'backwards' : 'forwards';

    const collisionDamageMessage = this.collisionDamage
      ? `If it collides with a unit, they both take ${this.collisionDamage} damage.`
      : '';

    const damage = this.getDamageAmount(caster.attack);
    if (!damage) {
      return `Knocks a unit ${this.distance} tiles ${direction}. ${collisionDamageMessage}`;
    }

    return `Knocks a unit ${this.distance} tiles ${direction} and deals ${damage} damage to it. ${collisionDamageMessage}`;
  }

  isMinRange(ctx: GameSession, point: Point3D, caster: Entity) {
    const { x, y, z } = isNumber(this.minRange)
      ? { x: this.minRange, y: this.minRange, z: this.minRange }
      : this.minRange;

    return (
      isMinCells(ctx, caster.position, point, { x, y: 0, z: 0 }) ||
      isMinCells(ctx, caster.position, point, { x: 0, y, z: 0 }) ||
      isMinCells(ctx, caster.position, point, { x: 0, y: 0, z })
    );
  }

  isWithinRange(ctx: GameSession, point: Point3D, caster: Entity) {
    return (
      isWithinCells(ctx, caster.position, point, this.maxRange) &&
      this.isMinRange(ctx, point, caster) &&
      isAxisAligned(point, caster.position)
    );
  }

  isTargetable(ctx: GameSession, point: Point3D, caster: Entity) {
    return (
      this.isWithinRange(ctx, point, caster) &&
      isEnemy(ctx, ctx.entityManager.getEntityAt(point)?.id, caster.playerId)
    );
  }

  isInAreaOfEffect(ctx: GameSession, point: Point3D, caster: Entity, targets: Point3D[]) {
    return targets.some(target =>
      isSelf(
        ctx.entityManager.getEntityAt(target)!,
        ctx.entityManager.getEntityAt(point)!
      )
    );
  }

  execute(ctx: GameSession, caster: Entity, targets: Point3D[]) {
    const entities = targets.map(t => ctx.entityManager.getEntityAt(t)!);

    ctx.actionQueue.push(
      new DealDamageAction(
        {
          amount: this.getDamageAmount(caster.attack),
          sourceId: caster.id,
          targets: entities.map(e => e.id)
        },
        ctx
      )
    );

    entities.forEach(entity => {
      const { x, y, z } = entity.position;
      ctx.actionQueue.push(
        new DisplaceAction(
          {
            distance: this.distance,
            origin: caster.position,
            targetId: entity.id
          },
          ctx
        )
      );
      if (!this.collisionDamage) return;

      const obstacle = ctx.entityManager.getEntityFromRay(
        caster.position,
        { x, y, z },
        this.distance
      );

      if (obstacle) {
        ctx.actionQueue.push(
          new DealDamageAction(
            {
              amount: this.collisionDamage,
              sourceId: caster.id,
              targets: [entity.id, obstacle.id]
            },
            ctx
          )
        );
      }
    });
  }
}
