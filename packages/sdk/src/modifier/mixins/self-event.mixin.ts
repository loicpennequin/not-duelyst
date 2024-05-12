import type { MaybePromise } from '@game/shared';
import type { Entity, EntityEvent, EntityEventMap } from '../../entity/entity';
import type { GameSession } from '../../game-session';
import type { Keyword } from '../../utils/keywords';
import type { EntityModifier, EntityModifierMixin } from '../entity-modifier';
import { modifierEntityDurationMixin } from './duration.mixin';

export const modifierSelfEventMixin = <T extends EntityEvent>({
  eventName,
  listener,
  keywords = [],
  duration = Infinity
}: {
  eventName: T;
  listener: (
    event: EntityEventMap[T],
    ctx: { session: GameSession; attachedTo: Entity; modifier: EntityModifier }
  ) => MaybePromise<void>;
  keywords?: Keyword[];
  duration?: number;
}): EntityModifierMixin => {
  let _listener: any;

  return modifierEntityDurationMixin({
    keywords,
    duration,
    onApplied(session, attachedTo, modifier) {
      _listener = (...args: any[]) => {
        return listener(args as any, { session, attachedTo, modifier });
      };
      console.log('adding listener on event', eventName);
      attachedTo.on(eventName, _listener);
    },
    onRemoved(session, attachedTo) {
      attachedTo.off(eventName, _listener);
    }
  });
};
