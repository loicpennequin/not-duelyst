import { DealDamageAction } from '../action/deal-damage.action';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Player } from '../player/player';
import { Effect } from './effect';

export class DotEffect extends Effect {
  readonly id = 'dot';
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
    this.applyDot = this.applyDot.bind(this);
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

  applyDot(player: Player) {
    if (!this.attachedTo) return;

    if (player.equals(this.attachedTo.player)) {
      this.ctx.actionQueue.push(
        new DealDamageAction(
          {
            amount: this.meta.power,
            sourceId: this.source.id,
            targets: [this.attachedTo.id]
          },
          this.ctx
        )
      );
    }
  }

  onApplied() {
    this.ctx.emitter.on('game:turn-start', this.applyDot);
    this.attachedTo?.on('die', this.onExpired.bind(this));
  }

  onExpired() {
    this.ctx.emitter.off('game:turn-start', this.applyDot);
  }
}
