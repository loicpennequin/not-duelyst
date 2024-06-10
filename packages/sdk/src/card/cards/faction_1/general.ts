import { config } from '../../../config';
import { isEmpty } from '../../../entity/entity-utils';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS, FACTION_IDS } from '../../card-enums';
import { isCastPoint, isWithinCells } from '../../../utils/targeting';
import { KEYWORDS } from '../../../utils/keywords';
import { rush } from '../../../modifier/modifier-utils';
import { f1Wisp } from './wisp';
import { neutralAirElemental } from '../neutral/air-elemental';

export const f1General: CardBlueprint = {
  id: 'f1_general',
  name: 'F1 General',
  description: '',
  rarity: RARITIES.BASIC,
  collectable: true,
  faction: FACTIONS.F1,
  factions: {},
  spriteId: 'f1_general',
  kind: CARD_KINDS.GENERAL,
  cost: 0,
  attack: config.GENERAL_DEFAULT_ATTACK,
  maxHp: config.GENERAL_DEFAULT_HP,
  speed: config.GENERAL_DEFAULT_SPEED,
  range: 1,
  relatedBlueprintIds: [f1Wisp.id, neutralAirElemental.id],
  skills: [
    {
      id: 'f1_general_skill',
      name: 'Summon Wisp',
      description: `Summon a @${f1Wisp.name}@ with @${KEYWORDS.RUSH.name}@ nearby your general. It dies at the end of the turn.`,
      cooldown: 2,
      initialCooldown: 0,
      iconId: 'summon-wisp',
      keywords: [KEYWORDS.RUSH],
      minTargetCount: 1,
      maxTargetCount: 1,
      isTargetable(point, { session, skill }) {
        return isEmpty(session, point) && isWithinCells(skill.caster.position, point, 1);
      },
      isInAreaOfEffect(point, { castPoints }) {
        return isCastPoint(point, castPoints);
      },
      async onUse({ session, skill, castPoints }) {
        const card = skill.caster.player.generateCard({
          blueprintId: f1Wisp.id,
          pedestalId: skill.caster.card.pedestalId,
          modifiers: [rush()]
        });

        const entity = await card.play({
          position: castPoints[0],
          targets: []
        });

        session.once('player:turn_end', () => {
          entity.destroy();
        });
      }
    },
    {
      id: 'f1_general_skill2',
      name: 'Summon Air Elemental',
      description: `@${FACTION_IDS.F1}(4)@Summon@ a @${neutralAirElemental.name}@ on a space nearby an allied unit.`,
      cooldown: 5,
      initialCooldown: 4,
      runes: {
        f1: 4
      },
      iconId: 'summon-air-elemental',
      minTargetCount: 1,
      maxTargetCount: 1,
      isTargetable(point, { session, skill }) {
        return session.entitySystem
          .getNearbyEntities(point)
          .some(entity => skill.caster.isAlly(entity.id));
      },
      isInAreaOfEffect(point, { castPoints }) {
        return isCastPoint(point, castPoints);
      },
      async onUse({ session, skill, castPoints }) {
        const card = skill.caster.player.generateCard({
          blueprintId: neutralAirElemental.id,
          pedestalId: skill.caster.card.pedestalId
        });

        await card.play({
          position: castPoints[0],
          targets: []
        });
      }
    }
  ]
};
