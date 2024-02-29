import { PlayerId } from '../player/player';
import { GameAction } from './action';

export class EndGamection extends GameAction<{ winnerId: PlayerId }> {
  readonly name = 'END_GAME';

  protected async fxImpl() {
    return Promise.resolve();
  }

  get logMessage() {
    return `Game over ! Winner is ${this.payload.winnerId}`;
  }

  protected impl() {
    this.ctx.winner = this.payload.winnerId;
  }
}
