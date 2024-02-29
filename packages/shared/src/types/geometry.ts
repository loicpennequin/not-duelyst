export type Point = { x: number; y: number };
export type Size = { width: number; height: number };
export type Circle = Point & { radius: number };
export type Rectangle = Point & Size;
export type Line = { start: Point; end: Point };
export type BBox = Rectangle & {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};
