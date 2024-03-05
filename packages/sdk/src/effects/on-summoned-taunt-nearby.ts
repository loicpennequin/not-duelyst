import { AddEffectAction } from '../action/add-effect.action';
import { KEYWORDS } from '../utils/keywords';
import type { Effect } from './effect';

export const onSummonedTauntNearby = (): Effect => ({
  description: 'Summon: taunt nearby enemies.',
  keywords: [KEYWORDS.SUMMON, KEYWORDS.TAUNT],
  execute(ctx, entity) {
    const enemies = ctx.entityManager.getNearbyEnemies(entity.position, entity.playerId);

    enemies.forEach(enemy => {
      ctx.actionQueue.push(
        new AddEffectAction(
          {
            attachedTo: enemy.id,
            sourceId: entity.id,
            effectId: 'taunted',
            effectArg: { duration: 1, radius: 1 }
          },
          ctx
        )
      );
    });
  }
});
