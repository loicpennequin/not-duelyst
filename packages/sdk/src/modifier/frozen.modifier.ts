import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Modifier } from './modifier';

export class StunnedModifier extends Modifier {
  readonly id = 'frozen';
  duration: number;
  spriteId = 'ice-circle';

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
    return `This units cannot move, cast abilities or retaliate.`;
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
