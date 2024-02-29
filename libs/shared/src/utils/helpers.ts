import type { Point, Size } from '../types/geometry';
import type { AnyFunction, AnyObject, Entries, Matrix } from '../types/utils';

export const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

export const random = (max: number) => Math.random() * max;

export const randomInt = (max: number) => Math.round(random(max));

export const indexToPoint = (length: number, idx: number): Point => ({
  x: idx % length,
  y: Math.floor(idx / length)
});

export const pointToIndex = ({ x, y }: Point, width: number) => width * y + x;

type UnionToIntersection<T> = (T extends T ? (p: T) => void : never) extends (
  p: infer U
) => void
  ? U
  : never;
type FromEntries<T extends readonly [PropertyKey, any]> = T extends T
  ? Record<T[0], T[1]>
  : never;
// eslint-disable-next-line @typescript-eslint/ban-types
type Flatten<T> = {} & {
  [P in keyof T]: T[P];
};

export function fromEntries<
  V extends PropertyKey,
  T extends [readonly [V, any]] | Array<readonly [V, any]>
>(entries: T): Flatten<UnionToIntersection<FromEntries<T[number]>>> {
  return Object.fromEntries(entries) as any;
}

export const objectEntries = <T extends AnyObject>(obj: T) =>
  Object.entries(obj) as Entries<T>;

export const objectKeys = <T extends AnyObject>(obj: T) =>
  Object.keys(obj) as unknown as (keyof T)[];
