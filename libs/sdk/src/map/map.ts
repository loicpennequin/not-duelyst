import { isString } from '@hc/shared';
import { Point3D } from '../types';
import { Cell, CellId } from './cell';
import { DIRECTIONS_TO_DIFF, Direction, Tile } from './tile';
import { TileId } from './tile-lookup';
import { cellIdToPoint } from '../utils/helpers';
import { Serializable } from '../utils/interfaces';
import { Entity } from '../entity/entity';
import { Pathfinder } from './pathfinding';
import { Vec3 } from '../utils/vector';
import { GameSession } from '../game-session';

export type GameMapOptions = {
  cells: { position: Point3D; tileId: TileId }[];
  height: number;
  width: number;
  startPositions: [Point3D, Point3D];
};

export class GameMap implements Serializable {
  height!: number;

  width!: number;

  startPositions!: [Point3D, Point3D];

  cells!: Cell[];

  cellsMap = new Map<CellId, Cell>();

  constructor(private ctx: GameSession) {}

  setup(definition: GameMapOptions) {
    this.height = definition.height;
    this.width = definition.width;
    this.startPositions = definition.startPositions;
    this.cells = this.makeCells(definition.cells);
    this.cells.forEach(cell => {
      this.cellsMap.set(cell.id, cell);
    });
  }

  private makeCells(cells: GameMapOptions['cells']) {
    return cells.map(({ tileId, position }) => {
      return new Cell(new Tile(tileId), position);
    });
  }

  serialize(): GameMapOptions {
    return {
      width: this.width,
      height: this.height,
      startPositions: this.startPositions,
      cells: this.cells.map(cell => cell.serialize())
    };
  }

  getCellAt(posOrKey: CellId | Point3D) {
    if (isString(posOrKey)) {
      return this.cellsMap.get(posOrKey) ?? null;
    }

    return this.cellsMap.get(`${posOrKey.x}:${posOrKey.y}:${posOrKey.z}`) ?? null;
  }

  getDestination(posOrKey: Point3D | CellId, direction: Direction): Point3D | null {
    const from = isString(posOrKey)
      ? Vec3.fromPoint3D(cellIdToPoint(posOrKey))
      : Vec3.fromPoint3D(posOrKey);

    const target = Vec3.add(from, DIRECTIONS_TO_DIFF[direction]);
    const targetAbove = Vec3.add(target, { x: 0, y: 0, z: 1 });
    const targetBelow = Vec3.sub(target, { x: 0, y: 0, z: 1 });

    const currentCell = this.getCellAt(from);
    const targetCell = this.getCellAt(target);
    const targetCellBelow = this.getCellAt(targetBelow);
    const targetCellAbove = this.getCellAt(targetAbove);

    // maybe the game will handle things flying one day, but for now let's assume you need to be on a tile to move
    if (!currentCell) return null;
    // this normally shouldn't happen
    if (!currentCell.isWalkable) return null;

    // on a half tile, can only go ahead or below
    if (currentCell.isHalfTile) {
      if (!targetCell && !targetCellBelow) return null;
      // nothing ahead, try to go below
      if (!targetCell) {
        if (targetCellBelow?.isHalfTile || !targetCellBelow!.isWalkable) return null;
        return targetBelow!;
      }

      // we can go ahead if nothing is above
      if (!targetAbove) return null;

      if (!targetCell.isWalkable) return null;
      return target;
    }

    if (targetCellAbove && targetCellAbove.isWalkable && targetCellAbove.isHalfTile) {
      return targetAbove;
    }

    if (!targetCell || !targetCell.isWalkable) return null;

    return targetCell;

    // if (currentCell) {
    //   if (currentCell.isHalfTile) return null;
    //   if (targetCell && !targetCellAbove) {
    //     return targetCell.isHalfTile ? target : targetAbove;
    //   }

    //   if (!targetCellBelow) return null;
    //   if (targetCellBelow.isHalfTile) return null;

    //   return target;
    // }

    // if (targetCell?.isHalfTile) return target;

    // if (!targetCellBelow) return null;
    // if (targetCellBelow.isHalfTile) return targetBelow;

    // return target;
  }

  canSummonAt(point: Point3D) {
    if (this.ctx.entityManager.getEntityAt(point)) return false;

    const cell = this.getCellAt(point);
    if (!cell) return false;

    const cellAbove = this.getCellAt(Vec3.add(point, { x: 0, y: 0, z: 1 }));
    if (cellAbove) return false;

    return cell.isWalkable;
  }

  getDistanceMap(point: Point3D, maxDistance?: number) {
    const boundaries = maxDistance
      ? ([
          Vec3.sub(point, { x: maxDistance, y: maxDistance, z: maxDistance }),
          Vec3.add(point, { x: maxDistance, y: maxDistance, z: maxDistance })
        ] as [Vec3, Vec3])
      : undefined;
    return new Pathfinder(this.ctx, boundaries).getDistanceMap(point);
  }

  getPathTo(entity: Entity, point: Point3D) {
    const path = new Pathfinder(this.ctx).findPath(entity.position, point);

    if (!path) return null;

    return {
      distance: path.distance,
      path: path.path.map(p => Vec3.fromPoint3D(cellIdToPoint(p)))
    };
  }
}
