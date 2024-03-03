import { AddEffectAction } from '../action/add-effect.action';
import type { Point3D } from '../types';
import { KEYWORDS } from '../utils/keywords';
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

    this.ctx.actionQueue.push(
      new AddEffectAction(
        {
          sourceId: this.attachedTo!.id,
          attachedTo: entity.id,
          effectId: 'frozen',
          effectArg: {
            duration: 1
          }
        },
        this.ctx
      )
    );
  }
}
