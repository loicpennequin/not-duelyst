import { DealDamageAction } from '../action/deal-damage.action';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Player } from '../player/player';
import { Modifier } from './modifier';

export class BurnModifier extends Modifier {
  readonly id = 'burn';
  duration: number;

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: {
      duration: number;
      power: number;
      attackRatio?: number;
    }
  ) {
    super(ctx, source, meta);
    this.duration = this.meta.duration;
    this.listener = this.listener.bind(this);
  }

  get attackRatio() {
    return this.meta.attackRatio ?? 1;
  }

  getDescription(): string {
    return `This units loses ${this.meta.power} HP at the beginning of its turn.`;
  }

  getKeywords() {
    return [];
  }

  listener(player: Player) {
    if (!this.attachedTo) return;

    if (!player.equals(this.attachedTo.player)) return;

    this.ctx.actionQueue.push(
      new DealDamageAction(
        {
          shouldRetaliate: false,
          amount: this.meta.power,
          sourceId: this.source.id,
          targets: [this.attachedTo.id]
        },
        this.ctx
      )
    );
  }

  cleanup() {
    this.ctx.emitter.off('game:turn-start', this.listener);
  }

  onApplied() {
    this.ctx.emitter.on('game:turn-start', this.listener);
    this.attachedTo?.on('die', this.onExpired.bind(this));
  }

  onExpired() {
    this.cleanup();
  }

  onDetached() {
    this.cleanup();
  }
}
