import { PartialBy, Prettify } from '@hc/shared';
import { Skill, SkillOptions } from './skill';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Point3D } from '../types';
import { AddEffectAction } from '../action/add-effect.action';
import { isSelf, isWithinCells } from './skill-utils';
import { isEnemy } from '../entity/entity-utils';
import { VulnerableEffect } from '../effect/vulnerable.effect';

export type VulnerableOptions = PartialBy<
  SkillOptions,
  'id' | 'spriteId' | 'shouldExhaustCaster'
> &
  VulnerableEffect['meta'] & { range: number };

export class Vulnerable extends Skill {
  public readonly meta: VulnerableEffect['meta'];
  public readonly duration: number;
  public readonly range: number;

  constructor(options: VulnerableOptions) {
    super({
      id: options.id ?? 'taunt',
      animationFX: options.animationFX ?? 'cast',
      soundFX: options.soundFX ?? 'cast-placeholder',
      spriteId: options.spriteId ?? 'vulnerable',
      shouldExhaustCaster: options?.shouldExhaustCaster ?? true,
      ...options
    });
    this.duration = options.duration;
    this.range = options.range;
    this.meta = {
      duration: options.duration
    };
  }

  getDescription() {
    const duration = isFinite(this.meta.duration) ? `for ${this.meta.duration}` : '';
    return `Inflicts vulnerable to up to ${this.maxTargets} targets for ${duration} turns`;
  }

  isWithinRange(ctx: GameSession, point: Point3D, caster: Entity) {
    return isSelf(caster, ctx.entityManager.getEntityAt(point));
  }

  isTargetable(ctx: GameSession, point: Point3D, caster: Entity) {
    return this.isWithinRange(ctx, point, caster);
  }

  isInAreaOfEffect(ctx: GameSession, point: Point3D, caster: Entity) {
    return (
      isWithinCells(ctx, caster.position, point, this.range) &&
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
            effectId: 'vulnerable',
            effectArg: this.meta
          },
          ctx
        )
      );
    });
  }
}
