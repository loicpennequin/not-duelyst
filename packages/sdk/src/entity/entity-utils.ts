import { type Nullable, isDefined } from '@hc/shared';
import { GameSession } from '../game-session';
import { type Point3D } from '../types';
import { type UnitKind, UNIT_KIND } from '../units/constants';
import { Entity, type EntityId } from './entity';

export const getEntityIfOwnerMatches = (
  ctx: GameSession,
  entityId: number,
  playerId: string
) => {
  const entity = ctx.entityManager.getEntityById(entityId);
  if (!entity) return null;

  if (entity.playerId !== playerId) return null;

  return entity;
};

export const isAlly = (
  ctx: GameSession,
  entityId: Nullable<EntityId>,
  playerId: string
) => {
  if (!isDefined(entityId)) return false;
  const entity = ctx.entityManager.getEntityById(entityId);
  if (!entity) return false;

  return entity.playerId === playerId;
};

export const isEnemy = (
  ctx: GameSession,
  entityId: Nullable<EntityId>,
  playerId: string
) => {
  if (!isDefined(entityId)) return false;
  const entity = ctx.entityManager.getEntityById(entityId);
  if (!entity) return false;

  return entity.playerId !== playerId;
};

export const isKind = (kind: UnitKind) => (entity: Nullable<Entity>) =>
  entity?.kind === kind;
export const isGeneral = isKind(UNIT_KIND.GENERAL);
export const isSoldier = isKind(UNIT_KIND.SOLDIER);

export const isEmpty = (ctx: GameSession, point: Point3D) => {
  return !ctx.entityManager.getEntityAt(point);
};
