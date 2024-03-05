import { HealAction } from '../action/heal.action';
import { pointsToEntityIds } from '../entity/entity-utils';
import { KEYWORDS } from '../utils/keywords';
import type { Effect } from './effect';

export const onSummonedHealNearby = (amount: number): Effect => ({
  description: `Summon: heal nearby enemies for ${amount}.`,
  keywords: [KEYWORDS.SUMMON, KEYWORDS.TAUNT],
  execute(ctx, entity, targets) {
    ctx.actionQueue.push(
      new HealAction(
        {
          amount,
          sourceId: entity.id,
          targets: pointsToEntityIds(ctx, targets)
        },
        ctx
      )
    );
  }
});
