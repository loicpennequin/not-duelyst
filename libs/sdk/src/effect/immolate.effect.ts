import { DealDamageAction } from '../action/deal-damage.action';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Player } from '../player/player';
import { Effect } from './effect';

export class ImmolateEffect extends Effect {
  readonly id = 'immolate';
  duration: number;

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: { duration: number; power: number }
  ) {
    super(ctx, source, meta);
    this.duration = meta.duration;

    this.applyDamage = this.applyDamage.bind(this);
  }

  getDescription(): string {
    return `This units deals ${this.meta.power} damage to all nearby enemies at the beginning of your turn.`;
  }

  getKeywords() {
    return [];
  }

  applyDamage(player: Player) {
    if (!this.attachedTo) return;
    if (!player.equals(this.attachedTo.player)) return;

    const enemies = this.ctx.entityManager.getNearbyEnemies(
      this.attachedTo?.position,
      this.attachedTo?.playerId
    );

    this.ctx.actionQueue.push(
      new DealDamageAction(
        {
          amount: this.meta.power,
          targets: enemies.map(e => e.id),
          sourceId: this.attachedTo.id
        },
        this.ctx
      )
    );
  }

  onApplied() {
    this.ctx.emitter.on('game:turn-start', this.applyDamage);
    this.attachedTo?.on('die', this.onExpired.bind(this));
  }

  onExpired() {
    this.ctx.emitter.off('game:turn-start', this.applyDamage);
  }
}
