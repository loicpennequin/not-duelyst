import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { KEYWORDS } from '../utils/keywords';
import { Modifier } from './modifier';

export class VulnerableModifier extends Modifier {
  readonly id = 'vulnerable';
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
    return `This units takes 1 more damage from all sources.`;
  }

  getKeywords() {
    return [KEYWORDS.VULNERABLE];
  }

  interceptor(amount: number) {
    return amount + 1;
  }

  cleanup() {
    this.attachedTo?.removeInterceptor('takeDamage', this.interceptor);
  }

  onApplied() {
    this.attachedTo?.addInterceptor('takeDamage', this.interceptor);
  }

  onExpired() {
    this.cleanup();
  }

  onDetached() {
    this.cleanup();
  }
}
