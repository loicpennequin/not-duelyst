import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Modifier } from './modifier';
import type { Point3D } from '../types';

export type OnSummonedMeta = { targets: Point3D[] };
export abstract class OnSummonedModifier<
  T extends OnSummonedMeta = OnSummonedMeta
> extends Modifier {
  duration = Infinity;

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: T
  ) {
    super(ctx, source, meta);

    this.listener = this.listener.bind(this);
    this.onEntityCreated = this.onEntityCreated.bind(this);
  }

  abstract listener(): void;

  private onEntityCreated(entity: Entity) {
    if (this.attachedTo?.equals(entity)) {
      this.listener();
      this.detach();
    }
  }

  cleanup() {
    this.ctx.emitter.off('entity:created', this.onEntityCreated);
  }

  onApplied() {
    this.ctx.emitter.on('entity:created', this.onEntityCreated);
  }

  onExpired() {
    this.cleanup();
  }

  onDetached(): void {
    this.cleanup();
  }
}
