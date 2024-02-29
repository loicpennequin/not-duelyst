import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Effect } from './effect';

export class ExhaustedEffect extends Effect {
  readonly id = 'exhausted';
  duration: number;

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: Record<string, never>
  ) {
    super(ctx, source, meta);
    this.duration = 1;

    this.preventAction = this.preventAction.bind(this);
  }

  getDescription(): string {
    return `This unit has been summoned this turn and cannot move of use abilities.`;
  }

  getKeywords() {
    return [];
  }

  preventAction() {
    return false;
  }

  onApplied() {
    this.attachedTo?.addInterceptor('canMove', this.preventAction);
    this.attachedTo?.addInterceptor('canUseSkill', this.preventAction);
  }

  onExpired() {
    this.attachedTo?.removeInterceptor('canMove', this.preventAction);
    this.attachedTo?.removeInterceptor('canUseSkill', this.preventAction);
  }
}
