import { isDefined } from '@hc/shared';
import { DealDamageAction } from '../action/deal-damage.action';
import { KEYWORDS } from '../utils/keywords';
import type { Effect } from './effect';

export const onSummonDealDamage = (amount: number): Effect => ({
  description: `Summon: deal ${amount} damage to a nearby enemy.`,
  keywords: [KEYWORDS.SUMMON],
  execute(ctx, entity, targets) {
    ctx.actionQueue.push(
      new DealDamageAction(
        {
          amount,
          shouldRetaliate: false,
          sourceId: entity.id,
          targets: targets
            .map(ctx.entityManager.getEntityAt)
            .filter(isDefined)
            .map(e => e.id)
        },
        ctx
      )
    );
  }
});
