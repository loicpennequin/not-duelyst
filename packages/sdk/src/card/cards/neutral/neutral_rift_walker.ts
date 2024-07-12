import { KEYWORDS } from '../../../utils/keywords';
import { defineSerializedBlueprint } from '../../card-blueprint';
import { defineCardEffect } from '../../card-effect';
import { airdropEffect } from '../../helpers/airdrop.effect';
import { fixedAmount } from '../../helpers/amount';
import { openingGambitEffect } from '../../helpers/opening-gambit.effect';
import { nearestAllDirections } from '../../helpers/targeting';

export const neutralRiftWalker = defineSerializedBlueprint({
  id: 'rift_walker',
  collectable: true,
  name: 'Rift Walker',
  cost: 3,
  attack: 2,
  maxHp: 1,
  faction: null,
  keywords: [KEYWORDS.OPENING_GAMBIT.id, KEYWORDS.AIRDROP.id],
  kind: 'MINION',
  rarity: 'epic',
  relatedBlueprintIds: [],
  speed: 2,
  spriteId: 'neutral_rift_walker',
  tags: [],
  effects: [
    airdropEffect(),
    openingGambitEffect({
      text: 'Deal 2 damage to the nearest unit in front, behind, above, and below this.',
      actions: [
        {
          type: 'deal_damage',
          params: {
            amount: fixedAmount(2),
            targets: nearestAllDirections([[{ type: 'is_self' }]])
          }
        }
      ]
    })
  ]
});
