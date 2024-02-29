import { Point3D } from '../types';
import { Serializable } from './interfaces';

export class Vec3 implements Serializable {
  static fromPoint3D(pt: Point3D) {
    return new Vec3(pt.x, pt.y, pt.z);
  }

  static add(vec1: Point3D, vec2: Point3D) {
    return Vec3.fromPoint3D(vec1).add(vec2);
  }

  static sub(vec1: Point3D, vec2: Point3D) {
    return Vec3.fromPoint3D(vec1).sub(vec2);
  }

  static mul(vec1: Point3D, vec2: Point3D) {
    return Vec3.fromPoint3D(vec1).mul(vec2);
  }

  static div(vec1: Point3D, vec2: Point3D) {
    return Vec3.fromPoint3D(vec1).div(vec2);
  }

  constructor(
    public x: number,
    public y: number,
    public z: number
  ) {}

  serialize() {
    return { x: this.x, y: this.y, z: this.z };
  }

  clone() {
    return new Vec3(this.x, this.y, this.z);
  }

  equals(vec: Point3D) {
    return this.x === vec.x && this.y === vec.y && this.z === vec.z;
  }

  round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.z = Math.round(this.z);

    return this;
  }

  add({ x, y, z }: Point3D) {
    this.x += x;
    this.y += y;
    this.z += z;

    return this;
  }

  sub({ x, y, z }: Point3D) {
    this.x -= x;
    this.y -= y;
    this.z -= z;

    return this;
  }

  mul({ x, y, z }: Point3D) {
    this.x *= x;
    this.y *= y;
    this.z *= z;

    return this;
  }

  div({ x, y, z }: Point3D) {
    this.x /= x;
    this.y /= y;
    this.z /= z;

    return this;
  }

  dist({ x, y, z }: Point3D) {
    const diff = {
      x: x - this.x,
      y: y - this.y,
      z: z - this.z
    };

    return Math.sqrt(diff.x ** 2 + diff.y ** 2 + diff.z ** 2);
  }
}
