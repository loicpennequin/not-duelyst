import { type PartialBy } from '@hc/shared';
import { Skill, type SkillDescriptionContext, type SkillOptions } from './skill';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { type Point3D } from '../types';
import { isWithinCells } from './skill-utils';
import { isEnemy, isGeneral } from '../entity/entity-utils';
import { BurnModifier } from '../modifier/burn.modifier';
import { KEYWORDS } from '../utils/keywords';

export type BurnOptions = PartialBy<
  SkillOptions,
  'id' | 'spriteId' | 'shouldExhaustCaster'
> &
  BurnModifier['meta'] & { range: number; allowGeneralAsTarget: boolean };

export class Burn extends Skill {
  public readonly range: number;
  public readonly meta: BurnModifier['meta'];
  public readonly allowGeneralAsTarget: boolean;
  public readonly keywords = [KEYWORDS.BURN];

  constructor(options: BurnOptions) {
    super({
      id: options.id ?? 'thorns',
      animationFX: options.animationFX ?? 'cast',
      soundFX: options.soundFX ?? 'cast-placeholder',
      spriteId: options.spriteId ?? 'fire2',
      shouldExhaustCaster: options?.shouldExhaustCaster ?? true,
      ...options
    });
    this.range = options.range;
    this.allowGeneralAsTarget = options.allowGeneralAsTarget;
    this.meta = {
      duration: options.duration,
      power: options.power,
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
      ? ` for ${this.meta.duration} turns`
      : '';
    return `Inflict Burn(${this.getDamageAmount(caster.attack)}) to an enemy${duration}.`;
  }

  isWithinRange(ctx: GameSession, point: Point3D, caster: Entity) {
    return isWithinCells(ctx, caster.position, point, this.range);
  }

  isInAreaOfEffect(ctx: GameSession, point: Point3D, caster: Entity, targets: Point3D[]) {
    return isWithinCells(ctx, targets[0], point, 0);
  }

  isTargetable(ctx: GameSession, point: Point3D, caster: Entity) {
    const entity = ctx.entityManager.getEntityAt(point);
    if (!entity) return false;
    if (this.allowGeneralAsTarget && !isGeneral(entity)) return false;

    return (
      this.isWithinRange(ctx, point, caster) &&
      isEnemy(ctx, ctx.entityManager.getEntityAt(point)?.id, caster.playerId)
    );
  }

  execute(ctx: GameSession, caster: Entity, [target]: Point3D[]) {
    const entity = ctx.entityManager.getEntityAt(target)!;
    new BurnModifier(ctx, caster, this.meta).attach(entity);
  }
}
