import { GameSession } from '../game-session';
import { Interactable, type SerializedInteractable } from './interactable';

export class GoldCoin extends Interactable {
  id = 'GOLD_COIN';
  spriteId = 'gold-coin';
  isWalkable = true;
  isTargetable = false;

  constructor(
    protected ctx: GameSession,
    raw: SerializedInteractable
  ) {
    super(ctx, raw);
    this.pickup = this.pickup.bind(this);
  }

  private pickup() {
    const entity = this.ctx.entityManager.getEntityAt(this.position);
    if (entity) {
      this.ctx.emitter.off('entity:move', this.pickup);
      this.ctx.emitter.off('entity:use-skill', this.pickup);
      this.ctx.emitter.off('entity:created', this.pickup);

      entity.player.gold++;

      this.destroy();
    }
  }

  init() {
    this.ctx.emitter.on('entity:move', this.pickup);
    this.ctx.emitter.on('entity:created', this.pickup);
    this.ctx.emitter.on('entity:use-skill', this.pickup);
  }
}
