import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Modifier } from './modifier';

export class RootedModifier extends Modifier {
  readonly id = 'rooted';
  duration: number;

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: { duration: number }
  ) {
    super(ctx, source, meta);
    this.duration = this.meta.duration;

    this.interceptor = this.interceptor.bind(this);
  }

  getDescription(): string {
    return `This units cannot move.`;
  }

  getKeywords() {
    return [];
  }

  interceptor() {
    return false;
  }

  cleanup() {
    this.attachedTo?.removeInterceptor('canMove', this.interceptor);
  }

  onApplied() {
    this.attachedTo?.addInterceptor('canMove', this.interceptor);
  }

  onExpired() {
    this.cleanup();
  }

  onDetached() {
    this.cleanup();
  }
}
