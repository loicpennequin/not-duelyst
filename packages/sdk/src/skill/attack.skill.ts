import { DealDamageAction } from '../action/deal-damage.action';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import type { Point3D } from '../types';
import { Skill, type SkillDescriptionContext, type SkillOptions } from './skill';
import type { PartialBy } from '@hc/shared';
import { Cell } from '../map/cell';

export type AttackOptions = PartialBy<SkillOptions, 'shouldExhaustCaster' | 'id'> & {
  power: number;
  attackRatio?: number;
};

export abstract class Attack extends Skill {
  public readonly power: number;

  constructor(options: AttackOptions) {
    super({
      id: options.id ?? 'attack',
      animationFX: 'attack',
      soundFX: 'attack-placeholder',
      shouldExhaustCaster: options?.shouldExhaustCaster ?? true,
      ...options
    });
    this.power = options.power;
  }

  getDamageAmount(attack: number) {
    return attack + this.power;
  }

  getDescription(caster: SkillDescriptionContext) {
    return `Deals ${this.getDamageAmount(caster.attack)} damage to an enemy.`;
  }

  execute(ctx: GameSession, caster: Entity, targets: Point3D[], affectedCells: Cell[]) {
    ctx.actionQueue.push(
      new DealDamageAction(
        {
          shouldRetaliate: affectedCells.length <= 11,
          amount: this.getDamageAmount(caster.attack),
          sourceId: caster.id,
          targets: affectedCells.map(target => ctx.entityManager.getEntityAt(target)!.id)
        },
        ctx
      )
    );
  }
}
