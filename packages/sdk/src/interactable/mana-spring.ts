import { ModifyApAction } from '../action/modify-ap.action';
import { Interactable } from './interactable';

export class ManaSpring extends Interactable {
  id = 'MANA_SPRING';
  spriteId = 'mana-spring';
  isWalkable = true;
  isTargetable = false;

  private grantAp() {
    const entity = this.ctx.entityManager.getEntityAt(this.position);
    if (entity) {
      this.ctx.actionQueue.push(
        new ModifyApAction({ entityId: entity.id, amount: 1 }, this.ctx)
      );
    }
  }

  init() {
    this.ctx.emitter.on('game:turn-end', this.grantAp.bind(this));
  }
}
