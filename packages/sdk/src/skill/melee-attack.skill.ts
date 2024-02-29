import { PartialBy } from '@hc/shared';
import { Entity } from '../entity/entity';
import { isEnemy } from '../entity/entity-utils';
import { GameSession } from '../game-session';
import { Point3D } from '../types';
import { SkillDescriptionContext } from './skill';
import { isWithinCells, isSelf } from './skill-utils';
import { Attack, AttackOptions } from './attack.skill';
import { Cell } from '../map/cell';
import { DealDamageAction } from '../action/deal-damage.action';

export type MeleeAttackOptions = PartialBy<
  AttackOptions,
  'id' | 'spriteId' | 'name' | 'shouldExhaustCaster'
> & {
  power: number;
  splash?: boolean;
  splashAttackRatio?: number;
};

export class MeleeAttack extends Attack {
  public readonly splash: boolean;
  public readonly splashAttackRatio: number;

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
    this.splash = options.splash ?? false;
    this.splashAttackRatio = options.splashAttackRatio ?? 1;
  }

  getDescription(caster: SkillDescriptionContext) {
    const splash = this.splash
      ? ` and ${this.getSplashAmount(caster.attack)} all enemies around it.`
      : '';
    return `Deals ${this.getDamageAmount(
      caster.attack
    )} damage to a nearby enemy${splash}.`;
  }

  getSplashAmount(attack: number) {
    return this.power + Math.ceil(attack * this.splashAttackRatio);
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
    const splashCondition = this.splash
      ? isEnemy(ctx, ctx.entityManager.getEntityAt(point)?.id, caster.playerId) &&
        isWithinCells(ctx, targets[0], point, { x: 1, y: 1, z: 0.5 })
      : false;

    return (
      isSelf(
        ctx.entityManager.getEntityAt(targets[0])!,
        ctx.entityManager.getEntityAt(point)
      ) || splashCondition
    );
  }

  execute(ctx: GameSession, caster: Entity, targets: Point3D[], affectedCells: Cell[]) {
    if (!this.splash) return super.execute(ctx, caster, targets, affectedCells);

    const targetEntities = targets.map(target => ctx.entityManager.getEntityAt(target)!);
    ctx.actionQueue.push(
      new DealDamageAction(
        {
          amount: this.getDamageAmount(caster.attack),
          sourceId: caster.id,
          targets: targetEntities.map(target => target.id)
        },
        ctx
      )
    );

    const enemies = targetEntities
      .map(target => ctx.entityManager.getNearbyAllies(target.position, target.playerId))
      .flat();

    ctx.actionQueue.push(
      new DealDamageAction(
        {
          amount: this.getSplashAmount(caster.attack),
          sourceId: caster.id,
          targets: enemies.map(enemy => enemy.id)
        },
        ctx
      )
    );
  }
}
