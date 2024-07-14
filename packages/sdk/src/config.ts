export const config = {
  VERSION: '0.0.1',
  MAX_COPIES_PER_CARD: 10,
  MAX_DECK_SIZE: 10,
  MAX_HAND_SIZE: 6,
  MAX_GOLD: 9,
  GOLD_PER_TURN: 0,
  REFILL_GOLD_EVERY_TURN: true,
  MAX_GOLD_INCREASE_PER_TURN: 1,
  PLAYER_1_STARTING_GOLD: 2,
  PLAYER_2_STARTING_GOLD: 3,
  GENERAL_DEFAULT_ATTACK: 2,
  GENERAL_DEFAULT_HP: 25,
  GENERAL_DEFAULT_SPEED: 2,
  STARTING_HAND_SIZE: 3,
  CARD_DRAW_PER_TURN: 2,
  MAX_REPLACES_PER_TURN: 1,
  UNLIMITED_RETALIATION: true,
  CAN_WALK_THROUGH_ALLIES: true,
  CAN_MOVE_AFTER_ATTACK: false,
  ARTIFACT_DURABILITY: 3
} as const;
