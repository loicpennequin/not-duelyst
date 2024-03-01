import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Modifier } from './modifier';

export class RushEffect extends Modifier {
  readonly id = 'rush';
  duration = Infinity;

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: Record<string, never>
  ) {
    super(ctx, source, meta);
  }

  getKeywords() {
    return [];
  }

  getDescription(): string {
    return `This unit can move and cast skills on the turn it is summoned`;
  }

  onApplied() {
    return;
  }

  onExpired() {
    return;
  }
}
