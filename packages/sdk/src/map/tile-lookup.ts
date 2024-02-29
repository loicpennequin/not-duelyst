import { Values } from '@hc/shared';
import { TileDefinition } from './tile';

export const TERRAIN = {
  GROUND: 'GROUND',
  WATER: 'WATER',
  OBSTACTLE: 'OBSTACLE'
} as const;
export type Terrain = Values<typeof TERRAIN>;

export const TILES: Record<string, TileDefinition> = {
  water: {
    terrain: TERRAIN.WATER,
    isHalfTile: false
  },
  waterHalf: {
    terrain: TERRAIN.WATER,
    isHalfTile: true
  },
  ground: {
    terrain: TERRAIN.GROUND,
    isHalfTile: false
  },
  groundHalf: {
    terrain: TERRAIN.GROUND,
    isHalfTile: true
  },
  obstacle: {
    terrain: TERRAIN.OBSTACTLE,
    isHalfTile: false
  }
};

export type TileId = keyof typeof TILES;
