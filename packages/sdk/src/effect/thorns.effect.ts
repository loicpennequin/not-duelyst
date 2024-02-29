import { Nullable } from '@hc/shared';
import { DealDamageAction } from '../action/deal-damage.action';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Effect } from './effect';

export class ThornsEffect extends Effect {
  readonly id = 'thorns';
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

    this.applyThorns = this.applyThorns.bind(this);
  }

  get attackRatio() {
    return this.meta.attackRatio ?? 1;
  }

  get damage() {
    return this.meta.power + Math.ceil(this.attachedTo!.attack * this.attackRatio);
  }

  getDescription(): string {
    return `When this unit receives damage, it deals ${this.damage} back.`;
  }

  getKeywords() {
    return [];
  }

  private applyThorns({ source }: { source: Nullable<Entity> }) {
    if (!source) return;
    this.ctx.actionQueue.push(
      new DealDamageAction(
        {
          amount: this.damage,
          sourceId: this.attachedTo!.id,
          targets: [source.id]
        },
        this.ctx
      )
    );
  }

  onApplied() {
    this.attachedTo?.on('receive-damage', this.applyThorns);
  }

  onExpired() {
    this.attachedTo?.off('receive-damage', this.applyThorns);
  }
}
