import { MODIFIERS } from '../modifier/modifier-lookup';
import type { EntityId } from '../entity/entity';
import { GameAction } from './action';

export class RemoveEffectAction<T extends keyof typeof MODIFIERS> extends GameAction<{
  effectId: T;
  sourceId: EntityId;
  attachedTo: EntityId;
}> {
  readonly name = 'REMOVE_EFFECT';

  protected fxImpl() {
    return Promise.resolve();
  }

  get source() {
    const source = this.ctx.entityManager.getEntityById(this.payload.sourceId);
    if (!source) throw new Error(`Entity not found: ${this.payload.sourceId}`);
    return source;
  }

  get attachedTo() {
    const attachedTo = this.ctx.entityManager.getEntityById(this.payload.attachedTo);
    if (!attachedTo) throw new Error(`Entity not found: ${this.payload.attachedTo}`);
    return attachedTo;
  }

  get logMessage() {
    return `${this.attachedTo.unitId} lostreceived ${this.payload.effectId} from ${this.source.unitId}.`;
  }

  protected impl() {
    const modifier = this.attachedTo.modifiers.find(
      mod => mod.id === this.payload.effectId && mod.source.id === this.payload.sourceId
    );
    modifier?.detach();
  }
}
