import { clamp } from '@hc/shared';
import { EntityId } from '../entity/entity';
import { isAxisAligned } from '../skill/skill-utils';
import { Point3D } from '../types';
import { GameAction } from './action';
import { Direction } from '../map/tile';
import { Vec3 } from '../utils/vector';

export class DisplaceAction extends GameAction<{
  targetId: EntityId;
  origin: Point3D;
  distance: number;
}> {
  readonly name = 'DISPLACE';

  protected async fxImpl() {
    return Promise.resolve();
  }

  get target() {
    const entity = this.ctx.entityManager.getEntityById(this.payload.targetId);
    if (!entity) throw new Error(`Entity not found: ${this.payload.targetId}`);

    return entity;
  }

  get displacementAxis() {
    if (!isAxisAligned(this.target.position, this.payload.origin)) {
      throw new Error('Knock back points must be axis aligned !');
    }

    return this.target.position.x === this.payload.origin.x ? 'y' : 'x';
  }

  get logMessage() {
    return `${this.target.unitId} got displaced.`;
  }

  getObstacleAtDistance(distance: number) {
    const x =
      this.displacementAxis == 'x'
        ? this.target.position.x + distance
        : this.target.position.x;
    const y =
      this.displacementAxis == 'y'
        ? this.target.position.y + distance
        : this.target.position.y;
    const entity = this.ctx.entityManager.getEntityAt({
      x,
      y,
      z: this.target.position.z
    });

    if (entity) return entity;

    const cell = this.ctx.map.getCellAt({
      x,
      y,
      z: this.target.position.z + 1
    });

    if (cell) return cell;

    return null;
  }

  getDirection(step: number): Direction {
    if (this.displacementAxis === 'x') return step < 0 ? 'west' : 'east';
    return step < 0 ? 'north' : 'south';
  }
  get destination() {
    let step = 1;
    if (this.payload.distance < 0) step *= -1;
    if (
      this.target.position[this.displacementAxis] <
      this.payload.origin[this.displacementAxis]
    ) {
      step *= -1;
    }

    let destination = this.target.position.serialize();

    for (let i = 1; i <= Math.abs(this.payload.distance); i++) {
      const obstacle = this.getObstacleAtDistance(step * i);
      if (obstacle) break;

      destination = this.ctx.map.getDestination(destination, this.getDirection(step))!;
    }

    return destination;
  }

  protected impl() {
    if (!isAxisAligned(this.target.position, this.payload.origin)) {
      throw new Error('Knock back points must be axis aligned !');
    }

    this.target.position = Vec3.fromPoint3D(this.destination);
  }
}
