import { isNearbyEnemy } from '../../../entity/entity-utils';
import { createEntityModifier } from '../../../modifier/entity-modifier';
import { modifierSelfEventMixin } from '../../../modifier/mixins/self-event.mixin';
import { burn, fury } from '../../../modifier/modifier-utils';
import { KEYWORDS } from '../../../utils/keywords';
import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, CARD_KINDS, FACTIONS } from '../../card-enums';

export const f2MoltenFist: CardBlueprint = {
  id: 'f2_molten_first',
  name: 'F2 Molten Fist',
  description: '@Fury@.\nAfter attacking a minion, inflict @Burn(1)@ to it',
  collectable: true,
  rarity: RARITIES.EPIC,
  faction: FACTIONS.F2,
  factions: { f2: 4 },
  spriteId: 'f2_fire_fist',
  kind: CARD_KINDS.MINION,
  cost: 4,
  attack: 3,
  maxHp: 6,
  speed: 3,
  range: 1,
  keywords: [KEYWORDS.BURN],
  onPlay({ entity }) {
    entity.addModifier(fury({ source: entity }));

    entity.addModifier(
      createEntityModifier({
        source: entity,
        stackable: false,
        visible: false,
        mixins: [
          modifierSelfEventMixin({
            eventName: 'after_attack',
            listener([{ target }]) {
              if (target.isGeneral) return;
              target.addModifier(burn({ source: entity }));
            }
          })
        ]
      })
    );
  },
  skills: [
    {
      id: 'f2_molten_fist_skill1',
      name: 'F2 Molten Fist Skill1',
      description:
        'Deal 2 damage to a unit. If it dies, inflict @Burn(2)@ to all nearby minions.',
      iconId: 'shatter-fire',
      initialCooldown: 0,
      cooldown: 2,
      minTargetCount: 1,
      maxTargetCount: 1,
      keywords: [KEYWORDS.BURN],
      isTargetable(point, { skill, session }) {
        return isNearbyEnemy(session, skill.caster, point);
      },
      isInAreaOfEffect(point, { session, castPoints, skill }) {
        const [target] = castPoints;
        if (!target) return false;
        const entity = session.entitySystem.getEntityAt(target);
        if (!isNearbyEnemy(session, skill.caster, target)) return false;

        if (entity?.position.equals(point)) return true;
        return session.entitySystem
          .getNearbyAllies(entity!)
          .some(ally => ally.position.equals(point));
      },
      onUse({ session, skill, castPoints }) {
        const target = session.entitySystem.getEntityAt(castPoints[0]);
        if (!target) return;

        const onDestroyed = () => {
          session.entitySystem.getNearbyAllies(target).forEach(nearby => {
            if (!nearby.isGeneral) {
              nearby.addModifier(burn({ source: skill.caster, stacks: 2 }));
            }
          });
        };
        target.once('before_destroy', onDestroyed);

        skill.caster.once('after_deal_damage', () => {
          session.actionSystem.schedule(() => {
            target.off('before_destroy', onDestroyed);
          });
        });

        skill.caster.dealDamage(2, target);
      }
    }
  ]
};
