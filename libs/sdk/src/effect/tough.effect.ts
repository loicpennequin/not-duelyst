import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { KEYWORDS } from '../utils/keywords';
import { Effect } from './effect';

export class ToughEffect extends Effect {
  readonly id = 'tough';
  duration: number;

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: { duration: number }
  ) {
    super(ctx, source, meta);
    this.duration = this.meta.duration;

    this.applyTough = this.applyTough.bind(this);
  }

  getDescription(): string {
    return `This units takes 1 less damage from all sources.`;
  }

  getKeywords() {
    return [KEYWORDS.TOUGH];
  }

  applyTough(amount: number) {
    return Math.max(amount - 1, 1);
  }

  onApplied() {
    this.attachedTo?.addInterceptor('takeDamage', this.applyTough);
  }

  onExpired() {
    this.attachedTo?.removeInterceptor('takeDamage', this.applyTough);
  }
}
