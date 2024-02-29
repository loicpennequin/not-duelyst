import { PlayerId } from '../player/player';
import { GameAction } from './action';

export class ModifyGoldAction extends GameAction<{ playerId: PlayerId; amount: number }> {
  readonly name = 'MODIFY_GOLD';

  get logMessage() {
    return `${this.payload.playerId} ${this.payload.amount > 0 ? 'wins' : 'loses'} ${
      this.payload.amount
    } gold.`;
  }

  get player() {
    const player = this.ctx.playerManager.getPlayerById(this.payload.playerId);
    if (!player) throw new Error(`Player not found: ${this.payload.playerId}`);
    return player;
  }

  protected fxImpl() {
    return Promise.resolve();
  }

  protected impl() {
    this.player.gold += this.payload.amount;
  }
}
