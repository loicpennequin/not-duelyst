import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { fixedAmount } from '../../helpers/amount';

export const f2Rythmweaver = defineSerializedBlueprint({
  id: 'f2_rythmweaver',
  name: 'Rythmweaver',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  spriteId: 'f2_rythmweaver',
  cost: 1,
  attack: 2,
  maxHp: 1,
  faction: FACTION_IDS.F2,
  effects: [
    {
      text: 'After this takes damage, draw a spell',
      config: {
        executionContext: 'while_on_board',
        triggers: [
          {
            type: 'on_after_unit_take_damage',
            params: {
              target: [[{ type: 'is_self', params: {} }]],
              unit: [],
              frequency: {
                type: 'always'
              }
            }
          }
        ],
        actions: [
          {
            type: 'draw_cards',
            params: {
              amount: fixedAmount(1),
              player: [[{ type: 'ally_player' }]],
              filter: [],
              execute: 'now',
              kind: CARD_KINDS.SPELL
            }
          }
        ]
      }
    }
  ]
});