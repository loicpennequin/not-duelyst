import mitt from 'mitt';
import { GameSession } from '../game-session';
import { GameAction } from './action';
import { ActionDeserializer, SerializedAction } from './action-deserializer';

export class ActionQueue {
  private queue: GameAction<any>[] = [];
  private deserializer: ActionDeserializer;
  private isRunning = false;
  readonly emitter = mitt<{ processed: null }>();

  constructor(private ctx: GameSession) {
    this.deserializer = new ActionDeserializer(this.ctx);
  }

  private async process() {
    this.isRunning = true;
    do {
      const action = this.queue.shift();

      await action?.execute();
    } while (this.queue.length);
    this.isRunning = false;
    this.emitter.emit('processed', null);
  }

  push(action: GameAction<any> | SerializedAction) {
    this.queue.push(
      action instanceof GameAction ? action : this.deserializer.deserialize(action)
    );

    if (!this.isRunning) {
      this.process();
    }
  }
}
