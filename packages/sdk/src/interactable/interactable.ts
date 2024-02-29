import { RemoveInteractableAction } from '../action/removeInteractable.action';
import { GameSession } from '../game-session';
import { Point3D } from '../types';
import { Serializable } from '../utils/interfaces';
import { Vec3 } from '../utils/vector';

export type InteractableId = string;
export type SerializedInteractable = {
  position: Point3D;
  id: InteractableId;
};

export abstract class Interactable implements Serializable {
  position: Vec3;
  abstract id: InteractableId;
  abstract isWalkable: boolean;
  abstract isTargetable: boolean;
  abstract spriteId: string;

  constructor(
    protected ctx: GameSession,
    raw: SerializedInteractable
  ) {
    this.position = Vec3.fromPoint3D(raw.position);
  }

  serialize(): SerializedInteractable {
    return {
      position: this.position.serialize(),
      id: this.id
    };
  }

  destroy() {
    this.ctx.actionQueue.push(
      new RemoveInteractableAction(
        {
          position: this.position.serialize(),
          id: this.id
        },
        this.ctx
      )
    );
  }

  abstract init(): void;
}
