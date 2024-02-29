import { CellId } from '../map/cell';
import { Point3D } from '../types';

export const pointToCellId = (point: Point3D): CellId =>
  `${point.x}:${point.y}:${point.z}`;

export const cellIdToPoint = (cellId: CellId): Point3D => {
  const [x, y, z] = cellId.split(':').map(Number);

  return { x, y, z };
};

export class ReactiveValue<T> {
  constructor(
    private internalValue: T,
    private onChange: (val: T) => void
  ) {}

  get value() {
    return this.internalValue;
  }

  set value(newVal) {
    this.internalValue = newVal;
    this.onChange(this.internalValue);
  }
}
