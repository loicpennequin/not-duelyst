import { thorns, tough } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';
import { isSelf } from '../../../utils/targeting';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';

export const f1Elemental: CardBlueprint = {
  id: 'f1_placeholder',
  name: 'F1 Golem',
  description: '',
  rarity: RARITIES.BASIC,
  collectable: true,
  factions: [FACTIONS.F1, null, null],
  spriteId: 'f1_placeholder',
  kind: CARD_KINDS.MINION,
  cooldown: 4,
  initialCooldown: 0,
  cost: 3,
  attack: 2,
  maxHp: 6,
  speed: 3,
  range: 1,
  skills: [
    {
      id: 'f1_elemental_golem',
      cooldown: 2,
      iconId: 'golem',
      name: 'Stone Skin',
      description: 'Gain @Thorns@ and @Tough@ for one turn.',
      initialCooldown: 0,
      minTargetCount: 1,
      maxTargetCount: 1,
      isTargetable(point, { session, skill }) {
        return isSelf(skill.caster, session.entitySystem.getEntityAt(point));
      },
      isInAreaOfEffect(point, { session, skill }) {
        return isSelf(skill.caster, session.entitySystem.getEntityAt(point));
      },
      keywords: [KEYWORDS.TOUGH, KEYWORDS.THORNS],
      onUse({ skill }) {
        skill.caster.addModifier(tough({ source: skill.caster, duration: 1 }));
        skill.caster.addModifier(thorns({ source: skill.caster, duration: 1 }));
      }
    }
  ]
};
