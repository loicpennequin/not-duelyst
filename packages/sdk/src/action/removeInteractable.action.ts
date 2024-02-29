import { InteractableId } from '../interactable/interactable';
import { Point3D } from '../types';
import { GameAction } from './action';

export class RemoveInteractableAction extends GameAction<{
  position: Point3D;
  id: InteractableId;
}> {
  readonly name = 'REMOVE_INTERACTABLE';

  get logMessage() {
    return `${this.payload.id} dissappears.`;
  }

  protected fxImpl() {
    return Promise.resolve();
  }

  protected impl() {
    this.ctx.map.interactables = this.ctx.map.interactables.filter(
      int => !int.position.equals(this.payload.position) || int.id !== this.payload.id
    );
  }
}
