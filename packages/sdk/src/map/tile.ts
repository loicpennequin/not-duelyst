import { Values } from '@hc/shared';
import { TileId, TILES } from './tile-lookup';
import { Point3D } from '../types';

export const TERRAIN = {
  GROUND: 'GROUND',
  WATER: 'WATER',
  OBSTACTLE: 'OBSTACLE'
} as const;
export type Terrain = Values<typeof TERRAIN>;

export const DIRECTION = {
  NORTH: 'north',
  SOUTH: 'south',
  WEST: 'west',
  EAST: 'east'
} as const;

export const DIRECTIONS_TO_DIFF = {
  [DIRECTION.NORTH]: { x: 0, y: -1, z: 0 },
  [DIRECTION.SOUTH]: { x: 0, y: 1, z: 0 },
  [DIRECTION.WEST]: { x: -1, y: 0, z: 0 },
  [DIRECTION.EAST]: { x: 1, y: 0, z: 0 }
} as const satisfies Record<Direction, Point3D>;

export type Direction = Values<typeof DIRECTION>;

export type TileDefinition = {
  terrain: Terrain;
  isHalfTile: boolean;
  isRamp?: boolean;
};

export class Tile {
  terrain: Terrain;
  isHalfTile: boolean;
  isRamp: boolean;

  constructor(readonly id: TileId) {
    const tile = TILES[id];
    this.terrain = tile.terrain;
    this.isHalfTile = tile.isHalfTile;
    this.isRamp = !!tile.isRamp;
  }

  get isWalkable() {
    return this.terrain === TERRAIN.GROUND;
  }

  serialize() {
    return this.id;
  }
}
