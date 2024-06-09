import { z } from 'zod';
import { GameAction, defaultActionSchema } from './action';
import { FACTION_IDS } from '../card/card-enums';

const schema = defaultActionSchema.extend({
  factionId: z.enum([
    FACTION_IDS.F1,
    FACTION_IDS.F2,
    FACTION_IDS.F3,
    FACTION_IDS.F4,
    FACTION_IDS.F5
  ])
});

export class AddRuneAction extends GameAction<typeof schema> {
  readonly name = 'addRune';

  protected payloadSchema = schema;

  async impl() {
    if (!this.player.canPerformResourceAction) {
      this.player.addRune(this.payload.factionId);
    }
  }
}
