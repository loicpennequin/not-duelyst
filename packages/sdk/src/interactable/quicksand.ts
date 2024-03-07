import { GameSession } from '../game-session';
import { QuicksandsModifier } from '../modifier/quicksands.modifier';
import { Interactable, type SerializedInteractable } from './interactable';

export class Quicksands extends Interactable {
  id = 'QUICKSANDS';
  spriteId = 'quicksands';
  isWalkable = true;
  isTargetable = false;

  constructor(
    protected ctx: GameSession,
    raw: SerializedInteractable
  ) {
    super(ctx, raw);
    this.listener = this.listener.bind(this);
  }

  private listener() {
    const entity = this.ctx.entityManager.getEntityAt(this.position);
    if (!entity) return;

    const hasQuicksand = entity.modifiers.some(mod => mod.id === 'quicksandsModifier');
    if (hasQuicksand) return;

    new QuicksandsModifier(this.ctx, entity, {}).attach(entity);
  }

  init() {
    this.ctx.emitter.on('entity:move', this.listener);
    this.ctx.emitter.on('entity:created', this.listener);
    this.ctx.emitter.on('entity:use-skill', this.listener);
  }
}
