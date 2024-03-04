import type { Entity } from '../entity/entity';
import type { GameSession } from '../game-session';
import { KEYWORDS, type Keyword } from '../utils/keywords';
import { LoneWolfModifier } from './lone-wolf.modifier';

type Meta = {
  statKey: Exclude<Parameters<Entity['addInterceptor']>[0], 'canUseSkill' | 'canMove'>;
  value: number;
};

export class LoneWolfStatModifierModifier extends LoneWolfModifier<Meta> {
  readonly id = 'loneWolfStatModifier';

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: Meta
  ) {
    super(ctx, source, meta);
    this.interceptor = this.interceptor.bind(this);
  }

  getDescription() {
    const sign = this.meta.value > 0 ? '+' : '-';
    return `Lone wolf: ${sign}${Math.abs(this.meta.value)} ${this.meta.statKey}}.`;
  }

  getKeywords(): Keyword[] {
    return [KEYWORDS.LONE_WOLF];
  }

  interceptor(value: number) {
    return value + this.meta.value;
  }

  onChange(isAlone: boolean): void {
    if (isAlone) {
      this.attachedTo?.addInterceptor(this.meta.statKey, this.interceptor);
    } else {
      this.attachedTo?.removeInterceptor(this.meta.statKey, this.interceptor);
    }
  }
}
