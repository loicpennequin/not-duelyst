import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { KEYWORDS } from '../utils/keywords';
import { Modifier } from './modifier';

export class VigilantModifier extends Modifier {
  readonly id = 'vigilant';
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
    return `Vigilant.`;
  }

  getKeywords() {
    return [KEYWORDS.VIGILANT];
  }

  interceptor() {
    return false;
  }

  cleanup() {
    this.attachedTo?.removeInterceptor('shouldExhaustAfterRetaliation', this.interceptor);
  }

  onApplied() {
    this.attachedTo?.addInterceptor('shouldExhaustAfterRetaliation', this.interceptor);
  }

  onExpired() {
    this.cleanup();
  }

  onDetached() {
    this.cleanup();
  }
}
