import { Values } from '@hc/shared';

export const GAME_STATUS = {
  WAITING_FOR_PLAYERS: 'WAITING_FOR_PLAYERS',
  ONGOING: 'ONGOING',
  FINISHED: 'FINISHED',
  CANCELLED: 'CANCELLED'
} as const;

export type GameStatus = Values<typeof GAME_STATUS>;
