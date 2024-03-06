import { TauntedModifier } from '../modifier/taunted.modifier';
import { KEYWORDS } from '../utils/keywords';
import type { Effect } from './effect';

export const onSummonedTauntNearby = (duration = 1, radius = 1): Effect => ({
  description: 'Summon: taunt nearby enemies.',
  keywords: [KEYWORDS.SUMMON, KEYWORDS.TAUNT],
  execute(ctx, entity) {
    const enemies = ctx.entityManager.getNearbyEnemies(entity.position, entity.playerId);

    enemies.forEach(enemy => {
      new TauntedModifier(ctx, entity, { duration, radius }).attach(enemy);
    });
  }
});
