import type { AnyObject } from '@hc/shared';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Modifier } from './modifier';

export abstract class LastWillModifier<T extends AnyObject> extends Modifier {
  duration = Infinity;

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: T
  ) {
    super(ctx, source, meta);

    this.listener = this.listener.bind(this);
  }

  abstract listener(): void;

  cleanup() {
    this.attachedTo?.off('die', this.listener.bind(this));
  }

  onApplied() {
    this.attachedTo?.on('die', this.listener.bind(this));
  }

  onExpired() {
    this.cleanup();
  }

  onDetached(): void {
    this.cleanup();
  }
}
