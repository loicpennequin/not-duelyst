import { type Serializable, Vec3, type Values } from '@game/shared';
import type { GameSession } from '../game-session';
import type { Point3D } from '../types';
import type { CardIndex, PlayerId } from '../player/player';
import { Interceptable, type inferInterceptor } from '../utils/helpers';
import { isAlly, isEnemy } from './entity-utils';
import { isWithinCells } from '../utils/targeting';
import { type EntityModifier, type ModifierId } from '../modifier/entity-modifier';
import { CARD_KINDS } from '../card/card-enums';
import { KEYWORDS, type Keyword } from '../utils/keywords';
import { uniqBy } from 'lodash-es';
import type { CardModifier } from '../modifier/card-modifier';
import { type Cell } from '../board/cell';
import { TERRAINS } from '../board/board-utils';
import { Unit } from '../card/unit';
import type { Card } from '../card/card';
import { TypedEventEmitter } from '../utils/typed-emitter';

export type EntityId = number;

export type SerializedEntity = {
  id: number;
  position: Point3D;
  cardIndex: CardIndex;
  playerId: PlayerId;
  hp?: number;
};

export const ENTITY_EVENTS = {
  BEFORE_CREATE: 'before_create',
  CREATED: 'created',

  BEFORE_DESTROY: 'before_destroy',
  AFTER_DESTROY: 'after_destroy',

  BEFORE_MOVE: 'before_move',
  AFTER_MOVE: 'after_move',

  BEFORE_TELEPORT: 'before_teleport',
  AFTER_TELEPORT: 'after_teleport',

  BEFORE_BOUNCE: 'before_bounce',
  AFTER_BOUNCE: 'after_bounce',

  BEFORE_DEAL_DAMAGE: 'before_deal_damage',
  AFTER_DEAL_DAMAGE: 'after_deal_damage',

  BEFORE_TAKE_DAMAGE: 'before_take_damage',
  AFTER_TAKE_DAMAGE: 'after_take_damage',

  BEFORE_RETALIATE: 'before_retaliate',
  AFTER_RETALIATE: 'after_retaliate',

  BEFORE_HEAL: 'before_heal',
  AFTER_HEAL: 'after_heal',

  BEFORE_ATTACK: 'before_attack',
  AFTER_ATTACK: 'after_attack'
} as const;

export type EntityEvent = Values<typeof ENTITY_EVENTS>;

type DealDamageEvent = {
  entity: Entity;
  target: Entity;
  amount: number;
};
type TakeDamageEvent = {
  entity: Entity;
  source: Card;
  amount: number;
};
type AttackEvent = {
  entity: Entity;
  target: Entity;
};

export type EntityEventMap = {
  [ENTITY_EVENTS.BEFORE_CREATE]: [entity: Entity];
  [ENTITY_EVENTS.CREATED]: [entity: Entity];

  [ENTITY_EVENTS.BEFORE_DESTROY]: [entity: Entity];
  [ENTITY_EVENTS.AFTER_DESTROY]: [entity: Entity];

  [ENTITY_EVENTS.BEFORE_BOUNCE]: [entity: Entity];
  [ENTITY_EVENTS.AFTER_BOUNCE]: [{ entity: Entity; successful: boolean }];

  [ENTITY_EVENTS.BEFORE_MOVE]: [{ entity: Entity; path: Point3D[] }];
  [ENTITY_EVENTS.AFTER_MOVE]: [
    { entity: Entity; path: Point3D[]; previousPosition: Vec3 }
  ];

  [ENTITY_EVENTS.BEFORE_TELEPORT]: [{ entity: Entity; destination: Point3D }];
  [ENTITY_EVENTS.AFTER_TELEPORT]: [{ entity: Entity; previousPosition: Vec3 }];

  [ENTITY_EVENTS.BEFORE_DEAL_DAMAGE]: [event: DealDamageEvent];
  [ENTITY_EVENTS.AFTER_DEAL_DAMAGE]: [event: DealDamageEvent];

  [ENTITY_EVENTS.BEFORE_TAKE_DAMAGE]: [event: TakeDamageEvent];
  [ENTITY_EVENTS.AFTER_TAKE_DAMAGE]: [event: TakeDamageEvent];

  [ENTITY_EVENTS.BEFORE_HEAL]: [event: TakeDamageEvent];
  [ENTITY_EVENTS.AFTER_HEAL]: [event: TakeDamageEvent];

  [ENTITY_EVENTS.BEFORE_ATTACK]: [event: AttackEvent];
  [ENTITY_EVENTS.AFTER_ATTACK]: [event: AttackEvent];

  [ENTITY_EVENTS.BEFORE_RETALIATE]: [event: AttackEvent];
  [ENTITY_EVENTS.AFTER_RETALIATE]: [event: AttackEvent];
};

export type EntityInterceptor = Entity['interceptors'];

export class Entity extends TypedEventEmitter<EntityEventMap> implements Serializable {
  private cardIndex: CardIndex;
  private _keywords: Keyword[] = [];
  private playerId: PlayerId;

  readonly id: EntityId;

  modifiers: EntityModifier[] = [];

  position: Vec3;

  movementsTaken = 0;
  attacksTaken = 0;
  retaliationsDone = 0;

  private isScheduledForDeletion = false;

  private currentHp = 0;

  private interceptors = {
    attack: new Interceptable<number, Entity>(),
    maxHp: new Interceptable<number, Entity>(),
    speed: new Interceptable<number, Entity>(),
    range: new Interceptable<number, Entity>(),

    maxRetaliations: new Interceptable<number, Entity>(),
    maxAttacks: new Interceptable<number, Entity>(),
    maxMovements: new Interceptable<number, Entity>(),

    canMove: new Interceptable<boolean, Entity>(),
    canAttack: new Interceptable<boolean, { entity: Entity; target: Entity }>(),
    canRetaliate: new Interceptable<boolean, { entity: Entity; source: Entity }>(),
    canMoveThroughCell: new Interceptable<boolean, { entity: Entity; cell: Cell }>(),
    canBeAttackTarget: new Interceptable<boolean, { entity: Entity; source: Entity }>(),

    damageDealt: new Interceptable<number, { entity: Entity; amount: number }>(),
    damageTaken: new Interceptable<number, { entity: Entity; amount: number }>(),
    healReceived: new Interceptable<number, { entity: Entity; amount: number }>()
  };

  constructor(
    protected session: GameSession,
    options: SerializedEntity
  ) {
    super();
    this.id = options.id;
    this.position = Vec3.fromPoint3D(options.position);
    this.cardIndex = options.cardIndex;
    this.playerId = options.playerId;
    this.currentHp = options.hp ?? this.maxHp;
  }

  equals(entity: Entity) {
    return entity.id === this.id;
  }

  serialize(): SerializedEntity {
    return {
      id: this.id,
      position: this.position.serialize(),
      cardIndex: this.cardIndex,
      playerId: this.playerId,
      hp: this.hp
    };
  }

  get isGeneral() {
    return this.card.blueprint.kind == CARD_KINDS.GENERAL;
  }

  get card() {
    const card = this.player.cards[this.cardIndex];
    if (!(card instanceof Unit)) {
      throw new Error('Entity card is not a Unit');
    }

    return card;
  }

  get player() {
    return this.session.playerSystem.getPlayerById(this.playerId)!;
  }

  get belongsToActivePlayer() {
    return this.player.equals(this.session.playerSystem.activePlayer);
  }

  get hp() {
    return this.interceptors.maxHp.getValue(this.currentHp, this);
  }

  private set hp(val: number) {
    this.currentHp = Math.min(val, this.maxHp);
  }

  get maxHp(): number {
    return this.interceptors.maxHp.getValue(this.card.maxHp, this);
  }

  get attack(): number {
    return this.interceptors.attack.getValue(this.card.attack, this);
  }

  get speed(): number {
    return this.interceptors.speed.getValue(this.card.speed, this);
  }

  get range(): number {
    return this.interceptors.range.getValue(this.card.range, this);
  }

  get maxMovements(): number {
    return this.interceptors.maxMovements.getValue(1, this);
  }

  get maxAttacks(): number {
    return this.interceptors.maxAttacks.getValue(1, this);
  }

  get maxRetaliations(): number {
    return this.interceptors.maxRetaliations.getValue(1, this);
  }

  get isExhausted(): boolean {
    if (this.player.isActive) {
      return (
        !this.canMove(0) &&
        !this.player.opponent.entities.some(entity => this.canAttack(entity))
      );
    } else {
      if (this.session.config.UNLIMITED_RETALIATION) return false;
      return this.retaliationsDone >= this.maxRetaliations;
    }
  }

  canMoveThroughCell(cell: Cell) {
    const initialValue = cell.entity
      ? this.isAlly(cell.entity.id)
        ? this.session.config.CAN_WALK_THROUGH_ALLIES
        : false
      : cell.terrain === TERRAINS.GROUND;

    return this.interceptors.canMoveThroughCell.getValue(initialValue, {
      entity: this,
      cell
    });
  }

  canMove(
    distance: number,
    { countAllMovements }: { countAllMovements: boolean } = { countAllMovements: false }
  ) {
    const speed = countAllMovements
      ? this.speed * (this.maxMovements - this.movementsTaken)
      : this.speed;

    const baseValue =
      distance <= speed &&
      this.movementsTaken < this.maxMovements &&
      (this.session.config.CAN_MOVE_AFTER_ATTACK
        ? true
        : this.attacksTaken < this.maxAttacks);
    return this.interceptors.canMove.getValue(baseValue, this);
  }

  canRetaliate(source: Entity) {
    const baseValue = this.session.config.UNLIMITED_RETALIATION
      ? true
      : this.retaliationsDone < this.maxRetaliations;

    return this.interceptors.canRetaliate.getValue(
      this.canAttackAt(source.position) && baseValue,
      {
        entity: this,
        source
      }
    );
  }

  canBeAttacked(source: Entity) {
    return this.interceptors.canBeAttackTarget.getValue(true, { entity: this, source });
  }

  canAttackAt(point: Point3D, simulatedPosition?: Point3D) {
    return isWithinCells(simulatedPosition ?? this.position, point, this.range);
  }

  canAttack(target: Entity) {
    const baseValue =
      this.attacksTaken < this.maxAttacks &&
      this.attacksTaken <
        Math.min(this.maxMovements, this.maxMovements - this.movementsTaken + 1) &&
      this.canAttackAt(target.position) &&
      isEnemy(this.session, target.id, this.playerId);

    return (
      this.interceptors.canAttack.getValue(baseValue, { entity: this, target }) &&
      target.canBeAttacked(this)
    );
  }

  private checkHpForDeletion() {
    if (this.isScheduledForDeletion) return;

    if (this.hp <= 0) {
      this.isScheduledForDeletion = true;
      void this.destroy();
    }
  }
  addInterceptor<T extends keyof EntityInterceptor>(
    key: T,
    interceptor: inferInterceptor<EntityInterceptor[T]>,
    priority?: number
  ) {
    this.interceptors[key].add(interceptor as any, priority);
    this.checkHpForDeletion();
    return () => this.removeInterceptor(key, interceptor);
  }

  addInterceptorUntilEndOfTurn<T extends keyof EntityInterceptor>(
    key: T,
    interceptor: inferInterceptor<EntityInterceptor[T]>,
    priority?: number
  ) {
    const unsub = this.addInterceptor(key, interceptor, priority);
    this.session.once('player:turn_end', unsub);
  }

  removeInterceptor<T extends keyof EntityInterceptor>(
    key: T,
    interceptor: inferInterceptor<EntityInterceptor[T]>
  ) {
    this.interceptors[key].remove(interceptor as any);
    this.checkHpForDeletion();
  }

  clearAllInterceptors() {
    Object.values(this.interceptors).forEach(interceptor => interceptor.clear());
  }

  endTurn() {
    this.movementsTaken = 0;
    this.attacksTaken = 0;
    this.retaliationsDone = 0;
  }

  startTurn() {
    this.activate();
  }

  async destroy() {
    await this.session.actionSystem.schedule(async () => {
      await this.emitAsync(ENTITY_EVENTS.BEFORE_DESTROY, this);
      this.session.entitySystem.removeEntity(this);
      this.player.graveyard.push(this.card);
      this.modifiers.forEach(modifier => {
        modifier.onRemoved(this.session, this, modifier);
      });

      await this.emitAsync(ENTITY_EVENTS.AFTER_DESTROY, this);
    });
  }

  activate() {
    this.movementsTaken = 0;
    this.attacksTaken = 0;
    this.retaliationsDone = 0;
  }

  async move(path: Point3D[]) {
    await this.emitAsync(ENTITY_EVENTS.BEFORE_MOVE, { entity: this, path });
    const currentPosition = this.position;

    for (const point of path) {
      this.position = Vec3.fromPoint3D(point);
    }
    this.movementsTaken++;

    await this.emitAsync(ENTITY_EVENTS.AFTER_MOVE, {
      entity: this,
      path,
      previousPosition: currentPosition
    });
  }

  async teleport(
    cell: Cell,
    { ignoreCollisions }: { ignoreCollisions: boolean } = { ignoreCollisions: false }
  ) {
    if (!ignoreCollisions && cell.entity) return;
    if (!cell.isWalkable) return;
    await this.emitAsync(ENTITY_EVENTS.BEFORE_TELEPORT, {
      entity: this,
      destination: cell.position
    });
    const prevPos = this.position;
    this.position = Vec3.fromPoint3D(cell.position);
    await this.emitAsync(ENTITY_EVENTS.AFTER_TELEPORT, {
      entity: this,
      previousPosition: prevPos
    });
  }

  async bounce() {
    await this.emitAsync(ENTITY_EVENTS.BEFORE_BOUNCE, this);
    const successful = this.player.bounceToHand(this);
    await this.emitAsync(ENTITY_EVENTS.AFTER_BOUNCE, { entity: this, successful });
  }

  getTakenDamage(amount: number) {
    const clamped = Math.min(amount, this.hp);

    return this.interceptors.damageTaken.getValue(amount, {
      entity: this,
      amount: clamped
    });
  }

  getHealReceived(amount: number) {
    const clamped = Math.min(amount, this.maxHp - this.hp);
    return this.interceptors.healReceived.getValue(clamped, {
      entity: this,
      amount: clamped
    });
  }

  async dealDamage(power: number, target: Entity) {
    const payload = {
      entity: this,
      amount: this.interceptors.damageDealt.getValue(power, {
        entity: this,
        amount: power
      }),
      target
    };
    await this.emitAsync(ENTITY_EVENTS.BEFORE_DEAL_DAMAGE, payload);

    await target.takeDamage(payload.amount, this.card);

    await this.emitAsync(ENTITY_EVENTS.AFTER_DEAL_DAMAGE, payload);
  }

  async takeDamage(power: number, source: Card) {
    const amount = this.getTakenDamage(power);
    if (amount <= 0) return;
    const payload = {
      entity: this,
      amount,
      source
    };
    await this.emitAsync(ENTITY_EVENTS.BEFORE_TAKE_DAMAGE, payload);

    this.hp = this.currentHp - amount;
    this.checkHpForDeletion();

    await this.emitAsync(ENTITY_EVENTS.AFTER_TAKE_DAMAGE, payload);
  }

  async retaliate(power: number, target: Entity) {
    if (!this.canRetaliate(target)) return;
    await this.emitAsync(ENTITY_EVENTS.BEFORE_RETALIATE, { entity: this, target });
    this.retaliationsDone++;

    await this.dealDamage(power, target);
    await this.emitAsync(ENTITY_EVENTS.AFTER_RETALIATE, { entity: this, target });
  }

  async performAttack(target: Entity) {
    await this.emitAsync(ENTITY_EVENTS.BEFORE_ATTACK, { entity: this, target });

    await this.dealDamage(this.attack, target);

    await target.retaliate(target.attack, this);

    this.attacksTaken++;
    await this.emitAsync(ENTITY_EVENTS.AFTER_ATTACK, { entity: this, target });
  }

  async heal(baseAmount: number, source: Card) {
    const amount = this.getHealReceived(baseAmount);
    if (amount <= 0) return;
    const payload = {
      entity: this,
      amount,
      source
    };
    await this.emitAsync(ENTITY_EVENTS.BEFORE_HEAL, payload);

    this.hp += amount;
    this.checkHpForDeletion();

    await this.emitAsync(ENTITY_EVENTS.AFTER_HEAL, payload);
  }

  getModifier(id: ModifierId) {
    return this.modifiers.find(m => m.id === id);
  }

  hasModifier(id: ModifierId) {
    return this.modifiers.some(m => m.id === id);
  }

  cloneModifiers(to: Entity) {
    this.modifiers.forEach(modifier => {
      to.addModifier({ ...modifier });
    });
  }

  addModifier(modifier: EntityModifier) {
    const existing = this.getModifier(modifier.id);

    if (existing) {
      if (existing.stackable) {
        existing.stacks += modifier.stacks ?? 1;
        return;
      } else {
        return existing.onReapply(this.session, this, existing);
      }
    }

    this.modifiers.push(modifier);

    return modifier.onApplied(this.session, this, modifier);
  }

  removeModifier(modifierId: ModifierId, stacksToRemove = 1) {
    this.modifiers.forEach(mod => {
      if (mod.id !== modifierId) return;

      if (mod.stackable) {
        mod.stacks -= stacksToRemove;
        if (mod.stacks < 1) {
          mod.onRemoved(this.session, this, mod);
        }
      } else {
        mod.onRemoved(this.session, this, mod);
      }
    });

    this.modifiers = this.modifiers.filter(mod => {
      if (mod.id !== modifierId) return true;

      if (mod.stackable) {
        return mod.stacks >= 1;
      }

      return false;
    });
  }

  isAlly(entityId: EntityId) {
    return isAlly(this.session, entityId, this.playerId);
  }

  isEnemy(entityId: EntityId) {
    return isEnemy(this.session, entityId, this.playerId);
  }

  removeKeyword(keyword: Keyword) {
    const idx = this._keywords.indexOf(keyword);
    if (idx === -1) return;
    this._keywords.splice(idx, 1);
  }

  addKeyword(keyword: Keyword) {
    this._keywords.push(keyword);
  }

  hasKeyword(keyword: Keyword) {
    return (
      this._keywords.some(k => keyword.id === k.id) ||
      this.modifiers.some(mod => mod.keywords.some(k => keyword.id === k.id)) ||
      this.card.modifiers.some(mod => mod.keywords.some(k => keyword.id === k.id))
    );
  }

  get keywords() {
    const allModifiers: Array<EntityModifier | CardModifier> = [
      ...this.modifiers,
      ...this.card.modifiers
    ];

    const keywordsWithStacks = new Map<string, Keyword & { stacks?: number }>();

    if (this.card.isGenerated) {
      keywordsWithStacks.set(KEYWORDS.SUMMON.id, {
        ...KEYWORDS.SUMMON,
        stacks: undefined
      });
    }

    const addKeyword = (keyword: Keyword, stackable: boolean, stacks?: number) => {
      if (!keywordsWithStacks.has(keyword.id)) {
        keywordsWithStacks.set(keyword.id, {
          ...keyword,
          stacks: stackable ? stacks : undefined
        });
      } else if (stackable) {
        // @ts-expect-error
        keywordsWithStacks.get(keyword.id)!.stacks++;
      }
    };

    for (const modifier of allModifiers) {
      modifier.keywords.forEach(keyword => {
        addKeyword(keyword, modifier.stackable, modifier.stacks);
      });
    }

    this._keywords.forEach(keyword => {
      addKeyword(keyword, false);
    });

    return uniqBy([...keywordsWithStacks.values()], 'id');
  }
}
