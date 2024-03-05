import type { Nullable } from '@hc/shared';
import { DealDamageAction } from '../action/deal-damage.action';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Modifier } from './modifier';

export class ThornsModifier extends Modifier {
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

    this.listener = this.listener.bind(this);
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

  private listener({ source }: { source: Nullable<Entity> }) {
    if (!source) return;
    this.ctx.actionQueue.push(
      new DealDamageAction(
        {
          shouldRetaliate: false,
          amount: this.damage,
          sourceId: this.attachedTo!.id,
          targets: [source.id]
        },
        this.ctx
      )
    );
  }

  cleanup() {
    this.attachedTo?.off('receive-damage', this.listener);
  }

  onApplied() {
    this.attachedTo?.on('receive-damage', this.listener);
  }

  onExpired() {
    this.attachedTo?.off('receive-damage', this.listener);
  }

  onDetached() {
    this.attachedTo?.off('receive-damage', this.listener);
  }
}
