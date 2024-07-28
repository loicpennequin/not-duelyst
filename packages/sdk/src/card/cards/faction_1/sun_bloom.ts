import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { anywhere } from '../../helpers/targeting';

export const f1SunBloom = defineSerializedBlueprint({
  id: 'sun_bloom',
  collectable: true,
  name: 'Sun Bloom',
  cost: 2,
  kind: CARD_KINDS.SPELL,
  faction: FACTION_IDS.F1,
  keywords: [],
  rarity: RARITIES.RARE,
  relatedBlueprintIds: [],
  spriteId: 'icon_f1_sun_bloom',
  tags: [],
  targets: {
    min: 1,
    targets: [anywhere()]
  },
  cellHighlights: [
    [
      {
        type: '2x2_area',
        params: { topLeft: [[{ type: 'is_manual_target', params: { index: 0 } }]] }
      }
    ]
  ],
  effects: [
    {
      text: 'Dispel spaces in a 2x2 area.',
      config: {
        executionContext: 'immediate',
        actions: [
          {
            type: 'dispel_cell',
            params: {
              cells: [
                [
                  {
                    type: '2x2_area',
                    params: {
                      topLeft: [[{ type: 'is_manual_target', params: { index: 0 } }]]
                    }
                  }
                ]
              ]
            }
          }
        ]
      }
    }
  ]
});
