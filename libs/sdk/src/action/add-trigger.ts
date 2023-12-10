import { Entity, EntityId } from '../entity/entity';
import { TriggerId } from '../trigger/trigger-builder';
import { TRIGGERS } from '../trigger/trigger-lookup';
import { GameAction } from './action';

export class AddTriggerAction extends GameAction<{
  triggerId: TriggerId;
  ownerId: EntityId;
}> {
  readonly name = 'ADD_TRIGGER';

  protected fxImpl() {
    return Promise.resolve();
  }

  protected impl() {
    const owner = this.ctx.entityManager.getEntityById(this.payload.ownerId);
    if (!owner) throw new Error(`Entity not found: ${this.payload.ownerId}`);

    const triggerBuilder = TRIGGERS[this.payload.triggerId];
    if (!triggerBuilder) throw new Error(`Triger not found: ${this.payload.triggerId}`);

    const trigger = triggerBuilder.builder(owner);

    const run = (action: GameAction<any>) => {
      if (action.name !== trigger.actionName) return;
      trigger.execute(this.ctx, action, trigger);
    };

    const updateDuration = () => {
      trigger.duration--;
      if (trigger.duration === 0) {
        owner.off('turn-start', updateDuration);
        this.ctx.emitter.off('game:action', run);
      }
    };

    this.ctx.emitter.on('game:action', run);
    owner.on('turn-start', updateDuration);
  }
}
