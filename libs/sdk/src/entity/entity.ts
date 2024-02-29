import mitt from 'mitt';
import { PlayerId } from '../player/player';
import { Point3D } from '../types';
import { UnitId, UNITS } from '../units/unit-lookup';
import { Vec3 } from '../utils/vector';
import { clamp, isNumber, Nullable, Values } from '@hc/shared';
import { Skill, SkillId } from '../skill/skill';
import { Serializable } from '../utils/interfaces';
import { GameSession } from '../game-session';
import { Effect, EffectId } from '../effect/effect';
import { inferInterceptor, Interceptable } from '../utils/interceptor';
import { SummonInteractableAction } from '../action/summon-interactable.action';
import { DieAction } from '../action/die.action';
import { ReactiveValue } from '../utils/helpers';

export type EntityId = number;
export const isEntityId = (x: unknown, ctx: GameSession): x is EntityId =>
  isNumber(x) && !!ctx.entityManager.getEntityById(x);

export type SerializedEntity = {
  id: EntityId;
  position: Point3D;
  playerId: PlayerId;
  unitId: UnitId;
};

export const ENTITY_EVENTS = {
  MOVE: 'move',
  USE_SKILL: 'use-skill',
  DEAL_DAMAGE: 'deal-damage',
  RECEIVE_DAMAGE: 'receive-damage',
  HEAL: 'heal',
  DIE: 'die'
} as const;

export type EntityEvent = Values<typeof ENTITY_EVENTS>;

export type EntityEventMap = {
  [ENTITY_EVENTS.MOVE]: Entity;
  [ENTITY_EVENTS.USE_SKILL]: Entity;
  [ENTITY_EVENTS.DIE]: { entity: Entity };
  [ENTITY_EVENTS.DEAL_DAMAGE]: {
    entity: Entity;
    amount: number;
    target: Entity;
  };
  [ENTITY_EVENTS.RECEIVE_DAMAGE]: {
    entity: Entity;
    baseAmount: number;
    amount: number;
    source: Nullable<Entity>;
  };
  [ENTITY_EVENTS.HEAL]: {
    entity: Entity;
    amount: number;
    source: Entity;
  };
};

type EntityInterceptor = Entity['interceptors'];

export class Entity implements Serializable {
  readonly id: EntityId;

  readonly unitId: UnitId;

  private emitter = mitt<EntityEventMap>();

  private movementSpent = 0;

  private interceptors = {
    attack: new Interceptable<number, Entity>(),
    speed: new Interceptable<number, Entity>(),
    maxHp: new Interceptable<number, Entity>(),

    canUseSkill: new Interceptable<boolean, { entity: Entity; skill: Skill }>(),
    canUseSkillAt: new Interceptable<
      boolean,
      { entity: Entity; skill: Skill; targets: Point3D[] }
    >(),
    canMove: new Interceptable<boolean, Entity>(),
    takeDamage: new Interceptable<number, { entity: Entity; amount: number }>()
  };

  private currentHp = new ReactiveValue(0, hp => {
    if (hp <= 0) {
      this.ctx.actionQueue.push(new DieAction({ entityId: this.id }, this.ctx));
    }
  });

  lastDamagesource: Nullable<Entity> = null;

  playerId: PlayerId;

  on = this.emitter.on;

  off = this.emitter.off;

  get hp() {
    return this.currentHp.value;
  }

  private set hp(val: number) {
    this.currentHp.value = val;
  }

  position: Vec3;

  skillCooldowns: Record<SkillId, number> = {};

  effects: Effect[] = [];

  constructor(
    private ctx: GameSession,
    raw: SerializedEntity
  ) {
    this.id = raw.id;
    this.position = Vec3.fromPoint3D(raw.position);
    this.playerId = raw.playerId;
    this.unitId = raw.unitId;
    this.hp = this.unit.maxHp;
    this.unit.skills.forEach(skill => {
      this.skillCooldowns[skill.id] = 0;
    });
  }

  equals(entity: Entity) {
    return entity.id === this.id;
  }

  clone() {
    const clone = new Entity(this.ctx, {
      id: this.id,
      position: this.position,
      playerId: this.playerId,
      unitId: this.unitId
    });

    Object.keys(this).forEach(key => {
      // @ts-expect-error cant be arsed
      clone[key] = this[key];
    });

    return clone;
  }

  serialize() {
    return {
      id: this.id,
      position: this.position.serialize(),
      playerId: this.playerId,
      unitId: this.unitId
    } satisfies SerializedEntity;
  }

  get player() {
    return this.ctx.playerManager.getPlayerById(this.playerId)!;
  }

  get unit() {
    return UNITS[this.unitId];
  }

  get kind() {
    return this.unit.kind;
  }

  get maxHp(): number {
    return this.interceptors.maxHp.getValue(this.unit.maxHp, this);
  }

  get speed(): number {
    return this.interceptors.speed.getValue(this.unit.speed, this);
  }

  get attack(): number {
    return this.interceptors.attack.getValue(this.unit.attack, this);
  }

  get skills() {
    return this.unit.skills;
  }

  get remainingMovement() {
    return this.speed - this.movementSpent;
  }

  addInterceptor<T extends keyof EntityInterceptor>(
    key: T,
    interceptor: inferInterceptor<EntityInterceptor[T]>,
    isFinal = false
  ) {
    // @ts-expect-error pepega typescript
    this.interceptors[key].add(interceptor, isFinal);
  }

  removeInterceptor<T extends keyof EntityInterceptor>(
    key: T,
    interceptor: inferInterceptor<EntityInterceptor[T]>
  ) {
    // @ts-expect-error pepega typescript
    this.interceptors[key].remove(interceptor);
  }

  hasEffect(effectId: EffectId) {
    return this.effects.some(e => e.id === effectId);
  }

  canMove(distance: number) {
    const result = distance <= this.speed - this.movementSpent;

    return this.interceptors.canMove.getValue(result, this);
  }

  hasSkill(skillId: SkillId) {
    return this.skills.some(skill => skill.id === skillId);
  }

  canUseSkillAt(skill: Skill, targets: Point3D[]) {
    return this.interceptors.canUseSkillAt.getValue(this.canUseSkill(skill), {
      entity: this,
      skill: skill,
      targets
    });
  }

  canUseSkill(skill: Skill) {
    if (!this.hasSkill(skill.id)) return false;
    if (this.skillCooldowns[skill.id] > 0) return false;

    const result = true;

    return this.interceptors.canUseSkill.getValue(result, { entity: this, skill: skill });
  }

  move(path: Point3D[]) {
    path.forEach(point => {
      this.position = Vec3.fromPoint3D(point);
      this.movementSpent++;
      this.emitter.emit(ENTITY_EVENTS.MOVE, this);
    });
  }

  useSkill(skillId: SkillId) {
    const skill = this.skills.find(s => s.id === skillId);
    if (!skill) throw new Error(`Skill not found on entity ${this.unit.id}: ${skillId}`);

    if (skill.shouldPreventMovement) {
      this.movementSpent = this.speed;
    }
    this.skillCooldowns[skillId] = skill.cooldown;
    this.emitter.emit(ENTITY_EVENTS.USE_SKILL, this);
  }

  dealDamage(power: number, target: Entity) {
    target.takeDamage(power, this);

    this.emitter.emit(ENTITY_EVENTS.DEAL_DAMAGE, {
      entity: this,
      amount: power,
      target
    });
  }

  getTakenDamage(amount: number) {
    return this.interceptors.takeDamage.getValue(amount, {
      entity: this,
      amount
    });
  }

  takeDamage(power: number, source: Nullable<Entity>) {
    const amount = this.getTakenDamage(power);
    this.lastDamagesource = source;
    this.hp = Math.max(0, this.hp - amount);
    this.emitter.emit(ENTITY_EVENTS.RECEIVE_DAMAGE, {
      entity: this,
      amount,
      baseAmount: power,
      source
    });
  }

  heal(amount: number, source: Entity) {
    this.hp = clamp(this.hp + amount, 0, this.maxHp);
    this.emitter.emit(ENTITY_EVENTS.HEAL, {
      entity: this,
      amount,
      source
    });
  }

  die() {
    this.hp = 0;
    this.emitter.emit('die', { entity: this });
    this.ctx.actionQueue.push(
      new SummonInteractableAction(
        {
          id: 'GOLD_COIN',
          position: this.position
        },
        this.ctx
      )
    );
  }

  startTurn() {
    this.movementSpent = 0;
    Object.keys(this.skillCooldowns).forEach(skillId => {
      this.skillCooldowns[skillId] = clamp(this.skillCooldowns[skillId] - 1, 0, Infinity);
    });
  }
}
