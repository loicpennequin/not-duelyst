import { EntityId } from '../entity/entity';
import { Point3D } from '../types';
import { Vec3 } from '../utils/vector';
import { GameAction } from './action';

export class TeleportAction extends GameAction<{
  entityId: EntityId;
  point: Point3D;
}> {
  readonly name = 'TELEPORT';

  get entity() {
    const entity = this.ctx.entityManager.getEntityById(this.payload.entityId);
    if (!entity) throw new Error(`Entity not found: ${this.payload.entityId}`);

    return entity;
  }

  get logMessage() {
    return `${this.entity.unitId} teleports.`;
  }
  protected async fxImpl() {
    return Promise.resolve();
  }

  protected impl() {
    this.entity.position = Vec3.fromPoint3D(this.payload.point);
  }
}
