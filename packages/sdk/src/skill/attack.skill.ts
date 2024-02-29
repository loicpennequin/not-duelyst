import { DealDamageAction } from '../action/deal-damage.action';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Point3D } from '../types';
import { Skill, SkillDescriptionContext, SkillOptions } from './skill';
import { PartialBy } from '@hc/shared';
import { Cell } from '../map/cell';

export type AttackOptions = PartialBy<SkillOptions, 'shouldExhaustCaster' | 'id'> & {
  power: number;
  attackRatio?: number;
};

export abstract class Attack extends Skill {
  public readonly power: number;
  public readonly attackRatio: number;

  constructor(options: AttackOptions) {
    super({
      id: options.id ?? 'attack',
      animationFX: 'attack',
      soundFX: 'attack-placeholder',
      shouldExhaustCaster: options?.shouldExhaustCaster ?? true,
      ...options
    });
    this.power = options.power;
    this.attackRatio = options.attackRatio ?? 1;
  }

  getDamageAmount(attack: number) {
    return this.power + Math.ceil(attack * this.attackRatio);
  }

  getDescription(caster: SkillDescriptionContext) {
    return `Deals ${this.getDamageAmount(caster.attack)} damage to an enemy.`;
  }

  execute(ctx: GameSession, caster: Entity, targets: Point3D[], affectedCells: Cell[]) {
    ctx.actionQueue.push(
      new DealDamageAction(
        {
          amount: this.getDamageAmount(caster.attack),
          sourceId: caster.id,
          targets: affectedCells.map(target => ctx.entityManager.getEntityAt(target)!.id)
        },
        ctx
      )
    );
  }
}
