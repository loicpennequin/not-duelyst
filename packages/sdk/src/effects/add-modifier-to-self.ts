import { MODIFIERS } from '../modifier/modifier-lookup';
import type { Keyword } from '../utils/keywords';
import type { Effect } from './effect';

export const addModifierToSelf = <T extends keyof typeof MODIFIERS>({
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
  execute(ctx, entity) {
    const effectClass = MODIFIERS[id];

    new effectClass(ctx, entity, meta as any).attach(entity);
  }
});
