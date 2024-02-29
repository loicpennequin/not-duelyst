import { PlayerInput, defaultInputSchema } from './input';
import { INPUT_NAME } from './input-reducer';
import { EndTurnAction } from '../action/end-turn.action';

const endTurnEventSchema = defaultInputSchema;

export class EndTurnInput extends PlayerInput<typeof endTurnEventSchema> {
  readonly name = INPUT_NAME.END_TURN;

  protected payloadSchema = endTurnEventSchema;

  impl() {
    if (this.ctx.playerManager.getActivePlayer().id === this.payload.playerId) {
      this.ctx.actionQueue.push(
        new EndTurnAction({ playerId: this.payload.playerId }, this.ctx)
      );
    }
  }
}
