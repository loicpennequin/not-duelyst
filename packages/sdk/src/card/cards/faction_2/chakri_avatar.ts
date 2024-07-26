import { defineSerializedBlueprint } from '../../card-blueprint';
import { CARD_KINDS, FACTION_IDS, RARITIES } from '../../card-enums';
import { fixedAmount } from '../../helpers/amount';

export const f2ChakirAvatar = defineSerializedBlueprint({
  id: '_JmYvh',
  name: 'Chakir Avatar',
  collectable: true,
  keywords: [],
  relatedBlueprintIds: [],
  tags: [],
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  spriteId: 'f2_chakri_avatar',
  cost: 2,
  attack: 1,
  maxHp: 2,
  faction: FACTION_IDS.F2,
  effects: [
    {
      text: 'When you play a spell, this gains +1/+1.',
      config: {
        executionContext: 'while_on_board',
        triggers: [
          {
            type: 'on_after_card_played',
            params: {
              card: [
                [
                  { type: 'spell' },
                  {
                    type: 'from_player',
                    params: {
                      player: [[{ type: 'ally_player' }]]
                    }
                  }
                ]
              ]
            }
          }
        ],
        actions: [
          {
            type: 'change_stats',
            params: {
              mode: 'give',
              stackable: true,
              attack: {
                amount: fixedAmount(1),
                activeWhen: []
              },
              hp: {
                amount: fixedAmount(1),
                activeWhen: []
              },
              targets: [[{ type: 'is_self' }]],
              filter: [],
              execute: 'now'
            }
          }
        ]
      }
    }
  ]
});
