import type { CardBlueprint } from '../../card-blueprint';
import { RARITIES, FACTIONS, CARD_KINDS } from '../../card-enums';
import { KEYWORDS } from '../../../utils/keywords';
import {
  getAffectedEntities,
  isCastPoint,
  isWithinCells
} from '../../../utils/targeting';
import { createEntityModifier } from '../../../modifier/entity-modifier';
import { modifierGameEventMixin } from '../../../modifier/mixins/game-event.mixin';
import { TRIBES } from '../../../utils/tribes';
import { structure, surge } from '../../../modifier/modifier-utils';
import { ReactiveValue } from '../../../utils/helpers';
import { modifierEntityDurationMixin } from '../../../modifier/mixins/duration.mixin';
import type { Entity } from '../../../entity/entity';

export const f1ElementalConfluence: CardBlueprint = {
  id: 'f1_elemental_confluence',
  name: 'F1 Kirin',
  description:
    '@Structure@.\n@Call to Arms@ and start of turn: Deal 1 damage to enemies up to 2 tiles away. @Surge(1)@ for every Elemental you control.',
  collectable: true,
  rarity: RARITIES.EPIC,
  factions: [FACTIONS.F1, FACTIONS.F1, null],
  spriteId: 'f1_elemental_confluence',
  kind: CARD_KINDS.MINION,
  cooldown: 5,
  initialCooldown: 0,
  cost: 5,
  attack: 0,
  maxHp: 7,
  speed: 0,
  range: 1,
  keywords: [KEYWORDS.STRUCTURE, KEYWORDS.CALL_TO_ARMS, KEYWORDS.SURGE],
  onPlay({ entity, session }) {
    entity.addModifier(structure(entity));

    const isAlliedElemental = (e: Entity) =>
      e.isAlly(entity.id) &&
      e.card.blueprint.tribes?.some(tribe => tribe.id === TRIBES.ELEMENTAL.id);

    entity.addModifier(
      surge({
        source: entity,
        stacks: session.entitySystem.getList().filter(isAlliedElemental).length
      })
    );

    const onEntityCreated = (newEntity: Entity) => {
      if (isAlliedElemental(newEntity)) entity.addModifier(surge({ source: entity }));
    };
    const onEntityDestroyed = (newEntity: Entity) => {
      if (isAlliedElemental(newEntity)) entity.removeModifier(KEYWORDS.SURGE.id);
    };

    entity.addModifier(
      createEntityModifier({
        source: entity,
        visible: false,
        stackable: false,
        mixins: [
          {
            onApplied(session, attachedTo, modifier) {
              session.on('entity:created', onEntityCreated);
              session.on('entity:after_destroy', onEntityDestroyed);
            },
            onRemoved(session, attachedTo, modifier) {
              session.off('entity:created', onEntityCreated);
              session.off('entity:after_destroy', onEntityDestroyed);
            }
          }
        ]
      })
    );

    const dealDamage = async () => {
      await Promise.all(
        session.entitySystem
          .getList()
          .filter(
            e => e.isEnemy(entity.id) && isWithinCells(entity.position, e.position, 2)
          )
          .map(enemy => {
            entity.dealDamage(1, enemy);
          })
      );
    };

    entity.addModifier(
      createEntityModifier({
        stackable: false,
        visible: true,
        name: 'Elemental Vortex',
        description: 'Start of turn: Deal 1 damage to enemies up to 2 tiles away.',
        source: entity,
        mixins: [
          modifierGameEventMixin({
            eventName: 'player:turn_start',
            listener([player], ctx) {
              if (!player.equals(entity.player)) return;
              dealDamage();
            }
          })
        ]
      })
    );
    dealDamage();
  },
  skills: [
    {
      id: 'f1_elemental_confulence_skill1',
      name: 'Elemental Relocation',
      description: 'Swap position with one of your elementals',
      initialCooldown: 0,
      cooldown: 2,
      iconId: 'vortex-elemental',
      minTargetCount: 1,
      maxTargetCount: 1,
      isTargetable(point, { skill, session }) {
        const target = session.entitySystem.getEntityAt(point);
        if (!target) return false;
        if (target.isEnemy(skill.caster.id)) return false;
        // @TODO make helper for this
        const isElemental = target.card.blueprint.tribes?.some(
          tribe => tribe.id === TRIBES.ELEMENTAL.id
        );
        return !!isElemental;
      },
      isInAreaOfEffect(point, { castPoints }) {
        return isCastPoint(point, castPoints);
      },
      async onUse({ session, skill, affectedCells }) {
        const [target] = getAffectedEntities(affectedCells);
        const oldPos = target.position.clone();
        await Promise.all([
          target.move([skill.caster.position], true),
          skill.caster.move([oldPos], true)
        ]);
      }
    }
  ]
};