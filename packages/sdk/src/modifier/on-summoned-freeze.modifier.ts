import type { Point3D } from '../types';
import { KEYWORDS } from '../utils/keywords';
import { StunnedModifier } from './frozen.modifier';
import { OnSummonedModifier } from './on-summoned.modifier';

export class OnSummonedFreezeModifier extends OnSummonedModifier<{ targets: [Point3D] }> {
  id = 'onSummonFreeze';

  getDescription(): string {
    return 'Summon: freeze an enemy.';
  }

  getKeywords() {
    return [KEYWORDS.SUMMON, KEYWORDS.FROZEN];
  }

  listener() {
    const entity = this.ctx.entityManager.getEntityAt(this.meta.targets[0]);
    if (!entity) return;

    new StunnedModifier(this.ctx, this.attachedTo!, { duration: 1 }).attach(entity);
  }
}
