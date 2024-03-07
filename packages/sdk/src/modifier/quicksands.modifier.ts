import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Modifier } from './modifier';

export class QuicksandsModifier extends Modifier {
  readonly id = 'quicksandsModifier';
  readonly duration = Infinity;

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: Record<string, never>
  ) {
    super(ctx, source, meta);

    this.interceptor = this.interceptor.bind(this);
    this.detach = this.detach.bind(this);
  }

  getDescription(): string {
    return `This unit has -1 speed.`;
  }

  getKeywords() {
    return [];
  }

  interceptor(value: number) {
    return Math.max(value - 1, 0);
  }

  cleanup() {
    this.attachedTo?.removeInterceptor('speed', this.interceptor);
  }

  onApplied() {
    this.attachedTo?.addInterceptor('speed', this.interceptor);
    this.attachedTo?.on('move', this.detach);
  }

  onExpired() {
    this.cleanup();
  }

  onDetached() {
    this.cleanup();
  }
}
