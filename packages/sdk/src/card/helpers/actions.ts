import type { AnyObject } from '@game/shared';
import type { EntityModifier } from '../../modifier/entity-modifier';
import { checkGlobalConditions } from '../card-action';
import type { EffectCtx } from '../card-parser';
import type { GlobalCondition } from '../conditions/global-conditions';
import type { Filter } from '../card-effect';
import type { GameSession } from '../../game-session';

export const applyModifierConditionally = ({
  modifier,
  ctx,
  conditions,
  event,
  eventName,
  session
}: {
  modifier: EntityModifier;
  ctx: EffectCtx;
  conditions?: Filter<GlobalCondition>;
  event: AnyObject;
  eventName?: string;
  session: GameSession;
}) => {
  const source = ctx.entity ?? ctx.card.player.general;

  const tryToApply = () => {
    const shouldApply = checkGlobalConditions(conditions, ctx, event, eventName);

    if (shouldApply) {
      if (!source.hasModifier(modifier.id)) {
        source.addModifier(modifier);
      }
    } else {
      source.removeModifier(modifier.id);
    }
  };

  tryToApply();
  session.on('*', tryToApply);

  return () => {
    source.removeModifier(modifier.id);
    session.off('*', tryToApply);
  };
};
