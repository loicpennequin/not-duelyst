import type { AnyObject } from '@hc/shared';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Player } from '../player/player';
import type { Keyword } from '../utils/keywords';

export type ModifierId = string;

export abstract class Modifier {
  abstract readonly id: ModifierId;
  abstract duration: number;
  attachedTo?: Entity;
  shouldTickOnBothPlayersTurn = false;

  static keywords: Keyword[];

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: AnyObject
  ) {
    this.tick = this.tick.bind(this);
    this.detach = this.detach.bind(this);
  }

  readonly spriteId?: string;

  abstract getDescription(): string;

  abstract getKeywords(): Keyword[];

  attach(entity: Entity) {
    this.attachedTo = entity;
    this.attachedTo.modifiers.push(this);
    this.ctx.emitter.on('game:turn-end', this.tick);
    this.attachedTo.on('die', this.detach);
    this.onApplied();
  }

  detach() {
    if (!this.attachedTo) return;

    this.onDetached();
    const idx = this.attachedTo.modifiers.indexOf(this);
    this.attachedTo.modifiers.splice(idx, 1);

    this.ctx.emitter.off('game:turn-end', this.tick);
    this.attachedTo.off('die', this.detach);
  }

  protected tick(player: Player) {
    if (!this.attachedTo) return;

    if (!this.shouldTickOnBothPlayersTurn && !player.equals(this.attachedTo.player)) {
      return;
    }

    this.duration--;
    if (this.duration === 0) {
      this.detach();
      this.onExpired();
    }
  }

  onApplied() {
    return;
  }

  onExpired() {
    return;
  }

  onDetached() {
    return;
  }
}
