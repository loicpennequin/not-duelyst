import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS } from '../../card-enums';

export const neutralFireElemental: CardBlueprint = {
  id: 'fire-elemental',
  name: 'Neutral Fire Elemental',
  description: '',
  collectable: false,
  rarity: RARITIES.BASIC,
  factions: [null, null, null],
  spriteId: 'neutral_fire_elemental',
  kind: CARD_KINDS.MINION,
  cooldown: 5,
  initialCooldown: 0,
  cost: 4,
  attack: 2,
  maxHp: 7,
  speed: 3,
  range: 1,
  skills: []
};
