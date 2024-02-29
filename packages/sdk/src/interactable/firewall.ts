import { DealDamageAction } from '../action/deal-damage.action';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Interactable, SerializedInteractable } from './interactable';

export class Firewall extends Interactable {
  id = 'FIREWALL';
  spriteId = 'firewall';
  isWalkable = true;
  isTargetable = false;
  duration = 6;

  constructor(
    protected ctx: GameSession,
    raw: SerializedInteractable
  ) {
    super(ctx, raw);
    this.onMove = this.onMove.bind(this);
    this.onTurnEnd = this.onTurnEnd.bind(this);
  }

  private onMove(entity: Entity) {
    if (entity.position.equals(this.position)) {
      this.ctx.actionQueue.push(
        new DealDamageAction(
          {
            amount: 2,
            sourceId: this.id,
            targets: [entity.id]
          },
          this.ctx
        )
      );
    }
  }

  private onTurnEnd() {
    const entity = this.ctx.entityManager.getEntityAt(this.position);
    if (entity) {
      this.ctx.actionQueue.push(
        new DealDamageAction(
          {
            amount: 2,
            sourceId: this.id,
            targets: [entity.id]
          },
          this.ctx
        )
      );
    }

    this.duration--;
    if (this.duration === 0) {
      this.ctx.emitter.off('entity:move', this.onMove);
      this.ctx.emitter.off('game:turn-end', this.onTurnEnd);
      this.destroy();
    }
  }

  init() {
    this.ctx.emitter.on('entity:move', this.onMove);
    this.ctx.emitter.on('game:turn-end', this.onTurnEnd);
  }
}
