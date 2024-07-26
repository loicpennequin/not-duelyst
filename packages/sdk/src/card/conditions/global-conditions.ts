import type { AnyObject } from '@game/shared';
import type { Amount, ConditionOverrides, Filter, NumericOperator } from '../card-effect';
import type { CardConditionExtras } from './card-conditions';
import { getCells, type CellCondition } from './cell-conditions';
import { getPlayers, type PlayerCondition } from './player-condition';
import {
  getUnits,
  type UnitConditionBase,
  type UnitConditionExtras
} from './unit-conditions';
import type { EffectCtx } from '../card-parser';
import { match } from 'ts-pattern';
import type { Entity } from '../../entity/entity';
import { matchNumericOperator } from '../card-action';
import { getAmount } from '../helpers/amount';

export type GlobalCondition<
  T extends ConditionOverrides = {
    unit: UnitConditionExtras['type'];
    card: CardConditionExtras['type'];
  }
> =
  | {
      type: 'player_gold';
      params: {
        player: Filter<PlayerCondition>;
        operator: NumericOperator;
        amount: Amount<T>;
      };
    }
  | {
      type: 'player_hp';
      params: {
        player: Filter<PlayerCondition>;
        operator: NumericOperator;
        amount: Amount<T>;
      };
    }
  | {
      type: 'unit_state';
      params: {
        unit: Filter<UnitConditionBase>;
        mode: 'none' | 'some' | 'all';
        attack?: {
          operator: NumericOperator;
          amount: Amount<T>;
        };
        hp?: {
          operator: NumericOperator;
          amount: Amount<T>;
        };
        position?: Filter<CellCondition>;
      };
    };

export const checkGlobalConditions = (
  conditions:
    | Filter<
        GlobalCondition<{
          unit: UnitConditionExtras['type'];
          card: CardConditionExtras['type'];
        }>
      >
    | undefined,
  { session, card, entity, targets }: EffectCtx,
  event: AnyObject,
  eventName?: string
): boolean => {
  if (!conditions) return true;
  if (!conditions.length) return true;

  return conditions.some(group => {
    return group.every(condition => {
      return match(condition)
        .with({ type: 'player_gold' }, condition => {
          const amount = getAmount({
            session,
            card,
            entity,
            targets,
            event,
            eventName,
            amount: condition.params.amount
          });
          return getPlayers({
            session,
            card,
            event,
            eventName,
            targets,
            conditions: condition.params.player
          }).every(player =>
            matchNumericOperator(player.currentGold, amount, condition.params.operator)
          );
        })
        .with({ type: 'player_hp' }, condition => {
          const amount = getAmount({
            session,
            card,
            entity,
            targets,
            event,
            eventName,
            amount: condition.params.amount
          });
          return getPlayers({
            session,
            card,
            event,
            eventName,
            targets,

            conditions: condition.params.player
          }).every(player =>
            matchNumericOperator(player.general.hp, amount, condition.params.operator)
          );
        })
        .with({ type: 'unit_state' }, condition => {
          const entities = getUnits({
            session,
            entity,
            targets,
            card,
            event,
            eventName,
            conditions: condition.params.unit
          });
          const isMatch = (e: Entity) => {
            const { attack, hp, position } = condition.params;
            const ctx = { session, card, entity, targets, event, eventName };
            const attackMatch = attack
              ? matchNumericOperator(
                  getAmount({
                    ...ctx,
                    amount: attack.amount
                  }),
                  e.attack,
                  attack.operator
                )
              : true;

            const hpMatch = hp
              ? matchNumericOperator(
                  getAmount({
                    ...ctx,
                    amount: hp.amount
                  }),
                  e.hp,
                  hp.operator
                )
              : true;

            const positionMatch = position
              ? getCells({ ...ctx, conditions: position }).some(cell => {
                  return cell.position.equals(e.position);
                })
              : true;

            return attackMatch && hpMatch && positionMatch;
          };

          return match(condition.params.mode)
            .with('all', () => entities.every(isMatch))
            .with('none', () => entities.every(e => !isMatch(e)))
            .with('some', () => entities.some(isMatch))
            .exhaustive();
        })
        .exhaustive();
    });
  });
};
