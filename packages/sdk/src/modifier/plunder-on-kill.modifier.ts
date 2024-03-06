import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Modifier } from './modifier';

export class PlunderOnKillModifier extends Modifier {
  readonly id = 'plunderOnKill';
  duration: number;

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: {
      duration: number;
      amount: number;
    }
  ) {
    super(ctx, source, meta);
    this.duration = this.meta.duration;

    this.listener = this.listener.bind(this);
  }

  getDescription(): string {
    return `When this unit takes down an enemy, gain ${this.meta.amount} gold.`;
  }

  getKeywords() {
    return [];
  }

  listener({ entity }: { entity: Entity }) {
    if (!entity.lastDamagesource) return;
    if (!this.attachedTo) return;
    if (!entity.lastDamagesource.equals(this.attachedTo)) return;

    this.attachedTo.player.gold += this.meta.amount;
  }

  cleanup() {
    this.ctx.emitter.off('entity:die', this.listener);
  }

  onApplied() {
    this.ctx.emitter.on('entity:die', this.listener);
    this.attachedTo?.on('die', this.onExpired.bind(this));
  }

  onExpired() {
    this.cleanup();
  }

  onDetached() {
    this.cleanup();
  }
}
