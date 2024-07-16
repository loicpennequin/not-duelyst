import { defineSerializedBlueprint } from '../../card-blueprint';
import { FACTION_IDS } from '../../card-enums';
import { cellWithAllyGeneral } from '../../helpers/targeting';
import { whileArtifactEquipedEffect } from '../../helpers/while-artifact-equiped.effect';

export const f1SunstoneBracers = defineSerializedBlueprint({
  id: 'sunstone_bracers',
  collectable: true,
  name: 'Sunstone Bracers',
  cost: 0,
  kind: 'ARTIFACT',
  faction: FACTION_IDS.F1,
  keywords: [],
  rarity: 'common',
  relatedBlueprintIds: [],
  spriteId: 'icon_f1_artifact_sunstonebracers',
  tags: [],
  targets: {
    min: 1,
    targets: [cellWithAllyGeneral()]
  },
  effects: [
    whileArtifactEquipedEffect({
      text: 'Your general has +1/+0.',
      actions: [
        {
          type: 'change_stats',
          params: {
            targets: [[{ type: 'is_ally' }, { type: 'is_general' }]],
            attack: { type: 'fixed', params: { value: 1 } },
            hp: { type: 'fixed', params: { value: 0 } },
            stackable: true
          }
        }
      ]
    })
  ]
});
