import { StunnedModifier } from '../modifier/frozen.modifier';
import { KEYWORDS } from '../utils/keywords';
import type { Effect } from './effect';

export const onSummonedFreezeNearby = (duration = 1): Effect => ({
  description: 'Summon: freeze nearby enemies.',
  keywords: [KEYWORDS.SUMMON, KEYWORDS.FROZEN],
  execute(ctx, entity) {
    const enemies = ctx.entityManager.getNearbyEnemies(entity.position, entity.playerId);

    enemies.forEach(enemy => {
      new StunnedModifier(ctx, entity, { duration }).attach(enemy);
    });
  }
});
