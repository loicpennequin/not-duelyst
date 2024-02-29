import { deg2Rad } from '@hc/shared';
import type { Point3D } from '@hc/sdk';

export type IsoPoint = {
  isoX: number;
  isoY: number;
  isoZ: number;
};
const TILE_WIDTH = CELL_SIZE;
const TILE_HEIGHT = TILE_WIDTH / 2;

export interface TransformOptions {
  rotation: boolean;
  isometric: boolean;
  scale: boolean;
}

export function applyTransforms(
  x: number,
  y: number,
  z: number,
  angle: number,
  gridSize: { width: number; height: number }
): Point3D {
  const cosRotation = Math.cos(angle);
  const sinRotation = Math.sin(angle);

  const centered = {
    x: x - gridSize.width,
    y: y - gridSize.height
  };

  const rotated = {
    x: centered.x * cosRotation - centered.y * sinRotation,
    y: centered.x * sinRotation + centered.y * cosRotation
  };

  const iso = {
    x: (rotated.x - rotated.y) / 2,
    y: (rotated.x + rotated.y) / 2
  };

  return {
    x: iso.x * TILE_WIDTH,
    y: iso.y * TILE_HEIGHT,
    z: z * TILE_HEIGHT
  };
}
export const toIso = (
  { x, y, z }: Point3D,
  angle: 0 | 90 | 180 | 270,
  gridSize: { width: number; height: number }
): IsoPoint => {
  const transformed = applyTransforms(x, y, z, deg2Rad(angle), gridSize);

  return { isoX: transformed.x, isoY: transformed.y, isoZ: transformed.z };
};

export const toCartesian = ({ isoX, isoY, isoZ }: IsoPoint) => {
  return {
    x: Math.round((2 * isoY + isoX) / 2 + isoZ),
    y: Math.round((2 * isoY - isoX) / 2 + isoZ),
    z: Math.round(isoZ)
  };
};
