import type { Faction } from '../faction/faction-lookup';
import { keyBy } from 'lodash-es';
import { Skill } from '../skill/skill';
import type { UnitKind } from './constants';
import type { Point3D } from '../types';
import { Entity } from '../entity/entity';
import { GameSession } from '../game-session';
import type { Rarity } from '../enums';
import { coreSet } from './sets/core';
import type { Keyword } from '../utils/keywords';
import type { Player } from '../player/player';

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

  effects?: Array<{
    keywords: Keyword[];
    description: string;
    execute(ctx: GameSession, entity: Entity, targets: Point3D[]): void;
  }>;

  onSummoned?: {
    minTargetCount: number;
    maxTargetCount: number;
    isTargetable(
      ctx: GameSession,
      point: Point3D,
      summonedPoint: Point3D,
      owner: Player
    ): boolean;
  };
};

export const UNITS = keyBy(
  // [...NEUTRAL_UNITS, ...HAVEN_UNITS, ...CHAOS_UNITS],
  [...coreSet],
  'id'
) satisfies Record<UnitId, UnitBlueprint>;
