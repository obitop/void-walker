// Game Constants
export const TILE_SIZE = 42;
export const GRAVITY = 0.5;
export const ROWS = 20;
export const PLAYER_WIDTH = 20;
export const PLAYER_HEIGHT = 28;
export const TOTAL_SECTORS = 5;

// Tile types
export const TILE_TYPES = {
  EMPTY: 0,
  SOLID: 1,
  SPIKE: 2,
  WALKER: 3,
  COIN: 4,
  EXIT: 6,
  SHOOTER: 8,
};

// Physics constraints
export const MAX_FALL_SPEED = 16;
export const MAX_RISE_SPEED = 18;

// Gameplay constants
export const INVINCIBILITY_FRAMES = 130;
export const JUMP_BUFFER_TIME = 10;
export const COYOTE_TIME = 8;
export const DOUBLE_JUMP_COUNT = 3;
