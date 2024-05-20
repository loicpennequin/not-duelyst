import { getCellInFront, isEnemyMinion } from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import {
  getAffectedEntities,
  isCastPoint,
  isWithinCells
} from '../../../utils/targeting';
import { KEYWORDS } from '../../../utils/keywords';
import { fury, rooted } from '../../../modifier/modifier-utils';

export const f2Tormentor: CardBlueprint = {
  id: 'f2_tormentor',
  name: 'F2 Tormentor',
  description: '@Fury@.',
  collectable: true,
  rarity: RARITIES.RARE,
  factions: [FACTIONS.F2, null, null],
  spriteId: 'f2_tormentor',
  kind: CARD_KINDS.MINION,
  cooldown: 4,
  initialCooldown: 0,
  cost: 4,
  attack: 3,
  maxHp: 5,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.FURY, KEYWORDS.CALL_TO_ARMS, KEYWORDS.ROOTED],
  async onPlay({ entity }) {
    entity.addModifier(fury({ source: entity }));
  },
  skills: [
    {
      id: 'f2_tormentor_skill1',
      name: 'F2 Tormentor Skill 1',
      description:
        'move an enemy minion in front of this unit, then @Root@ it for one turn.',
      iconId: 'hook',
      initialCooldown: 0,
      cooldown: 2,
      minTargetCount: 1,
      maxTargetCount: 1,
      isTargetable(point, { skill, session }) {
        return (
          isWithinCells(skill.caster.position, point, 3) &&
          isEnemyMinion(
            session,
            session.entitySystem.getEntityAt(point)?.id,
            skill.caster.player.id
          )
        );
      },
      isInAreaOfEffect(point, { castPoints }) {
        return isCastPoint(point, castPoints);
      },
      async onUse({ skill, session, affectedCells }) {
        const [target] = getAffectedEntities(affectedCells);
        if (!target) return;

        const cell = getCellInFront(session, skill.caster);
        if (!cell) return;
        if (!cell.canSummonAt) return;
        await target.move([cell], true);
        target.addModifier(rooted({ source: skill.caster, duration: 1 }));
      }
    }
  ]
};
