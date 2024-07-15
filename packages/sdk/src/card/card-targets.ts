import type { Point3D } from '@game/shared';
import { getCells } from './card-action';
import type { CardBlueprint } from './card-blueprint';
import type { Filter } from './card-effect';
import type { CellConditionBase } from './conditions/cell-conditions';
import type { GameSession } from '../game-session';
import type { Card } from './card';

export type CardTargetsConfig = {
  min: number;
  targets: Array<Filter<CellConditionBase>>;
};

export const parseTargets = (
  config: CardTargetsConfig
): Exclude<CardBlueprint['targets'], undefined> => {
  return {
    minTargetCount: config.min,
    maxTargetCount: config.targets.length,
    isTargetable(
      point: Point3D,
      options: {
        session: GameSession;
        playedPoint?: Point3D;
        targets: Point3D[];
        card: Card;
      }
    ) {
      if (options.card.blueprint.targets!.maxTargetCount <= options.targets.length) {
        return false;
      }
      return getCells({
        session: options.session,
        event: {},
        card: options.card,
        targets: options.targets,
        conditions: config.targets[options.targets.length]
      }).some(cell => {
        return cell.position.equals(point);
      });
    }
  };
};