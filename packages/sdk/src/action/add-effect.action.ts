import { EFFECTS } from '../effect/effect-lookup';
import { EntityId } from '../entity/entity';
import { GameAction } from './action';

export class AddEffectAction<T extends keyof typeof EFFECTS> extends GameAction<{
  effectId: T;
  sourceId: EntityId;
  attachedTo: EntityId;
  effectArg: InstanceType<(typeof EFFECTS)[T]>['meta'];
}> {
  readonly name = 'ADD_EFFECT';

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
    return `${this.attachedTo.unitId} received ${this.payload.effectId} from ${this.source.unitId}.`;
  }

  protected impl() {
    const effectClass = EFFECTS[this.payload.effectId];

    // @ts-expect-error
    const effect = new effectClass(this.ctx, this.source, this.payload.effectArg);
    effect.attach(this.attachedTo);
  }
}
