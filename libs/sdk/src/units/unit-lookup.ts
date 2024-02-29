import { Faction } from '../faction/faction-lookup';
import { keyBy } from 'lodash-es';
import { Skill } from '../skill/skill';
import { UnitKind } from './constants';
import { Point3D } from '../types';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import { Effect } from '../effect/effect';
import { Rarity } from '../enums';
import { coreSet } from './sets/core';
import { Keyword } from '../utils/keywords';

export type UnitId = string;

export const isUnitId = (str: string): str is UnitId => Object.keys(UNITS).includes(str);

export type UnitBlueprint = {
  id: string;
  spriteId: string;
  kind: UnitKind;
  factions: Faction[];
  rarity: Rarity;

  summonCost: number;
  summonCooldown: number;

  maxHp: number;

  attack: number;
  speed: number;

  skills: Array<Skill>;

  effects?: {
    execute(ctx: GameSession, entity: Entity): void;
    keywords: Keyword[];
    description: string;
  }[];
  onSummoned?: {
    getDescription(unit: UnitBlueprint): string;
    minTargetCount: number;
    maxTargetCount: number;
    isTargetable(ctx: GameSession, point: Point3D, summonedPoint: Point3D): boolean;
    execute(ctx: GameSession, targets: Point3D[], summonedentity: Entity): void;
  };
};

export const UNITS = keyBy(
  // [...NEUTRAL_UNITS, ...HAVEN_UNITS, ...CHAOS_UNITS],
  [...coreSet],
  'id'
) satisfies Record<UnitId, UnitBlueprint>;
