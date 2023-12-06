import { PlayerId } from '../player/player';
import { GameAction } from './action';

export class EndTurnAction extends GameAction<{ playerId: PlayerId }> {
  readonly name = 'END_TURN';

  protected impl() {
    this.ctx.atb.activeEntity.endTurn();
    this.ctx.atb.tickUntilActiveEntity(this.ctx.entityManager.getList());
    this.ctx.atb.activeEntity.startTurn();
  }
}
