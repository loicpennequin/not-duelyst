import { EntityId } from '../entity/entity';
import { GameAction } from './action';

export class HealAction extends GameAction<{
  amount: number;
  sourceId: EntityId;
  targets: EntityId[];
}> {
  readonly name = 'HEAL';

  get source() {
    const source = this.ctx.entityManager.getEntityById(this.payload.sourceId);
    if (!source) throw new Error(`Entity not found: ${this.payload.sourceId}`);
    return source;
  }

  get targets() {
    return this.payload.targets.map(targetId => {
      const target = this.ctx.entityManager.getEntityById(targetId);
      if (!target) throw new Error(`Entity not found: ${targetId}`);
      return target;
    });
  }

  protected async fxImpl() {
    if (!this.ctx.fxContext) return;

    await Promise.all(
      this.targets.map(target => {
        this.ctx.fxContext?.displayText(String(this.payload.amount), target.id, {
          color: 0x00ff00,
          duration: 1,
          path: [
            { x: 0, y: 25, alpha: 0, scale: 0 },
            { x: 0, y: 0, alpha: 0, scale: 1 },
            { x: 0, y: 0, alpha: 1, scale: 1 }
          ]
        });
        return this.ctx.fxContext?.addChildAnimatedSprite('heal_01', target.id, {
          waitUntilAnimationDone: false,
          offset: { x: 0, y: 24 },
          scale: 1
        });
      })
    );
  }

  protected impl() {
    this.targets.forEach(target => {
      target.heal(this.payload.amount, this.source);
    });
  }
}
