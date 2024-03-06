import { AddEffectAction } from '../action/add-effect.action';
import { KEYWORDS } from '../utils/keywords';
import type { Effect } from './effect';

export const onSummonedFreezeNearby = (duration = 1): Effect => ({
  description: 'Summon: freeze nearby enemies.',
  keywords: [KEYWORDS.SUMMON, KEYWORDS.FROZEN],
  execute(ctx, entity) {
    const enemies = ctx.entityManager.getNearbyEnemies(entity.position, entity.playerId);

    enemies.forEach(enemy => {
      ctx.actionQueue.push(
        new AddEffectAction(
          {
            attachedTo: enemy.id,
            sourceId: entity.id,
            effectId: 'frozen',
            effectArg: { duration }
          },
          ctx
        )
      );
    });
  }
});
