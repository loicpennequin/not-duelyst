import { z } from 'zod';
import { GameAction, defaultActionSchema } from './action';
import { GameContext } from '../game';
import { Pathfinder } from '../pathfinding';
import { getEntityIfOwnerMatches } from '../entity/entity-utils';
import { Vec3 } from '../utils/vector';
import { ACTION_NAME, ActionName, RawAction } from './action-reducer';
import { MoveEvent } from '../event/move.event';
import { cellIdToPoint } from '../utils/helpers';

const moveEventSchema = defaultActionSchema.extend({
  entityId: z.number(),
  x: z.number(),
  y: z.number(),
  z: z.number()
});

export class MoveAction extends GameAction<typeof moveEventSchema> {
  protected name = ACTION_NAME.MOVE;

  protected payloadSchema = moveEventSchema;

  impl() {
    const entity = getEntityIfOwnerMatches(
      this.ctx,
      this.payload.entityId,
      this.payload.playerId
    );
    if (!entity) return;

    if (!entity.equals(this.ctx.atb.activeEntity)) return;

    const path = new Pathfinder(this.ctx).findPath(entity.position, this.payload);
    if (!path) return;

    if (entity.canMove(path.distance)) {
      this.ctx.history.add(
        new MoveEvent(
          {
            entityId: this.payload.entityId,
            path: path.path.map(cellIdToPoint)
          },
          this.ctx
        ).execute()
      );
    }
  }
}
