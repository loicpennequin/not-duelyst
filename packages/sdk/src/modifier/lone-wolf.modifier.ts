import type { AnyObject } from '@hc/shared';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Modifier } from './modifier';

export abstract class LoneWolfModifier<T extends AnyObject> extends Modifier {
  duration = Infinity;
  isAlone = false;

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: T
  ) {
    super(ctx, source, meta);

    this.listener = this.listener.bind(this);
  }

  abstract onChange(isAlone: boolean): void;

  private listener() {
    const current = this.isAlone;
    this.isAlone = !this.ctx.entityManager.hasNearbyAllies(
      this.attachedTo!.position,
      this.attachedTo!.playerId
    );

    if (current !== this.isAlone) {
      this.onChange(this.isAlone);
    }
  }

  cleanup() {
    this.ctx.emitter?.off('entity:created', this.listener.bind(this));
    this.ctx.emitter?.off('entity:die', this.listener.bind(this));
    this.ctx.emitter?.off('entity:move', this.listener.bind(this));
  }

  onApplied() {
    this.ctx.emitter?.on('entity:created', this.listener.bind(this));
    this.ctx.emitter?.on('entity:die', this.listener.bind(this));
    this.ctx.emitter?.on('entity:move', this.listener.bind(this));
  }

  onExpired() {
    this.cleanup();
  }

  onDetached(): void {
    this.cleanup();
  }
}
