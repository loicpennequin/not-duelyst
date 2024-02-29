import { isNumber } from 'lodash-es';
import { Entity } from '../entity/entity';
import { isEmpty } from '../entity/entity-utils';
import { GameSession } from '../game-session';
import { Point3D } from '../types';
import { Skill, SkillOptions } from './skill';
import { isMinCells, isWithinCells } from './skill-utils';
import { PartialBy } from '@hc/shared';
import { TeleportAction } from '../action/teleport.action';

export type TeleportOptions = PartialBy<
  SkillOptions,
  'id' | 'spriteId' | 'name' | 'shouldExhaustCaster' | 'minTargets' | 'maxTargets'
> & {
  minRange: number | Point3D;
  maxRange: number | Point3D;
};

export class Teleport extends Skill {
  readonly id = 'teleport';

  public readonly minRange: number | Point3D;
  public readonly maxRange: number | Point3D;

  constructor(options: TeleportOptions) {
    super({
      id: options.id ?? 'teleport',
      animationFX: 'cast',
      soundFX: 'cast-placeholder',
      spriteId: options.spriteId ?? 'teleport',
      name: options.name ?? 'Blink',
      shouldExhaustCaster: options?.shouldExhaustCaster ?? false,
      minTargets: 1,
      maxTargets: 1,
      shouldPreventMovement: false,
      ...options
    });
    this.minRange = options.minRange;
    this.maxRange = options.maxRange;
  }

  getDescription() {
    if (!this.minRange && !this.maxRange) {
      return 'Move this unit anywhere on the field';
    }

    if (!this.isMinRange) {
      return `Move this unit up to ${this.maxRange} tiles.`;
    }

    return `Move this unit up between ${this.minRange} and ${this.maxRange} tiles.`;
  }

  isMinRange(ctx: GameSession, point: Point3D, caster: Entity) {
    const { x, y, z } = isNumber(this.minRange)
      ? { x: this.minRange, y: this.minRange, z: this.minRange }
      : this.minRange;

    return (
      isMinCells(ctx, caster.position, point, { x, y: 0, z: 0 }) ||
      isMinCells(ctx, caster.position, point, { x: 0, y, z: 0 }) ||
      isMinCells(ctx, caster.position, point, { x: 0, y: 0, z })
    );
  }

  isWithinRange(ctx: GameSession, point: Point3D, caster: Entity) {
    return (
      isWithinCells(ctx, caster.position, point, this.maxRange) &&
      this.isMinRange(ctx, point, caster)
    );
  }

  isTargetable(ctx: GameSession, point: Point3D, caster: Entity) {
    return (
      this.isWithinRange(ctx, point, caster) &&
      isEmpty(ctx, point) &&
      !!ctx.map.getCellAt(point)?.isWalkable
    );
  }

  isInAreaOfEffect() {
    return false;
  }

  execute(ctx: GameSession, caster: Entity, [target]: Point3D[]) {
    ctx.actionQueue.push(
      new TeleportAction(
        {
          entityId: caster.id,
          point: target
        },
        ctx
      )
    );
  }
}
