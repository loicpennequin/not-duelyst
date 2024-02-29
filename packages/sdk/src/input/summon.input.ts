import { z } from 'zod';
import { PlayerInput, defaultInputSchema } from './input';
import { INPUT_NAME } from './input-reducer';
import { UNITS, UnitId, isUnitId } from '../units/unit-lookup';
import { SummonFromLoadoutAction } from '../action/summon-from-loadout.action';

const summonEventSchema = defaultInputSchema.extend({
  unitId: z
    .string()
    .refine(val => isUnitId(val))
    .transform(val => val as UnitId),
  position: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number()
  }),
  targets: z
    .object({
      x: z.number(),
      y: z.number(),
      z: z.number()
    })
    .array()
});

export class SummonInput extends PlayerInput<typeof summonEventSchema> {
  readonly name = INPUT_NAME.SUMMON;

  protected payloadSchema = summonEventSchema;

  get unit() {
    return UNITS[this.payload.unitId];
  }

  get isTargetCountValid() {
    if (!this.unit) return false;
    if (!this.unit.onSummoned) return true;
    return true;
    // return (
    //   this.payload.targets.length >= this.unit.onSummoned.minTargetCount &&
    //   this.payload.targets.length <= this.unit.onSummoned.maxTargetCount
    // );
  }

  private get canSummon() {
    return (
      this.isTargetCountValid &&
      this.ctx.map.canSummonAt(this.payload.position) &&
      this.ctx.playerManager.getActivePlayer().canSummon(this.payload.unitId)
    );
  }

  impl() {
    if (!this.canSummon) return;
    this.ctx.actionQueue.push(new SummonFromLoadoutAction(this.payload, this.ctx));
  }
}
