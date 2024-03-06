import type { SerializedEntity } from '../entity/entity';
import type { Point3D } from '../types';
import { UNITS } from '../units/unit-lookup';
import { GameAction } from './action';
import { ExhaustedModifier } from '../modifier/exhausted.modifier';
import { RushModifier } from '../modifier/rush.modifier';

export class SummonFromLoadoutAction extends GameAction<
  Omit<SerializedEntity, 'id'> & { targets: Point3D[] }
> {
  readonly name = 'SUMMON_FROM_LOADOUT';

  protected fxImpl() {
    this.ctx.fxContext?.playSoundOnce('summon-placeholder');
    return Promise.resolve();
  }

  get logMessage() {
    return `${this.payload.playerId} summons ${UNITS[this.payload.unitId].id}`;
  }

  get player() {
    const player = this.ctx.playerManager.getPlayerById(this.payload.playerId);
    if (!player) throw new Error(`Player not found: ${this.payload.playerId}`);
    return player;
  }

  protected impl() {
    const unit = UNITS[this.payload.unitId];
    this.player.summonFromLoadout(unit);

    const entity = this.ctx.entityManager.addEntity(this.payload, this.payload.targets);

    const hasRush = entity.modifiers.some(e => e instanceof RushModifier);

    if (!hasRush) {
      new ExhaustedModifier(this.ctx, entity, {}).attach(entity);
    }
  }
}
