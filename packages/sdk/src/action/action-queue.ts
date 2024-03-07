import mitt from 'mitt';
import { GameSession } from '../game-session';
import { GameAction } from './action';
import { ActionDeserializer, type SerializedAction } from './action-deserializer';

export class ActionQueue {
  private queue: GameAction<any>[] = [];
  private deserializer: ActionDeserializer;
  private isRunning = false;
  readonly emitter = mitt<{ processed: GameAction<any>[] }>();

  constructor(private ctx: GameSession) {
    this.deserializer = new ActionDeserializer(this.ctx);
  }

  private async process() {
    this.isRunning = true;
    const processed: GameAction<any>[] = [];
    do {
      const action = this.queue.shift();
      if (action) {
        await action.execute();
        processed.push(action);
      }
    } while (this.queue.length);
    this.isRunning = false;
    this.emitter.emit('processed', processed);
  }

  private commit(action: GameAction<any> | SerializedAction) {
    this.queue.push(
      action instanceof GameAction ? action : this.deserializer.deserialize(action)
    );

    if (!this.isRunning) {
      this.process();
    }
  }

  push(action: GameAction<any> | SerializedAction) {
    if (!this.ctx.isReady) return;
    this.commit(action);
  }

  async setup(rawHistory: SerializedAction[]) {
    rawHistory.forEach(action => {
      this.queue.push(this.deserializer.deserialize(action));
    });

    this.process();
  }
}
