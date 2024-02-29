import { isDefined, isString } from '@hc/shared';
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
import { Interactable, SerializedInteractable } from '../interactable/interactable';
import { INTERACTABLES } from '../interactable/interactable-lookup';

export type GameMapOptions = {
  cells: { position: Point3D; tileId: TileId; spriteIds: string[] }[];
  height: number;
  width: number;
  startPositions: [Point3D, Point3D];
  interactables: SerializedInteractable[];
};

export class GameMap implements Serializable {
  height!: number;

  width!: number;

  startPositions!: [Point3D, Point3D];

  interactables!: Interactable[];

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
    this.interactables = definition.interactables.map(raw => {
      return new INTERACTABLES[raw.id as keyof typeof INTERACTABLES](this.ctx, raw);
    });
    this.interactables.forEach(int => int.init());
  }

  private makeCells(cells: GameMapOptions['cells']) {
    return cells.map(({ tileId, position, spriteIds }) => {
      return new Cell(new Tile(tileId), position, spriteIds);
    });
  }

  serialize(): GameMapOptions {
    return {
      width: this.width,
      height: this.height,
      startPositions: this.startPositions,
      cells: this.cells.map(cell => cell.serialize()),
      interactables: this.interactables.map(inter => inter.serialize())
    };
  }

  getCellAt(posOrKey: CellId | Point3D) {
    if (isString(posOrKey)) {
      return this.cellsMap.get(posOrKey) ?? null;
    }

    return this.cellsMap.get(`${posOrKey.x}:${posOrKey.y}:${posOrKey.z}`) ?? null;
  }

  // given a position, determine where a unit would land if it were to move from than position
  getDestination(posOrKey: Point3D | CellId, direction: Direction): Point3D | null {
    const from = isString(posOrKey)
      ? Vec3.fromPoint3D(cellIdToPoint(posOrKey))
      : Vec3.fromPoint3D(posOrKey);

    const target = Vec3.add(from, DIRECTIONS_TO_DIFF[direction]);
    const targetAbove = Vec3.add(target, { x: 0, y: 0, z: 1 });
    const targetTwiceAbove = Vec3.add(target, { x: 0, y: 0, z: 2 });
    const targetBelow = Vec3.add(target, { x: 0, y: 0, z: -1 });

    const currentCell = this.getCellAt(from);
    const cell = this.getCellAt(target);
    const cellBelow = this.getCellAt(targetBelow);
    const cellAbove = this.getCellAt(targetAbove);
    const cellTwiceAbove = this.getCellAt(targetTwiceAbove);

    // maybe the game will handle things flying one day, but for now let's assume you need to be on a tile to move
    if (!currentCell) return null;
    // this normally shouldn't happen
    if (!currentCell.isWalkable) return null;

    // on a half tile, we can only go ahead or below
    if (currentCell.isHalfTile) {
      if (!cell && !cellBelow) return null;
      // nothing ahead, try to go below
      if (!cell) {
        if (cellBelow?.isHalfTile || !cellBelow!.isWalkable) return null;
        return targetBelow!;
      }

      // we can go ahead if nothing is above
      if (cellAbove) return null;

      if (!cell.isWalkable) return null;

      return target;
    }

    // trying to go above
    if (cellAbove) {
      if (cellTwiceAbove || !cellAbove.isWalkable || !cellAbove.isHalfTile) {
        return null;
      }
      return targetAbove;
    }

    if (!cell || !cell.isWalkable) return null;

    return cell;
  }

  canSummonAt(point: Point3D) {
    if (this.ctx.entityManager.getEntityAt(point)) return false;

    const cell = this.getCellAt(point);
    if (!cell) return false;

    const cellAbove = this.getCellAt(Vec3.add(point, { x: 0, y: 0, z: 1 }));
    if (cellAbove) return false;

    if (!cell.isWalkable) return false;

    return this.ctx.entityManager
      .getNearbyAllies(point, this.ctx.playerManager.getActivePlayer().id)
      .some(ally => {
        const withOffset = {
          point: Vec3.sub(point, { x: 0, y: 0, z: cell.isHalfTile ? 0.5 : 0 }),
          ally: Vec3.sub(ally.position, {
            x: 0,
            y: 0,
            z: this.getCellAt(ally.position)!.isHalfTile ? 0.5 : 0
          })
        };

        return Math.abs(withOffset.ally.z - withOffset.point.z) <= 0.5;
      });
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

  getInteractableAt(point: Point3D) {
    return this.interactables.find(int => int.position.equals(point));
  }

  getNearbyInteractables({ x, y, z }: Point3D) {
    // prettier-ignore
    return [
      // Same level
      this.getInteractableAt({ x: x - 1, y: y - 1, z }), // top left
      this.getInteractableAt({ x: x    , y: y - 1, z }), // top
      this.getInteractableAt({ x: x + 1, y: y - 1, z }), // top right
      this.getInteractableAt({ x: x - 1, y: y    , z}),  // left
      this.getInteractableAt({ x: x + 1, y: y    , z}),  // right
      this.getInteractableAt({ x: x - 1, y: y + 1, z }), // bottom left
      this.getInteractableAt({ x: x    , y: y + 1, z }), // bottom
      this.getInteractableAt({ x: x + 1, y: y + 1, z }), // bottom right,

      // below
      this.getInteractableAt({ x: x - 1, y: y - 1, z: z - 1 }), // top left
      this.getInteractableAt({ x: x    , y: y - 1, z: z - 1 }), // top
      this.getInteractableAt({ x: x + 1, y: y - 1, z: z - 1 }), // top right
      this.getInteractableAt({ x: x - 1, y: y    , z: z - 1 }), // left
      this.getInteractableAt({ x: x    , y: y    , z: z - 1 }), // center
      this.getInteractableAt({ x: x + 1, y: y    , z: z - 1 }), // right
      this.getInteractableAt({ x: x - 1, y: y + 1, z: z - 1 }), // bottom left
      this.getInteractableAt({ x: x    , y: y + 1, z: z - 1 }), // bottom
      this.getInteractableAt({ x: x + 1, y: y + 1, z: z - 1 }), // bottom right,

      // Above
      this.getInteractableAt({ x: x - 1, y: y - 1, z: z + 1 }), // top left
      this.getInteractableAt({ x: x    , y: y - 1, z: z + 1 }), // top
      this.getInteractableAt({ x: x + 1, y: y - 1, z: z + 1 }), // top right
      this.getInteractableAt({ x: x - 1, y: y    , z: z + 1 }), // left
      this.getInteractableAt({ x: x    , y: y    , z: z + 1 }), // center
      this.getInteractableAt({ x: x + 1, y: y    , z: z + 1 }), // right
      this.getInteractableAt({ x: x - 1, y: y + 1, z: z + 1 }), // bottom left
      this.getInteractableAt({ x: x    , y: y + 1, z: z + 1 }), // bottom
      this.getInteractableAt({ x: x + 1, y: y + 1, z: z + 1 }), // bottom right,
    ].filter(isDefined);
  }

  getPathTo(entity: Entity, point: Point3D, maxDistance?: number) {
    const boundaries = maxDistance
      ? ([
          Vec3.sub(point, { x: maxDistance, y: maxDistance, z: maxDistance }),
          Vec3.add(point, { x: maxDistance, y: maxDistance, z: maxDistance })
        ] as [Vec3, Vec3])
      : undefined;

    const path = new Pathfinder(this.ctx, boundaries).findPath(entity.position, point);

    if (!path) return null;

    return {
      distance: path.distance,
      path: path.path.map(p => Vec3.fromPoint3D(cellIdToPoint(p)))
    };
  }
}
