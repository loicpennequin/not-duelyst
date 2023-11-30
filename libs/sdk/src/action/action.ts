import { z } from 'zod';
import { GameContext } from '../game';
import { ActionName, RawAction } from './action-reducer';

export const defaultActionSchema = z.object({
  playerId: z.string()
});

export abstract class GameAction<TSchema extends typeof defaultActionSchema> {
  protected abstract name: ActionName;

  protected abstract payloadSchema: TSchema;

  protected payload!: z.infer<TSchema>;

  constructor(
    protected rawPayload: unknown,
    protected ctx: GameContext
  ) {}

  protected abstract impl(): void;

  execute() {
    const parsed = this.payloadSchema.safeParse(this.rawPayload);
    if (!parsed.success) return;
    this.payload = parsed.data;

    return this.impl();
  }

  serialize(): RawAction {
    return { type: this.name, payload: this.rawPayload };
  }
}
