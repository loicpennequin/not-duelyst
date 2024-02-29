import { EFFECTS, EFFECT_NAMES } from '../effect/effect-lookup';
import { Entity, SerializedEntity } from '../entity/entity';
import { Point3D } from '../types';
import { UNITS } from '../units/unit-lookup';
import { GameAction } from './action';

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

    const entity = this.ctx.entityManager.addEntity(this.payload);

    const hasRush = entity.effects.some(e => e.id === EFFECT_NAMES.RUSH);
    if (!hasRush) {
      new EFFECTS.exhausted(this.ctx, entity, {}).attach(entity);
    }

    // if (unit.onSummoned) {
    //   unit.onSummoned.execute(this.ctx, this.payload.targets, entity);
    // }
  }
}
