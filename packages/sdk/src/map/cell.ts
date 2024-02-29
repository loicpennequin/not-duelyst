import { Point3D } from '../types';
import { pointToCellId } from '../utils/helpers';
import { Vec3 } from '../utils/vector';
import { Tile } from './tile';

export type CellId = `${string}:${string}:${string}`;

export class Cell {
  public position: Vec3;

  constructor(
    public tile: Tile,
    position: Point3D,
    public spriteIds: string[]
  ) {
    this.position = Vec3.fromPoint3D(position);
  }

  clone() {
    const clone = new Cell(this.tile, this.position, this.spriteIds);

    Object.keys(this).forEach(key => {
      // @ts-expect-error cant be arsed
      clone[key] = this[key];
    });

    return clone;
  }

  get id(): CellId {
    return pointToCellId(this);
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  get z() {
    return this.position.z;
  }

  get terrain() {
    return this.tile.terrain;
  }

  get isHalfTile() {
    return this.tile.isHalfTile;
  }

  get isWalkable() {
    return this.tile.isWalkable;
  }

  serialize() {
    return {
      tileId: this.tile.serialize(),
      position: this.position.serialize(),
      spriteIds: this.spriteIds
    };
  }
}
