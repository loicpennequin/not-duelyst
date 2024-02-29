import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Effect } from './effect';

export class StatModifierEffect extends Effect {
  readonly id = 'statModifier';
  duration: number;

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: {
      duration: number;
      statKey: Exclude<
        Parameters<Entity['addInterceptor']>[0],
        'canUseSkill' | 'canMove'
      >;
      value: number;
    }
  ) {
    super(ctx, source, meta);
    this.duration = this.meta.duration;

    this.applyModifier = this.applyModifier.bind(this);
  }

  getDescription(): string {
    const sign = this.meta.value > 0 ? '+' : '-';
    return `This unis has ${sign}${Math.abs(this.meta.value)} ${this.meta.statKey}}.`;
  }

  getKeywords() {
    return [];
  }

  applyModifier(value: number) {
    return value + this.meta.value;
  }

  onApplied() {
    this.attachedTo?.addInterceptor(this.meta.statKey, this.applyModifier);
  }

  onExpired() {
    this.attachedTo?.removeInterceptor(this.meta.statKey, this.applyModifier);
  }
}
