import { Values } from '@hc/shared';

export type Faction = {
  id: FactionName;
};

export const FACTION_NAMES = {
  FIRE: 'FIRE',
  WATER: 'WATER',
  AIR: 'AIR',
  EARTH: 'EARTH'
} as const;

export type FactionName = Values<typeof FACTION_NAMES>;
export type FactionId = keyof typeof FACTIONS;

export const FACTIONS = {
  FIRE: {
    id: FACTION_NAMES.FIRE
  },
  WATER: {
    id: FACTION_NAMES.WATER
  },
  AIR: {
    id: FACTION_NAMES.AIR
  },
  EARTH: {
    id: FACTION_NAMES.EARTH
  }
} as const satisfies Record<FactionName, Faction>;
