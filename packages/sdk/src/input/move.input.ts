import { z } from 'zod';
import { PlayerInput, defaultInputSchema } from './input';
import { getEntityIfOwnerMatches } from '../entity/entity-utils';
import { INPUT_NAME } from './input-reducer';
import { MoveAction } from '../action/move.action';

const moveEventSchema = defaultInputSchema.extend({
  entityId: z.number(),
  x: z.number(),
  y: z.number(),
  z: z.number()
});

export class MoveInput extends PlayerInput<typeof moveEventSchema> {
  readonly name = INPUT_NAME.MOVE;

  protected payloadSchema = moveEventSchema;

  impl() {
    const entity = getEntityIfOwnerMatches(
      this.ctx,
      this.payload.entityId,
      this.payload.playerId
    );
    if (!entity) return;

    const path = this.ctx.map.getPathTo(entity, this.payload);

    if (!path) return;

    if (!entity.canMove(path.distance)) return null;

    this.ctx.actionQueue.push(
      new MoveAction(
        {
          entityId: this.payload.entityId,
          path: path.path.map(vec => vec.serialize())
        },
        this.ctx
      )
    );
  }
}
