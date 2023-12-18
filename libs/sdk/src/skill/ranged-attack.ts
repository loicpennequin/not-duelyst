import { DealDamageAction } from '../action/deal-damage.action';
import { Entity } from '../entity/entity';
import { isEnemy } from '../entity/entity-utils';
import { GameSession } from '../game-session';
import { Point3D } from '../types';
import { Skill, SkillOptions } from './skill';
import {
  isAxisAligned,
  isSelf,
  isWithinRange,
  isMinRange,
  isMinCells,
  isWithinCells
} from './skill-utils';

export type RangedAttackOptions = SkillOptions & {
  power: number;
  minRange: number | Point3D;
  maxRange: number | Point3D;
};

export class RangedAttack extends Skill {
  readonly id = 'ranged_attack';

  public readonly power: number;
  public readonly minRange: number | Point3D;
  public readonly maxRange: number | Point3D;

  constructor(options: RangedAttackOptions) {
    super({ animationFX: 'attack', soundFX: 'attack-placeholder', ...options });
    this.power = options.power;
    this.minRange = options.minRange;
    this.maxRange = options.maxRange;
  }

  isTargetable(ctx: GameSession, point: Point3D, caster: Entity) {
    return (
      isEnemy(ctx, ctx.entityManager.getEntityAt(point)?.id, caster.playerId) &&
      isWithinCells(ctx, caster.position, point, this.maxRange) &&
      isMinCells(ctx, caster.position, point, this.minRange) &&
      isAxisAligned(point, caster.position)
    );
  }

  isInAreaOfEffect(ctx: GameSession, point: Point3D, caster: Entity, target: Point3D) {
    return isSelf(
      ctx.entityManager.getEntityAt(target)!,
      ctx.entityManager.getEntityAt(point)
    );
  }

  execute(ctx: GameSession, caster: Entity, target: Point3D) {
    const entity = ctx.entityManager.getEntityAt(target)!;
    ctx.actionQueue.push(
      new DealDamageAction(
        {
          amount: this.power,
          sourceId: caster.id,
          targets: [entity.id]
        },
        ctx
      )
    );
  }
}
