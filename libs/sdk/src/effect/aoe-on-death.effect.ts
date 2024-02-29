import { DealDamageAction } from '../action/deal-damage.action';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Effect } from './effect';

export class AoeOnDeathEffect extends Effect {
  readonly id = 'aoe-on-death';
  duration = Infinity;

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: { power: number; attackRatio?: number }
  ) {
    super(ctx, source, meta);

    this.onDeath = this.onDeath.bind(this);
  }

  get attackRatio() {
    return this.meta.attackRatio ?? 1;
  }

  get damage() {
    return this.meta.power + Math.ceil(this.attachedTo!.attack * this.attackRatio);
  }

  getDescription(): string {
    return `This units deals ${this.damage} damage to nearby enemies when it dies.`;
  }

  getKeywords() {
    return [];
  }

  onDeath() {
    const enemies = this.ctx.entityManager.getNearbyEnemies(
      this.attachedTo!.position,
      this.attachedTo!.playerId
    );

    this.ctx.actionQueue.push(
      new DealDamageAction(
        {
          amount: this.damage,
          sourceId: this.attachedTo!.id,
          targets: enemies.map(e => e.id)
        },
        this.ctx
      )
    );
  }

  onApplied() {
    this.attachedTo?.on('die', this.onDeath.bind(this));
  }

  onExpired() {
    this.attachedTo?.off('die', this.onDeath.bind(this));
  }
}
