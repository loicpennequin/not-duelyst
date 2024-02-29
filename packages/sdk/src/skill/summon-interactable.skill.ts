import { PartialBy } from '@hc/shared';
import { Entity } from '../entity/entity';
import { isEmpty } from '../entity/entity-utils';
import { GameSession } from '../game-session';
import { Point3D } from '../types';
import { Skill, SkillOptions } from './skill';
import { InteractableId } from '../interactable/interactable';
import { SummonInteractableAction } from '../action/summon-interactable.action';
import { Vec3 } from '../utils/vector';
import { isWithinCells } from './skill-utils';

export type SummonInteractableOptions = PartialBy<
  SkillOptions,
  'id' | 'name' | 'shouldExhaustCaster'
> & {
  interactableId: InteractableId;
  allowSeparatedTargets: boolean;
  allowNonempty: boolean;
};

export class SummonInteractable extends Skill {
  public readonly interactableId: InteractableId;
  public readonly allowSeparatedTargets: boolean;
  public readonly allowNonempty: boolean;

  constructor(options: SummonInteractableOptions) {
    super({
      id: options.id ?? 'summon_interactable',
      animationFX: 'cast',
      soundFX: 'cast-placeholder',
      name: options.name ?? 'Summon interactable',
      shouldExhaustCaster: options?.shouldExhaustCaster ?? true,
      ...options
    });
    this.interactableId = options.interactableId;
    this.allowSeparatedTargets = options.allowSeparatedTargets;
    this.allowNonempty = options.allowNonempty;
  }

  getDescription() {
    if (this.maxTargets === this.minTargets) {
      return `Summon ${this.minTargets} ${this.interactableId}`;
    }
    return `Summon between ${this.minTargets} and ${this.maxTargets} ${this.interactableId}`;
  }

  isWithinRange(ctx: GameSession, point: Point3D, caster: Entity, targets: Point3D[]) {
    if (targets.length && !this.allowSeparatedTargets) {
      return targets.some(target => isWithinCells(ctx, target, point, 1));
    }

    const allies = ctx.entityManager.getNearbyAllies(point, caster.playerId);
    return !!allies.length;
  }

  isTargetable(ctx: GameSession, point: Point3D, caster: Entity, targets: Point3D[]) {
    return this.isWithinRange(ctx, point, caster, targets) && this.allowNonempty
      ? true
      : isEmpty(ctx, point);
  }

  isInAreaOfEffect(ctx: GameSession, point: Point3D, caster: Entity, targets: Point3D[]) {
    return targets.some(t => Vec3.fromPoint3D(t).equals(point));
  }

  execute(ctx: GameSession, caster: Entity, targets: Point3D[]) {
    targets.forEach(target => {
      ctx.actionQueue.push(
        new SummonInteractableAction(
          {
            id: this.interactableId,
            position: target
          },
          ctx
        )
      );
    });
  }
}
