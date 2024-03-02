import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Modifier } from './modifier';

export class StatModifierModifier extends Modifier {
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

    this.interceptor = this.interceptor.bind(this);
  }

  getDescription(): string {
    const sign = this.meta.value > 0 ? '+' : '-';
    return `This unis has ${sign}${Math.abs(this.meta.value)} ${this.meta.statKey}}.`;
  }

  getKeywords() {
    return [];
  }

  interceptor(value: number) {
    return value + this.meta.value;
  }

  cleanup() {
    this.attachedTo?.removeInterceptor(this.meta.statKey, this.interceptor);
  }
  onApplied() {
    this.attachedTo?.addInterceptor(this.meta.statKey, this.interceptor);
  }

  onExpired() {
    this.cleanup();
  }

  onDetached() {
    this.cleanup();
  }
}
