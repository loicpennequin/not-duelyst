import { EntityId, isEntityId } from '../entity/entity';
import { isGeneral } from '../entity/entity-utils';
import { GameAction } from './action';
import { EndGamection } from './end-game.action';

export class DieAction extends GameAction<{
  entityId: EntityId;
}> {
  readonly name = 'DIE';

  protected async fxImpl() {
    if (!this.ctx.fxContext) return;

    await this.ctx.fxContext.fadeOutEntity(this.payload.entityId, 0.8);
  }

  get entity() {
    const entity = this.ctx.entityManager.getEntityById(this.payload.entityId);
    if (!entity) throw new Error(`Entity not found: ${this.payload.entityId}`);

    return entity;
  }

  get logMessage() {
    return `${this.entity.unitId} died.`;
  }
  protected impl() {
    this.entity.die();
    const entity = this.entity;
    this.ctx.entityManager.removeEntity(entity);

    if (isGeneral(entity)) {
      this.ctx.actionQueue.push(
        new EndGamection(
          {
            winnerId: this.ctx.playerManager.getOpponent(entity.playerId).id
          },
          this.ctx
        )
      );
      return;
    }
  }
}
