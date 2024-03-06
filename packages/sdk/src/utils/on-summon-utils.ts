import { isEnemy } from '../entity/entity-utils';
import { isWithinCells } from '../skill/skill-utils';
import type { UnitBlueprint } from '../units/unit-lookup';

type OnSummoned = UnitBlueprint['onSummoned'];

export const targetOneEnemy = (range: number): OnSummoned => ({
  minTargetCount: 0,
  maxTargetCount: 1,
  isTargetable(ctx, point, summonedPoint, player) {
    const entity = ctx.entityManager.getEntityAt(point);
    if (!entity) return false;

    return (
      isEnemy(ctx, entity.id, player.id) &&
      isWithinCells(ctx, summonedPoint, point, range)
    );
  }
});
