import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Modifier } from './modifier';

export class ExhaustedModifier extends Modifier {
  readonly id = 'exhausted';
  duration: number;
  shouldTickOnBothPlayersTurn = true;

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: Record<string, never>
  ) {
    super(ctx, source, meta);
    this.duration = 1;

    this.interceptor = this.interceptor.bind(this);
  }

  getDescription(): string {
    return `This unit cannot move, use abilities or retaliate.`;
  }

  getKeywords() {
    return [];
  }

  interceptor() {
    return false;
  }

  cleanup() {
    this.attachedTo?.removeInterceptor('canMove', this.interceptor);
    this.attachedTo?.removeInterceptor('canUseSkill', this.interceptor);
    this.attachedTo?.removeInterceptor('canRetaliate', this.interceptor);
  }

  onApplied() {
    this.attachedTo?.addInterceptor('canMove', this.interceptor);
    this.attachedTo?.addInterceptor('canUseSkill', this.interceptor);
    this.attachedTo?.addInterceptor('canRetaliate', this.interceptor);
  }

  onExpired() {
    this.cleanup();
  }

  onDetached() {
    this.cleanup();
  }
}
