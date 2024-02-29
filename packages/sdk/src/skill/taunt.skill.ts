import { PartialBy } from '@hc/shared';
import { Skill, SkillOptions } from './skill';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Point3D } from '../types';
import { AddEffectAction } from '../action/add-effect.action';
import { isSelf, isWithinCells } from './skill-utils';
import { TauntedEffect } from '../effect/taunted.effect';
import { isEnemy } from '../entity/entity-utils';

export type TauntOptions = PartialBy<
  SkillOptions,
  'id' | 'spriteId' | 'shouldExhaustCaster'
> &
  TauntedEffect['meta'];

export class Taunt extends Skill {
  public readonly meta: TauntedEffect['meta'];
  public readonly duration: number;

  constructor(options: TauntOptions) {
    super({
      id: options.id ?? 'taunt',
      animationFX: options.animationFX ?? 'cast',
      soundFX: options.soundFX ?? 'cast-placeholder',
      spriteId: options.spriteId ?? 'taunt',
      shouldExhaustCaster: options?.shouldExhaustCaster ?? true,
      ...options
    });
    this.duration = options.duration;
    this.meta = {
      duration: options.duration,
      radius: options.radius
    };
  }

  getDescription() {
    const duration = isFinite(this.meta.duration) ? `for ${this.meta.duration}` : '';
    return `Taunts enemies in a ${this.meta.radius} cell range for ${duration} turns.`;
  }

  isWithinRange(ctx: GameSession, point: Point3D, caster: Entity) {
    return isSelf(caster, ctx.entityManager.getEntityAt(point));
  }

  isTargetable(ctx: GameSession, point: Point3D, caster: Entity) {
    return this.isWithinRange(ctx, point, caster);
  }

  isInAreaOfEffect(ctx: GameSession, point: Point3D, caster: Entity) {
    return (
      isWithinCells(ctx, caster.position, point, this.meta.radius) &&
      isEnemy(ctx, ctx.entityManager.getEntityAt(point)?.id, caster.playerId)
    );
  }

  execute(
    ctx: GameSession,
    caster: Entity,
    targets: Point3D[],
    affectedCells: Point3D[]
  ) {
    affectedCells.forEach(target => {
      const entity = ctx.entityManager.getEntityAt(target);
      ctx.actionQueue.push(
        new AddEffectAction(
          {
            sourceId: caster.id,
            attachedTo: entity!.id,
            effectId: 'taunted',
            effectArg: this.meta
          },
          ctx
        )
      );
    });
  }
}
