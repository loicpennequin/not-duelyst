import { Entity } from '../entity/entity';
import { isEnemy } from '../entity/entity-utils';
import type { GameSession } from '../game-session';
import { KEYWORDS } from '../utils/keywords';
import { type AuraMeta, AuraModifier } from './aura.modifier';
import { BurnModifier } from './burn.modifier';

export type AuraBurnMeta = AuraMeta & { power: number };

export class AuraBurnModifier extends AuraModifier<AuraBurnMeta> {
  readonly id = 'auraBurn';

  readonly spriteId? = 'fire-circle';

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

  hasAura(entity: Entity) {
    return entity.modifiers.some(mod => mod.id === 'burn' && mod.source === this.source);
  }

  applyAura(entity: Entity) {
    new BurnModifier(this.ctx, this.attachedTo!, {
      duration: Infinity,
      power: this.meta.power
    }).attach(entity);
  }

  removeAura(entity: Entity): void {
    entity.modifiers = entity.modifiers.filter(
      mod => mod.id === this.id && mod.source.id === this.source.id
    );
  }
}
