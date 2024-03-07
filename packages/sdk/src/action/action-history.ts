import { GameAction } from './action';
import { GameSession } from '../game-session';
import type { Serializable } from '../utils/interfaces';
import type { SerializedAction } from './action-deserializer';

export class ActionHistory implements Serializable {
  private history: GameAction<any>[] = [];

  constructor(private ctx: GameSession) {}

  setup(rawHistory: SerializedAction[]) {
    return new Promise<void>(resolve => {
      const done = (actions: GameAction<any>[]) => {
        if (this.ctx.isAuthoritative) {
          this.history.push(...actions);
        }
        resolve();
        this.ctx.actionQueue.emitter.off('processed', done);
      };
      this.ctx.actionQueue.emitter.on('processed', done);

      if (!rawHistory.length) return done([]);

      this.ctx.actionQueue.setup(rawHistory);
    });
  }

  add(action: GameAction<any>) {
    if (this.ctx.isAuthoritative && !this.ctx.isReady) return;
    this.history.push(action);
  }

  get() {
    return [...this.history];
  }

  serialize() {
    return this.history.map(event => event.serialize()) as SerializedAction[];
  }
}
