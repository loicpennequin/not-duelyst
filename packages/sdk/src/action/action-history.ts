import { GameAction } from './action';
import { GameSession } from '../game-session';
import { Serializable } from '../utils/interfaces';
import { SerializedAction } from './action-deserializer';

export class ActionHistory implements Serializable {
  private history: GameAction<any>[] = [];

  constructor(private ctx: GameSession) {}

  setup(rawHistory: SerializedAction[]) {
    return new Promise<void>(resolve => {
      const done = () => {
        resolve();
        this.ctx.actionQueue.emitter.off('processed', done);
      };
      this.ctx.actionQueue.emitter.on('processed', done);

      if (!rawHistory.length) return done();

      rawHistory.forEach(action => this.ctx.actionQueue.push(action));
    });
  }

  add(action: GameAction<any>) {
    this.history.push(action);
  }

  get() {
    return [...this.history];
  }

  serialize() {
    return this.history.map(event => event.serialize()) as SerializedAction[];
  }
}
