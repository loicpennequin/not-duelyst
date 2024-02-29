import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Effect } from './effect';

export class VulnerableEffect extends Effect {
  readonly id = 'vulnerable';
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
    return `This units takes 1 more damage from all sources.`;
  }

  getKeywords() {
    return [];
  }

  applyTough(amount: number) {
    return amount + 1;
  }

  onApplied() {
    this.attachedTo?.addInterceptor('takeDamage', this.applyTough);
  }

  onExpired() {
    this.attachedTo?.removeInterceptor('takeDamage', this.applyTough);
  }
}
