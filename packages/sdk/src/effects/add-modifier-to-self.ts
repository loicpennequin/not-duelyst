import type { Constructor } from '@hc/shared';
import type { Modifier } from '../modifier/modifier';
import type { Keyword } from '../utils/keywords';
import type { Effect } from './effect';

export const addModifierToSelf = <T extends Modifier>(
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
  execute(ctx, entity) {
    new ctor(ctx, entity, meta as any).attach(entity);
  }
});
