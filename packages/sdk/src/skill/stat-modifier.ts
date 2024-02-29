import { PartialBy } from '@hc/shared';
import { Skill, SkillOptions } from './skill';
import { Entity } from '../entity/entity';
import { StatModifierEffect } from '../effect/stat-modifier.effect';
import { GameSession } from '../game-session';
import { Point3D } from '../types';
import { AddEffectAction } from '../action/add-effect.action';
import { isSelf, isWithinCells } from './skill-utils';
import { isAlly, isEnemy } from '../entity/entity-utils';

export type StatModifierOptions = PartialBy<
  SkillOptions,
  'id' | 'spriteId' | 'shouldExhaustCaster'
> &
  StatModifierEffect['meta'] & { targetType: 'self' | 'ally' | 'enemy'; range: number };

export class StatModifier extends Skill {
  public readonly value: StatModifierOptions['value'];
  public readonly statKey: StatModifierOptions['statKey'];
  public readonly duration: StatModifierOptions['duration'];
  public readonly targetType: 'self' | 'ally' | 'enemy';
  public readonly range: number;

  constructor(options: StatModifierOptions) {
    super({
      id: options.id ?? 'sta_modifier',
      animationFX: options.animationFX ?? 'cast',
      soundFX: options.soundFX ?? 'cast-placeholder',
      spriteId: options.spriteId ?? 'melee_attack',
      shouldExhaustCaster: options.shouldExhaustCaster ?? true,
      ...options
    });
    this.value = options.value;
    this.statKey = options.statKey;
    this.duration = options.duration;
    this.targetType = options.targetType;
    this.range = options.range;
  }

  getDescription() {
    switch (this.targetType) {
      case 'self':
        return `Get ${this.value} ${this.statKey} for ${this.duration} turns.`;
      case 'ally':
        return `Give an ally ${this.value} ${this.statKey} for ${this.duration} turns.`;
      case 'enemy':
        return `Give an enemy ${this.value} ${this.statKey} for ${this.duration} turns.`;
    }
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
      case 'enemy':
        return isEnemy(ctx, ctx.entityManager.getEntityAt(point)?.id, caster.playerId);
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
          effectId: 'statModifier',
          effectArg: { duration: this.duration, statKey: this.statKey, value: this.value }
        },
        ctx
      )
    );
  }
}
