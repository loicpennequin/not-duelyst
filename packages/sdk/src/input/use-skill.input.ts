import { z } from 'zod';
import { PlayerInput, defaultInputSchema } from './input';
import { INPUT_NAME } from './input-reducer';
import { UseSkillAction } from '../action/use-sklll.action';

const useSkillEventSchema = defaultInputSchema.extend({
  entityId: z.number(),
  playerId: z.string(),
  skillId: z.string(),
  targets: z
    .object({
      x: z.number(),
      y: z.number(),
      z: z.number()
    })
    .array()
});

export class UseSkillInput extends PlayerInput<typeof useSkillEventSchema> {
  readonly name = INPUT_NAME.USE_SKILL;

  protected payloadSchema = useSkillEventSchema;

  private get caster() {
    const entity = this.ctx.entityManager.getEntityById(this.payload.entityId);
    if (!entity) throw new Error(`Entity not found: ${this.payload.entityId}`);

    return entity;
  }

  private getSkill() {
    return this.caster.skills.find(skill => skill.id === this.payload.skillId);
  }

  private get canUseSkill() {
    const skill = this.getSkill();
    if (!skill) return false;

    return (
      this.caster.canUseSkillAt(skill, this.payload.targets) &&
      this.payload.targets.length >= skill.minTargets &&
      this.payload.targets.length <= skill.maxTargets &&
      this.payload.targets.every(target =>
        skill.isTargetable(this.ctx, target, this.caster, this.payload.targets)
      )
    );
  }

  impl() {
    const skill = this.getSkill();
    if (!skill) return;

    if (!this.canUseSkill) return;

    this.ctx.actionQueue.push(
      new UseSkillAction(
        {
          casterId: this.caster.id,
          skillId: this.payload.skillId,
          targets: this.payload.targets
        },
        this.ctx
      )
    );
  }
}
