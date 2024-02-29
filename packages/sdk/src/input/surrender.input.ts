import { PlayerInput, defaultInputSchema } from './input';
import { INPUT_NAME } from './input-reducer';
import { EndTurnAction } from '../action/end-turn.action';
import { EndGamection } from '../action/end-game.action';

const surrenderEventSchema = defaultInputSchema;

export class SurrenderInput extends PlayerInput<typeof surrenderEventSchema> {
  readonly name = INPUT_NAME.SURRENDER;

  protected payloadSchema = surrenderEventSchema;

  impl() {
    this.ctx.actionQueue.push(
      new EndGamection(
        {
          winnerId: this.ctx.playerManager.getActivePlayer().opponent.id
        },
        this.ctx
      )
    );
  }
}
