import { Values, exhaustiveSwitch, Constructor } from '@hc/shared';
import { GameContext } from '../game';
import { MoveAction } from './move.action';
import { EndTurnAction } from './end-turn.action';
import { SummonAction } from './summon.action';
import { GameAction } from './action';

export type RawAction = {
  type: ActionName;
  payload: unknown;
};

export const ACTION_NAME = {
  MOVE: 'MOVE',
  END_TURN: 'END_TURN',
  SUMMON: 'SUMMON'
} as const;

export type ActionName = Values<typeof ACTION_NAME>;

const actionDict: Record<ActionName, Constructor<GameAction<any>>> = {
  [ACTION_NAME.MOVE]: MoveAction,
  [ACTION_NAME.END_TURN]: EndTurnAction,
  [ACTION_NAME.SUMMON]: SummonAction
};

export class ActionReducer {
  constructor(private ctx: GameContext) {}

  reduce(action: RawAction) {
    new actionDict[action.type](action.payload).execute(this.ctx);
  }
}
