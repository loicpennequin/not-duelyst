import { DieAction } from '../action/die.action';
import { Entity } from '../entity/entity';
import { isAlly, isGeneral } from '../entity/entity-utils';
import { GameSession } from '../game-session';
import { isWithinCells } from '../skill/skill-utils';
import { Effect } from './effect';

export class ExecuteEffect extends Effect {
  id = 'execute';
  duration: number;

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: {
      duration: number;
      threshold: number;
    }
  ) {
    super(ctx, source, meta);
    this.duration = this.meta.duration;
    this.onDamage = this.onDamage.bind(this);
  }

  getDescription(): string {
    return `Whenever a nearby unit drops below ${
      this.meta.threshold * 100
    }5% hp, destroy it`;
  }

  getKeywords() {
    return [];
  }

  onDamage({ entity }: { entity: Entity; amount: number }) {
    if (isGeneral(entity)) return;
    if (isAlly(this.ctx, entity.id, this.attachedTo!.playerId)) return;

    if (!isWithinCells(this.ctx, this.attachedTo!.position, entity.position, 1)) return;

    if (entity.hp === 0) return; // dont proc, a die action will already trigger

    if (entity.hp <= entity.maxHp * this.meta.threshold) {
      this.ctx.actionQueue.push(
        new DieAction(
          {
            entityId: entity.id
          },
          this.ctx
        )
      );
    }
  }

  onApplied() {
    this.ctx.emitter?.on('entity:receive-damage', this.onDamage);
  }

  onExpired() {
    this.ctx.emitter?.on('entity:receive-damage', this.onDamage);
  }
}
