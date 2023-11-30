import { EntityId } from '../entity/entity';
import { SkillId } from '../skill/skill-builder';
import { Point3D } from '../types';
import { EVENT_NAME, GameEvent } from './event';

export type UseSkillEventPayload = {
  casterId: EntityId;
  skillId: SkillId;
  target: Point3D;
};

export class UseSkillEvent extends GameEvent<UseSkillEventPayload> {
  protected name = EVENT_NAME.MOVE;

  impl() {
    const entity = this.ctx.entityManager.getEntityById(this.payload.casterId);
    entity?.useSkill(this.ctx, this.payload.skillId, this.payload.target);
  }
}
