import type { PartialBy } from '@hc/shared';
import { Skill, type SkillOptions } from './skill';
import { Entity } from '../entity/entity';
import { StatModifierModifier } from '../modifier/stat-modifier.modifier';
import { GameSession } from '../game-session';
import type { Point3D } from '../types';
import { isSelf, isWithinCells } from './skill-utils';
import { isAlly, isEnemy } from '../entity/entity-utils';

export type StatModifierOptions = PartialBy<
  SkillOptions,
  'id' | 'spriteId' | 'shouldExhaustCaster'
> &
  StatModifierModifier['meta'] & { targetType: 'self' | 'ally' | 'enemy'; range: number };

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
    new StatModifierModifier(ctx, caster, {
      duration: this.duration,
      statKey: this.statKey,
      value: this.value
    }).attach(entity);
  }
}
