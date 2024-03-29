import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { isWithinCells } from '../skill/skill-utils';
import { Modifier } from './modifier';

export type AuraMeta = { duration: number; range: number };
export abstract class AuraModifier<TMeta extends AuraMeta> extends Modifier {
  abstract readonly id: string;
  duration: number;

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: TMeta
  ) {
    super(ctx, source, meta);
    this.duration = this.meta.duration;

    this.checkAura = this.checkAura.bind(this);
    this.cleanup = this.cleanup.bind(this);
  }

  abstract isElligible(entity: Entity): boolean;

  abstract applyAura(entity: Entity): void;

  abstract removeAura(entity: Entity): void;

  abstract hasAura(entity: Entity): boolean;

  private checkAura() {
    this.ctx.entityManager.getList().forEach(entity => {
      if (!this.isElligible(entity)) return;

      const isInRange = isWithinCells(
        this.ctx,
        this.source.position,
        entity.position,
        this.meta.range
      );

      if (!isInRange && this.hasAura(entity)) {
        return this.removeAura(entity);
      }

      if (isInRange && !this.hasAura(entity)) {
        this.applyAura(entity);
      }
    });
  }

  cleanup() {
    this.ctx.entityManager.getList().forEach(entity => {
      this.removeAura(entity);
    });

    this.ctx.emitter.off('entity:move', this.checkAura);
    this.ctx.emitter.off('entity:destroyed', this.checkAura);
    this.ctx.emitter.off('entity:created', this.checkAura);
  }

  onApplied() {
    this.ctx.emitter.on('entity:move', this.checkAura);
    this.ctx.emitter.on('entity:destroyed', this.checkAura);
    this.ctx.emitter.on('entity:created', this.checkAura);
    this.attachedTo?.on('die', this.cleanup);
  }

  onExpired() {
    this.cleanup();
  }

  onDetached() {
    this.cleanup();
  }
}
