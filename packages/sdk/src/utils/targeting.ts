import { Vec3, isDefined, isNumber, type Nullable, type Point3D } from '@game/shared';
import type { Entity } from '../entity/entity';
import type { GameSession } from '../game-session';
import type { Cell } from '../board/cell';
import { match } from 'ts-pattern';

export const isAxisAligned = (pointA: Point3D, pointB: Point3D) => {
  return pointA.x === pointB.x || pointA.y === pointB.y;
};

export const isWithinRange = (origin: Point3D, point: Point3D, range: number) => {
  const vec = Vec3.fromPoint3D(origin);

  return vec.dist(point) <= range;
};

export const isMinRange = (origin: Point3D, point: Point3D, range: number) => {
  const vec = Vec3.fromPoint3D(origin);

  return vec.dist(point) >= range;
};

export const isWithinCells = (
  origin: Point3D,
  point: Point3D,
  range: number | Point3D
) => {
  if (isNumber(range)) {
    range = { x: range, y: range, z: range };
  }

  return (
    Math.abs(point.x - origin.x) <= range.x &&
    Math.abs(point.y - origin.y) <= range.y &&
    Math.abs(point.z - origin.z) <= range.z
  );
};

export const isMinCells = (origin: Point3D, point: Point3D, range: number | Point3D) => {
  if (isNumber(range)) {
    range = { x: range, y: range, z: range };
  }

  return (
    Math.abs(point.x - origin.x) >= range.x &&
    Math.abs(point.y - origin.y) >= range.y &&
    Math.abs(point.z - origin.z) >= range.z
  );
};

export const isSelf = (reference: Entity, entity: Nullable<Entity>) => {
  if (!entity) return false;
  return reference.equals(entity);
};

export const isBehind = (point: Point3D, otherPoint: Point3D, reference: Point3D) => {
  if (!isAxisAligned(point, reference)) return false;
  if (!isAxisAligned(point, otherPoint)) return false;

  if (reference.x === point.x) {
    return reference.y < point.y ? point.y > otherPoint.y : point.y < otherPoint.y;
  }

  if (reference.y === point.y) {
    return reference.x < point.x ? point.x > otherPoint.x : point.x < otherPoint.y;
  }

  return false;
};

export const cone = (casterPosition: Point3D, origin: Point3D, range: number) => {
  const points = [origin];

  for (let i = 1; i <= range; i++) {
    for (let j = -i; j <= i; j++) {
      if (casterPosition.x > origin.x) {
        points.push({ x: origin.x - i, y: origin.y + j, z: origin.z });
      } else if (casterPosition.x < origin.x) {
        points.push({ x: origin.x + i, y: origin.y + j, z: origin.z });
      } else if (casterPosition.y > origin.y) {
        points.push({ x: origin.x + j, y: origin.y - i, z: origin.z });
      } else if (casterPosition.y > origin.y) {
        points.push({ x: origin.x + j, y: origin.y + i, z: origin.z });
      }
    }
  }

  return points;
};

export const getAffectedEntities = (cells: Cell[]) =>
  cells.map(cell => cell.entity).filter(isDefined);

export const isCastPoint = (point: Point3D, castPoints: Array<Nullable<Point3D>>) => {
  const vec = Vec3.fromPoint3D(point);
  return castPoints.some(p => p && vec.equals(p));
};

export type Direction = 'up' | 'down' | 'left' | 'right';
export const getDirection = (origin: Point3D, point: Point3D): Direction => {
  if (origin.x === point.x) {
    return point.y > origin.y ? 'down' : 'up';
  } else {
    return point.x > origin.x ? 'right' : 'left';
  }
};

export const getNearestEntity = (
  session: GameSession,
  direction: 'up' | 'down' | 'left' | 'right',
  point: Point3D
) => {
  let found: Entity | null = null;
  let n = 0;
  while (!found) {
    n++;
    const newPoint: Point3D = match(direction)
      .with('up', () => {
        return { ...point, y: point.y - n };
      })
      .with('down', () => {
        return { ...point, y: point.y + n };
      })
      .with('left', () => {
        return { ...point, x: point.x - n };
      })
      .with('right', () => {
        return { ...point, x: point.x + n };
      })
      .exhaustive();
    const cell = session.boardSystem.getCellAt(newPoint);
    if (!cell) break;
    found = cell.entity;
  }

  return found;
};

export const getFarthestWalkable = (
  session: GameSession,
  direction: 'up' | 'down' | 'left' | 'right',
  point: Point3D
) => {
  let found: Cell | null = null;
  let n = 0;
  do {
    n++;
    const newPoint: Point3D = match(direction)
      .with('up', () => {
        return { ...point, y: point.y - n };
      })
      .with('down', () => {
        return { ...point, y: point.y + n };
      })
      .with('left', () => {
        return { ...point, x: point.x - n };
      })
      .with('right', () => {
        return { ...point, x: point.x + n };
      })
      .exhaustive();
    const cell = session.boardSystem.getCellAt(newPoint);
    if (!cell) break;
    if (!cell.isWalkable || cell.entity) break;
    found = cell;
  } while (found);

  return found;
};
