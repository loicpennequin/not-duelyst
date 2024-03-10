import { isDefined, type PartialBy } from '@hc/shared';
import { Skill, type SkillOptions } from './skill';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import type { Point3D } from '../types';
import { isSelf, isWithinCells } from './skill-utils';
import { TauntedModifier } from '../modifier/taunted.modifier';
import { isEnemy, pointsToEntityIds } from '../entity/entity-utils';
import { StunnedModifier } from '../modifier/frozen.modifier';
import { Vec3 } from '../utils/vector';
import { DealDamageAction } from '../action/deal-damage.action';
import { KEYWORDS } from '../utils/keywords';

export type FrostBoltOptions = PartialBy<
  SkillOptions,
  'id' | 'spriteId' | 'shouldExhaustCaster'
> &
  StunnedModifier['meta'] & { power: number; range: number };

export class FrostBolt extends Skill {
  public readonly meta: StunnedModifier['meta'];
  public readonly duration: number;
  public readonly power: number;
  public readonly range: number;

  constructor(options: FrostBoltOptions) {
    super({
      id: options.id ?? 'frostBolt',
      animationFX: options.animationFX ?? 'cast',
      soundFX: options.soundFX ?? 'cast-placeholder',
      spriteId: options.spriteId ?? 'ice-spike',
      shouldExhaustCaster: options?.shouldExhaustCaster ?? true,
      ...options
    });
    this.duration = options.duration;
    this.range = options.range;
    this.power = options.power;
    this.meta = {
      duration: options.duration
    };
  }

  getDescription() {
    return `Deal ${this.power} damage to an enemy and freeze it for ${this.duration} turns.`;
  }

  getKeywords() {
    return [KEYWORDS.FROZEN];
  }

  isWithinRange(ctx: GameSession, point: Point3D, caster: Entity) {
    return isWithinCells(ctx, caster.position, point, this.range);
  }

  isTargetable(ctx: GameSession, point: Point3D, caster: Entity) {
    return (
      this.isWithinRange(ctx, point, caster) &&
      isEnemy(ctx, ctx.entityManager.getEntityAt(point)?.id, caster.playerId)
    );
  }

  isInAreaOfEffect(ctx: GameSession, point: Point3D, caster: Entity, targets: Point3D[]) {
    return targets.some(t => Vec3.fromPoint3D(t).equals(point));
  }

  execute(
    ctx: GameSession,
    caster: Entity,
    targets: Point3D[],
    affectedCells: Point3D[]
  ) {
    ctx.actionQueue.push(
      new DealDamageAction(
        {
          amount: this.power,
          sourceId: caster.id,
          shouldRetaliate: false,
          targets: pointsToEntityIds(ctx, affectedCells)
        },
        ctx
      )
    );

    affectedCells.forEach(target => {
      const entity = ctx.entityManager.getEntityAt(target);
      if (entity) {
        new StunnedModifier(ctx, caster, this.meta).attach(entity);
      }
    });
  }
}
