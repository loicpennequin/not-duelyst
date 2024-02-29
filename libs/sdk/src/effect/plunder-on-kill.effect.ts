import { Nullable } from '@hc/shared';
import { ModifyGoldAction } from '../action/modify-gold.action';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Effect } from './effect';

export class PlunderOnKillEffect extends Effect {
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

    this.ctx.actionQueue.push(
      new ModifyGoldAction(
        {
          playerId: this.attachedTo.playerId,
          amount: this.meta.amount
        },
        this.ctx
      )
    );
  }

  onApplied() {
    this.ctx.emitter.on('entity:die', this.listener);
    this.attachedTo?.on('die', this.onExpired.bind(this));
  }

  onExpired() {
    this.ctx.emitter.off('entity:die', this.listener);
  }
}
