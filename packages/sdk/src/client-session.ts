import { randomInt, type Point3D } from '@game/shared';
import type { EntityId } from './entity/entity';
import type { FXSystem } from './fx-system';
import { GameSession, type SerializedGameState } from './game-session';
import type { SerializedAction } from './action/action';
import { match } from 'ts-pattern';
import { ClientRngSystem } from './rng-system';

export type FxEvent =
  | { type: 'entity:destroyed'; payload: { entityId: EntityId } }
  | { type: 'entity:moved'; payload: { entityId: EntityId; path: Point3D[] } }
  | { type: 'entity:take-damage'; payload: { entityId: EntityId } }
  | { type: 'entity:attack'; payload: { entityId: EntityId; targetId: EntityId } }
  | { type: 'entity:retaliate'; payload: { entityId: EntityId; targetId: EntityId } };

export class ClientSession extends GameSession {
  static create(state: SerializedGameState, fxSystem: FXSystem, winnerId?: string) {
    const rngSystem = new ClientRngSystem();
    rngSystem.values = state.rng.values;
    return new ClientSession(state, rngSystem, fxSystem, { winnerId });
  }

  private async handleFxEvents(events: FxEvent[]) {
    for (const [index, event] of events.entries()) {
      await match(event)
        .with({ type: 'entity:moved' }, async ({ payload }) => {
          const stopRunning = this.fxSystem.playAnimationUntil(payload.entityId, 'run');
          await this.fxSystem.moveEntity(
            payload.entityId,
            payload.path.map(point => ({
              point,
              duration: 0.4
            }))
          );
          stopRunning();
        })
        .with({ type: 'entity:attack' }, async ({ payload }) => {
          await this.fxSystem.playAnimation(payload.entityId, 'attack', {
            framePercentage: 0.75
          });
          await this.fxSystem.attack(payload.entityId, payload.targetId);
        })
        .with({ type: 'entity:take-damage' }, async ({ payload }) => {
          const bloodFx = randomInt(4);
          const effects = [
            this.fxSystem.playSfxOnEntity(payload.entityId, {
              resourceName: 'fx_bloodground',
              animationName:
                bloodFx <= 1 ? 'default' : `bloodground${bloodFx ? bloodFx : ''}`,
              offset: {
                x: 0,
                y: 20
              }
            }),
            this.fxSystem.playAnimation(payload.entityId, 'hit'),
            this.fxSystem.shakeEntity(payload.entityId, {
              amount: 5,
              axis: 'x',
              count: 3,
              totalDuration: 0.3
            })
          ];
          const next = events[index + 1];
          if (next?.type !== 'entity:take-damage') {
            await Promise.all(effects);
          }
        })
        .with({ type: 'entity:retaliate' }, async ({ payload }) => {
          await this.fxSystem.playAnimation(payload.entityId, 'attack', {
            framePercentage: 0.75
          });
          await this.fxSystem.attack(payload.entityId, payload.targetId);
        })
        .with({ type: 'entity:destroyed' }, async ({ payload }) => {
          await this.fxSystem.playAnimation(payload.entityId, 'death');
          await this.fxSystem.fadeOutEntity(payload.entityId, 0.8);
        })
        .exhaustive();
    }
  }

  dispatch(
    action: SerializedAction,
    meta: { fxEvents: FxEvent[]; rngValues: number[] } = { fxEvents: [], rngValues: [] }
  ) {
    this.rngSystem.values = meta.rngValues;
    this.handleFxEvents(meta.fxEvents).then(() => {
      super.dispatch(action);
    });
  }
}
