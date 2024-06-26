import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS, FACTIONS, FACTION_IDS } from '../../card-enums';
import { isSelf } from '../../../utils/targeting';
import { celerity, elusive, fury, nimble } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';

export const f1Dancer: CardBlueprint = {
  id: 'f1_dancer',
  name: 'F1 Dancer',
  description: '@Nimble@.\n@Celerity@',
  collectable: true,
  rarity: RARITIES.RARE,
  faction: FACTIONS.F1,
  factions: {
    f1: 2
  },
  spriteId: 'f1_dancer',
  kind: CARD_KINDS.MINION,
  cost: 4,
  attack: 2,
  maxHp: 6,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.NIMBLE, KEYWORDS.CELERITY],
  onPlay({ entity }) {
    entity.addModifier(nimble({ source: entity }));
    entity.addModifier(celerity({ source: entity }));
  },
  skills: [
    {
      id: 'f1_dancer_skill_1',
      cooldown: 4,
      description: `@${FACTION_IDS.F1}(4)@Gain @Fury@ and @Elusive@ 2 turns`,
      name: 'Battle dance',
      iconId: 'chakram-dance',
      initialCooldown: 0,
      minTargetCount: 0,
      maxTargetCount: 1,
      runes: { f1: 4 },
      keywords: [KEYWORDS.FURY, KEYWORDS.ELUSIVE],
      isTargetable(point, { session, skill }) {
        return isSelf(skill.caster, session.entitySystem.getEntityAt(point));
      },
      isInAreaOfEffect(point, { session, skill }) {
        return isSelf(skill.caster, session.entitySystem.getEntityAt(point));
      },
      onUse({ skill }) {
        skill.caster.addModifier(fury({ source: skill.caster, duration: 2 }));
        skill.caster.addModifier(elusive({ source: skill.caster, duration: 2 }));
      }
    }
  ]
};
