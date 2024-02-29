import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Effect } from './effect';

export class RootedEffect extends Effect {
  readonly id = 'rooted';
  duration: number;

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: { duration: number }
  ) {
    super(ctx, source, meta);
    this.duration = this.meta.duration;

    this.applyRoot = this.applyRoot.bind(this);
  }

  getDescription(): string {
    return `This units cannot move.`;
  }

  getKeywords() {
    return [];
  }

  applyRoot() {
    return false;
  }

  onApplied() {
    this.attachedTo?.addInterceptor('canMove', this.applyRoot);
  }

  onExpired() {
    this.attachedTo?.removeInterceptor('canMove', this.applyRoot);
  }
}
