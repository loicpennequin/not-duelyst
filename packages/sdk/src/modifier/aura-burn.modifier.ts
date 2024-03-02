import { AddEffectAction } from '../action/add-effect.action';
import { RemoveEffectAction } from '../action/remove-effect-action';
import { Entity } from '../entity/entity';
import { isEnemy } from '../entity/entity-utils';
import { GameSession } from '../game-session';
import { KEYWORDS } from '../utils/keywords';
import { type AuraMeta, AuraModifier } from './aura.modifier';

export type AuraBurnMeta = AuraMeta & { power: number };

export class AuraBurnModifier extends AuraModifier<AuraBurnMeta> {
  readonly id = 'auraBurn';
  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: AuraBurnMeta
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
