import { SerializedInteractable } from '../interactable/interactable';
import { INTERACTABLES } from '../interactable/interactable-lookup';
import { GameAction } from './action';

export class SummonInteractableAction extends GameAction<SerializedInteractable> {
  readonly name = 'SUMMON_INTERACTABLE';

  protected fxImpl() {
    return Promise.resolve();
  }

  get logMessage() {
    return `A ${this.payload.id} appears.`;
  }

  protected impl() {
    const ctor = INTERACTABLES[this.payload.id as keyof typeof INTERACTABLES];

    const instance = new ctor(this.ctx, this.payload);
    this.ctx.map.interactables.push(instance);
    instance.init();
  }
}
