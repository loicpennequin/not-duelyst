import { DealDamageAction } from '../action/deal-damage.action';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Modifier } from './modifier';

export class AoeOnDeathModifier extends Modifier {
  readonly id = 'aoe-on-death';
  duration = Infinity;

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: { power: number; attackRatio?: number }
  ) {
    super(ctx, source, meta);

    this.listener = this.listener.bind(this);
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

  listener() {
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

  cleanup() {
    this.attachedTo?.off('die', this.listener.bind(this));
  }

  onApplied() {
    this.attachedTo?.on('die', this.listener.bind(this));
  }

  onExpired() {
    this.cleanup();
  }
}
