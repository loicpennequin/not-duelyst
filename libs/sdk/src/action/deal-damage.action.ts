import { EntityId, isEntityId } from '../entity/entity';
import { InteractableId } from '../interactable/interactable';
import { GameAction } from './action';
import { DieAction } from './die.action';

export class DealDamageAction extends GameAction<{
  amount: number;
  sourceId: EntityId | InteractableId;
  targets: EntityId[];
}> {
  readonly name = 'DEAL_DAMAGE';

  get attacker() {
    if (!isEntityId(this.payload.sourceId, this.ctx)) return null;

    const attacker = this.ctx.entityManager.getEntityById(this.payload.sourceId);
    if (!attacker) throw new Error(`Entity not found: ${this.payload.sourceId}`);
    return attacker;
  }

  get targets() {
    return this.payload.targets.map(targetId => {
      const target = this.ctx.entityManager.getEntityById(targetId);
      if (!target) throw new Error(`Entity not found: ${targetId}`);
      return target;
    });
  }

  get logMessage() {
    return `${this.attacker?.unitId ?? this.payload.sourceId} deals ${this.targets
      .map(t => `${this.payload.amount} damage to ${t.unitId}`)
      .join(', ')}.`;
  }

  protected async fxImpl() {
    if (!this.ctx.fxContext) return;
    if (!this.payload.targets.length) return;

    this.ctx.fxContext.playSoundOnce('hit-placeholder');

    await Promise.all(
      this.payload.targets.map(targetId => {
        const target = this.ctx.entityManager.getEntityById(targetId);
        const amount = this.payload.amount;

        this.ctx.fxContext?.displayText(
          String(target?.getTakenDamage(amount)),
          targetId,
          {
            color: 0xff0000,
            duration: 1,
            path: [
              { x: 0, y: 25, alpha: 0, scale: 0 },
              { x: 0, y: 0, alpha: 0, scale: 1 },
              { x: 0, y: 0, alpha: 1, scale: 1 }
            ]
          }
        );
        this.ctx.fxContext?.addChildAnimatedSprite('blood_01', targetId, {
          waitUntilAnimationDone: false,
          offset: { x: 0, y: 32 },
          scale: 0.5
        });
        return this.ctx.fxContext?.shakeEntity(targetId, {
          count: 6,
          totalDuration: 0.4,
          axis: 'x',
          amount: 1
        });
      })
    );
  }

  protected impl() {
    this.payload.targets.forEach(targetId => {
      const target = this.ctx.entityManager.getEntityById(targetId)!;

      if (this.attacker) {
        this.attacker.dealDamage(this.payload.amount, target);
      } else {
        target.takeDamage(this.payload.amount, null);
      }
    });
  }
}
