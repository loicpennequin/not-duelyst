export type GameSessionConfig = {
  VERSION: string;
  MAX_COPIES_PER_CARD: 10;
  MAX_DECK_SIZE: number;
  MAX_HAND_SIZE: number;
  MAX_GOLD: 9;
  GOLD_PER_TURN: number;
  REFILL_GOLD_EVERY_TURN: boolean;
  MAX_GOLD_INCREASE_PER_TURN: number;
  PLAYER_1_STARTING_GOLD: number;
  PLAYER_2_STARTING_GOLD: number;
  UNIT_DEFAULT_SPEED: number;
  STARTING_HAND_SIZE: number;
  CARD_DRAW_PER_TURN: number;
  MAX_REPLACES_PER_TURN: number;
  UNLIMITED_RETALIATION: boolean;
  CAN_WALK_THROUGH_ALLIES: boolean;
  CAN_MOVE_AFTER_ATTACK: boolean;
  ARTIFACT_DURABILITY: number;
  DRAW_AT_END_OF_TURN: boolean;
};

export const defaultConfig = {
  VERSION: '0.0.1',
  MAX_COPIES_PER_CARD: 10,
  MAX_DECK_SIZE: 20,
  MAX_HAND_SIZE: 6,
  MAX_GOLD: 9,
  GOLD_PER_TURN: 0,
  REFILL_GOLD_EVERY_TURN: true,
  MAX_GOLD_INCREASE_PER_TURN: 1,
  PLAYER_1_STARTING_GOLD: 2,
  PLAYER_2_STARTING_GOLD: 3,
  UNIT_DEFAULT_SPEED: 2,
  STARTING_HAND_SIZE: 3,
  CARD_DRAW_PER_TURN: 2,
  MAX_REPLACES_PER_TURN: 1,
  UNLIMITED_RETALIATION: true,
  CAN_WALK_THROUGH_ALLIES: true,
  CAN_MOVE_AFTER_ATTACK: false,
  ARTIFACT_DURABILITY: 3,
  DRAW_AT_END_OF_TURN: true
} as const satisfies GameSessionConfig;
