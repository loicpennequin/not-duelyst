import { PartialBy } from '@hc/shared';
import { Skill, SkillDescriptionContext, SkillOptions } from './skill';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Point3D } from '../types';
import { AddEffectAction } from '../action/add-effect.action';
import { isSelf, isWithinCells } from './skill-utils';
import { isAlly } from '../entity/entity-utils';
import { ThornsEffect } from '../effect/thorns.effect';

export type ThornsOptions = PartialBy<
  SkillOptions,
  'id' | 'spriteId' | 'shouldExhaustCaster'
> &
  ThornsEffect['meta'] & { range: number; targetType: 'self' | 'ally' };

export class Thorns extends Skill {
  public readonly meta: ThornsEffect['meta'];
  public readonly range: number;
  public readonly targetType: 'self' | 'ally';

  constructor(options: ThornsOptions) {
    super({
      id: options.id ?? 'thorns',
      animationFX: options.animationFX ?? 'cast',
      soundFX: options.soundFX ?? 'cast-placeholder',
      spriteId: options.spriteId ?? 'thorns',
      shouldExhaustCaster: options?.shouldExhaustCaster ?? true,
      ...options
    });
    this.range = options.range;
    this.targetType = options.targetType;
    this.meta = {
      power: options.power,
      duration: options.duration,
      attackRatio: options.attackRatio
    };
  }

  get attackRatio() {
    return this.meta.attackRatio ?? 1;
  }

  getDamageAmount(attack: number) {
    return this.meta.power + Math.ceil(attack * this.attackRatio);
  }

  getDescription(caster: SkillDescriptionContext) {
    const duration = isFinite(this.meta.duration)
      ? `for ${this.meta.duration} turns`
      : '';
    return `Target gets thorns ${this.getDamageAmount(caster.attack)} ${duration}.`;
  }

  isWithinRange(ctx: GameSession, point: Point3D, caster: Entity) {
    return isWithinCells(ctx, caster.position, point, this.range);
  }

  isTargetable(ctx: GameSession, point: Point3D, caster: Entity) {
    if (!this.isWithinRange(ctx, point, caster)) return false;

    switch (this.targetType) {
      case 'self':
        return isSelf(caster, ctx.entityManager.getEntityAt(point));
      case 'ally':
        return isAlly(ctx, ctx.entityManager.getEntityAt(point)?.id, caster.playerId);
    }
  }

  isInAreaOfEffect(ctx: GameSession, point: Point3D, caster: Entity, targets: Point3D[]) {
    return isWithinCells(ctx, targets[0], point, 0);
  }

  execute(ctx: GameSession, caster: Entity, [target]: Point3D[]) {
    const entity = ctx.entityManager.getEntityAt(target)!;
    ctx.actionQueue.push(
      new AddEffectAction(
        {
          sourceId: caster.id,
          attachedTo: entity.id,
          effectId: 'thorns',
          effectArg: this.meta
        },
        ctx
      )
    );
  }
}
