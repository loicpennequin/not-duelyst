import type { Constructor } from '@hc/shared';
import { pointsToEntities } from '../entity/entity-utils';
import type { Keyword } from '../utils/keywords';
import type { Effect } from './effect';
import type { Modifier } from '../modifier/modifier';

export const addModifierToTargets = <T extends Modifier>(
  ctor: Constructor<T>,
  {
    meta,
    description,
    keywords
  }: {
    meta: T['meta'];
    description: string;
    keywords: Keyword[];
  }
): Effect => ({
  description,
  keywords,
  execute(ctx, entity, targets) {
    pointsToEntities(ctx, targets).forEach(target => {
      new ctor(ctx, entity, meta as any).attach(target);
    });
  }
});
