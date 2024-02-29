import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Skill } from '../skill/skill';
import { isWithinCells } from '../skill/skill-utils';
import { Point3D } from '../types';
import { Effect } from './effect';

export class TauntedEffect extends Effect {
  readonly id = 'taunted';
  duration: number;

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: { duration: number; radius: number }
  ) {
    super(ctx, source, meta);
    this.duration = this.meta.duration;

    this.applyMoveTaunt = this.applyMoveTaunt.bind(this);
    this.applySkillTaunt = this.applySkillTaunt.bind(this);
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

  private applyMoveTaunt(value: boolean) {
    if (!this.isInTauntRange) {
      return value;
    }

    return false;
  }

  private applySkillTaunt(
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
    this.attachedTo?.removeInterceptor('canUseSkillAt', this.applySkillTaunt);
    this.attachedTo?.removeInterceptor('canMove', this.applyMoveTaunt);
  }

  onApplied() {
    this.attachedTo?.addInterceptor('canUseSkillAt', this.applySkillTaunt);
    this.attachedTo?.addInterceptor('canMove', this.applyMoveTaunt);

    this.source.on('die', () => {
      this.cleanup();
      this.detach();
    });
  }

  onExpired() {
    this.cleanup();
  }
}
