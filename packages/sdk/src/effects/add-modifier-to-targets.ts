import { pointsToEntities } from '../entity/entity-utils';
import { MODIFIERS } from '../modifier/modifier-lookup';
import type { Keyword } from '../utils/keywords';
import type { Effect } from './effect';

export const addModifierToTargets = <T extends keyof typeof MODIFIERS>({
  id,
  meta,
  description,
  keywords
}: {
  id: T;
  meta: InstanceType<(typeof MODIFIERS)[T]>['meta'];
  description: string;
  keywords: Keyword[];
}): Effect => ({
  description,
  keywords,
  execute(ctx, entity, targets) {
    const effectClass = MODIFIERS[id];

    pointsToEntities(ctx, targets).forEach(target => {
      new effectClass(ctx, entity, meta as any).attach(target);
    });
  }
});
