import { AnyObject } from '@hc/shared';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Player } from '../player/player';
import { Keyword } from '../utils/keywords';

export type EffectId = string;

export abstract class Effect {
  abstract readonly id: EffectId;
  abstract duration: number;
  attachedTo?: Entity;

  static keywords: Keyword[];

  constructor(
    protected ctx: GameSession,
    public source: Entity,
    readonly meta: AnyObject
  ) {
    this.tick = this.tick.bind(this);
    this.detach = this.detach.bind(this);
  }

  abstract getDescription(): string;

  abstract getKeywords(): Keyword[];

  attach(entity: Entity) {
    this.attachedTo = entity;
    this.attachedTo.effects.push(this);

    this.ctx.emitter.on('game:turn-end', this.tick);
    this.attachedTo.on('die', this.detach);

    this.onApplied();
  }

  detach() {
    if (!this.attachedTo) return;

    const idx = this.attachedTo.effects.indexOf(this);
    this.attachedTo.effects.splice(idx);

    this.ctx.emitter.off('game:turn-end', this.tick);
    this.attachedTo.off('die', this.detach);
  }

  protected tick(player: Player) {
    if (!this.attachedTo) return;

    if (!player.equals(this.attachedTo.player)) return;
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
}
