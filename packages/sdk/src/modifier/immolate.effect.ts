import { AddEffectAction } from '../action/add-effect.action';
import { DealDamageAction } from '../action/deal-damage.action';
import { RemoveEffectAction } from '../action/remove-effect-action';
import { Entity } from '../entity/entity';
import { isEnemy } from '../entity/entity-utils';
import { GameSession } from '../game-session';
import { Player } from '../player/player';
import { KEYWORDS, Keyword } from '../utils/keywords';
import { AuraMeta, AuraModifier } from './aura.effect';
import { Modifier } from './modifier';

export class ImmolateModifier extends Modifier {
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

export type BurnAuraMeta = AuraMeta & { power: number };

export class BurnAuraModifier extends AuraModifier<BurnAuraMeta> {
  id = 'burnAura';
  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: BurnAuraMeta
  ) {
    super(ctx, source, meta);
  }

  getDescription() {
    return `Applies Burn(${this.meta.power}) to nearby enemies.`;
  }

  getKeywords() {
    return [KEYWORDS.BURN, KEYWORDS.AURA];
  }

  isElligible(entity: Entity): boolean {
    return isEnemy(this.ctx, entity.id, this.source.playerId);
  }

  applyAura(entity: Entity) {
    this.ctx.actionQueue.push(
      new AddEffectAction(
        {
          effectId: 'burn',
          attachedTo: entity.id,
          sourceId: this.attachedTo!.id,
          effectArg: {
            duration: Infinity,
            power: this.meta.power
          }
        },
        this.ctx
      )
    );
  }

  removeAura(entity: Entity): void {
    this.ctx.actionQueue.push(
      new RemoveEffectAction(
        {
          attachedTo: entity.id,
          sourceId: this.source.id,
          effectId: this.id
        },
        this.ctx
      )
    );
  }
}
