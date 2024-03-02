import type { PartialBy } from '@hc/shared';
import { Entity } from '../entity/entity';
import { isEnemy } from '../entity/entity-utils';
import { GameSession } from '../game-session';
import type { Point3D } from '../types';
import type { SkillDescriptionContext } from './skill';
import { isWithinCells, isSelf } from './skill-utils';
import { Attack, type AttackOptions } from './attack.skill';
import { Cell } from '../map/cell';
import { DealDamageAction } from '../action/deal-damage.action';

export type MeleeAttackOptions = PartialBy<
  AttackOptions,
  'id' | 'spriteId' | 'name' | 'shouldExhaustCaster'
> & {
  power: number;
};

export class MeleeAttack extends Attack {
  constructor(options: MeleeAttackOptions) {
    super({
      id: options.id ?? 'melee_attack',
      animationFX: 'attack',
      soundFX: 'attack-placeholder',
      spriteId: options.spriteId ?? 'melee_attack',
      name: options.name ?? 'Melee attack',
      shouldExhaustCaster: options?.shouldExhaustCaster ?? true,
      ...options
    });
  }

  getDescription(caster: SkillDescriptionContext) {
    return `Deals ${this.getDamageAmount(caster.attack)} damage to a nearby enemy.`;
  }

  isWithinRange(ctx: GameSession, point: Point3D, caster: Entity) {
    return isWithinCells(ctx, caster.position, point, { x: 1, y: 1, z: 0.5 });
  }

  isTargetable(ctx: GameSession, point: Point3D, caster: Entity) {
    return (
      this.isWithinRange(ctx, point, caster) &&
      isEnemy(ctx, ctx.entityManager.getEntityAt(point)?.id, caster.playerId)
    );
  }

  isInAreaOfEffect(ctx: GameSession, point: Point3D, caster: Entity, targets: Point3D[]) {
    return isSelf(
      ctx.entityManager.getEntityAt(targets[0])!,
      ctx.entityManager.getEntityAt(point)
    );
  }
}
