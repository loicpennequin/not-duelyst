import { PartialBy } from '@hc/shared';
import { AddEffectAction } from '../action/add-effect.action';
import { DealDamageAction } from '../action/deal-damage.action';
import { Entity } from '../entity/entity';
import { isEnemy } from '../entity/entity-utils';
import { GameSession } from '../game-session';
import { Point3D } from '../types';
import { SkillDescriptionContext, SkillOptions } from './skill';
import { isWithinCells, isSelf, isAxisAligned } from './skill-utils';
import { Attack } from './attack.skill';

export type FireballOptions = PartialBy<
  SkillOptions,
  'id' | 'spriteId' | 'name' | 'shouldExhaustCaster'
> & {
  power: number;
  range: number;
  dotPower: number;
  dotDuration: number;
};
export class Fireball extends Attack {
  readonly power: number;
  readonly range: number;
  readonly dotDuration: number;
  readonly dotPower: number;

  constructor(options: FireballOptions) {
    super({
      id: options.id ?? 'fireball',
      spriteId: options.spriteId ?? 'fireball',
      name: options.name ?? 'Fireball',
      shouldExhaustCaster: options?.shouldExhaustCaster ?? true,
      ...options
    });
    this.power = options.power;
    this.range = options.range;
    this.dotDuration = options.dotDuration;
    this.dotPower = options.dotPower;
  }

  getDescription(caster: SkillDescriptionContext) {
    return `Deals ${this.getDamageAmount(caster.attack)} damage to up to ${
      this.maxTargets
    } enemies, then ${this.dotPower} damage every turn for ${this.dotDuration} turns`;
  }

  isWithinRange(ctx: GameSession, point: Point3D, caster: Entity) {
    return (
      isWithinCells(ctx, caster.position, point, this.range) &&
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
      ctx.actionQueue.push(
        new AddEffectAction(
          {
            sourceId: caster.id,
            attachedTo: entity.id,
            effectId: 'dot',
            effectArg: { duration: this.dotDuration, power: this.dotPower }
          },
          ctx
        )
      );
    });
  }
}
