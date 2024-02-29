import { Values } from '@hc/shared';

export type Faction = {
  id: FactionName;
};

export const FACTION_NAMES = {
  FIRE: 'FIRE',
  WATER: 'WATER',
  AIR: 'AIR',
  EARTH: 'EARTH',
  LIGHT: 'LIGHT',
  DARK: 'DARK'
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
  },
  LIGHT: {
    id: FACTION_NAMES.LIGHT
  },
  DARK: {
    id: FACTION_NAMES.DARK
  }
} as const satisfies Record<FactionName, Faction>;
