import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Skill } from '../skill/skill';
import { isWithinCells } from '../skill/skill-utils';
import type { Point3D } from '../types';
import { Modifier } from './modifier';

export class TauntedModifier extends Modifier {
  readonly id = 'taunted';
  duration: number;

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: { duration: number; radius: number }
  ) {
    super(ctx, source, meta);
    this.duration = this.meta.duration;

    this.moveInterceptor = this.moveInterceptor.bind(this);
    this.skillInterceptor = this.skillInterceptor.bind(this);
  }

  getDescription(): string {
    return `This units cannot move and can only attack the unit that taunted them.`;
  }

  getKeywords() {
    return [];
  }

  private get isInTauntRange() {
    return isWithinCells(this.ctx, this.source.position, this.attachedTo!.position, {
      x: this.meta.radius,
      y: this.meta.radius,
      z: this.meta.radius - 0.5
    });
  }

  private moveInterceptor(value: boolean) {
    if (!this.isInTauntRange) {
      return value;
    }

    return false;
  }

  private skillInterceptor(
    value: boolean,
    {
      targets
    }: {
      entity: Entity;
      skill: Skill;
      targets: Point3D[];
    }
  ) {
    if (!this.isInTauntRange) {
      return value;
    }
    if (!value) return value;

    return targets.every(target => {
      const targetEntity = this.ctx.entityManager.getEntityAt(target);
      if (!targetEntity) return false;

      return targetEntity.equals(this.source);
    });
  }

  private cleanup() {
    this.attachedTo?.removeInterceptor('canUseSkillAt', this.skillInterceptor);
    this.attachedTo?.removeInterceptor('canMove', this.moveInterceptor);
  }

  onApplied() {
    this.attachedTo?.addInterceptor('canUseSkillAt', this.skillInterceptor);
    this.attachedTo?.addInterceptor('canMove', this.moveInterceptor);

    this.source.on('die', () => {
      this.detach();
    });
  }

  onExpired() {
    this.cleanup();
  }

  onDetached() {
    this.cleanup();
  }
}
