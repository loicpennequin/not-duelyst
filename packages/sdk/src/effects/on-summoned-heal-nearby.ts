import { HealAction } from '../action/heal.action';
import { KEYWORDS } from '../utils/keywords';
import type { Effect } from './effect';

export const onSummonedHealNearby = (amount: number): Effect => ({
  description: `Summon: heal nearby enemies for ${amount}.`,
  keywords: [KEYWORDS.SUMMON, KEYWORDS.TAUNT],
  execute(ctx, entity) {
    const nearby = ctx.entityManager.getNearbyAllies(entity.position, entity.playerId);
    ctx.actionQueue.push(
      new HealAction(
        {
          amount,
          sourceId: entity.id,
          targets: nearby.map(e => e.id)
        },
        ctx
      )
    );
  }
});
