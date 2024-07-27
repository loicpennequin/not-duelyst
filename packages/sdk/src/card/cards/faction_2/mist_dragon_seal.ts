import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { fixedAmount } from '../../helpers/amount';

export const f2MistDragonSeal = defineSerializedBlueprint({
  id: 'f2_mist_dragon_seal',
  collectable: true,
  keywords: [],
  name: 'Mist Dragon Seal',
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  spriteId: 'icon_f2_mist_dragon_seal',
  cost: 2,
  faction: FACTION_IDS.F2,
  targets: {
    min: 1,
    targets: [
      [
        [
          {
            type: 'has_unit',
            params: { unit: [[{ type: 'is_ally' }, { type: 'is_minion' }]] }
          }
        ]
      ],
      [[{ type: 'is_empty' }]]
    ]
  },
  effects: [
    defineCardEffect({
      text: 'Give an allied minion +1/+1 and teleport it to any space.',
      config: {
        actions: [
          {
            type: 'change_stats',
            params: {
              mode: 'give',
              stackable: true,
              attack: { amount: fixedAmount(1), activeWhen: [] },
              hp: { amount: fixedAmount(1), activeWhen: [] },
              targets: [[{ type: 'is_manual_target', params: { index: 0 } }]],
              filter: [],
              duration: 'always',
              execute: 'now'
            }
          },
          {
            type: 'teleport_unit',
            params: {
              unit: [[{ type: 'is_manual_target', params: { index: 0 } }]],
              cell: [[{ type: 'is_manual_target', params: { index: 1 } }]],
              filter: [],
              execute: 'now'
            }
          }
        ],
        executionContext: 'immediate'
      }
    })
  ]
});
