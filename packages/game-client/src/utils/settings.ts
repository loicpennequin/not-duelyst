import type { Values } from '@hc/shared';

export const DISPLAY_UNITS_STATS = {
  HOVER_ON_TOP: 'hover-on-top',
  HOVER_ONLY: 'hover-only',
  ALWAYS: 'always'
} as const;
export type DisplayUnitStatsValue = Values<typeof DISPLAY_UNITS_STATS>;

export const DISPLAY_UNITS_NAMES = {
  NEVER: 'never',
  HOVER_ONLY: 'hover-only',
  ALWAYS: 'always'
} as const;
export type DisplayUnitNamesValue = Values<typeof DISPLAY_UNITS_NAMES>;

export const defaultSettings = {
  bindings: defaultBindings,
  sound: {
    musicVolume: [50],
    sfxVolume: [50]
  },
  ui: {
    displayUnitsStats: DISPLAY_UNITS_STATS.HOVER_ONLY as DisplayUnitStatsValue,
    displayUnitsNames: DISPLAY_UNITS_NAMES.NEVER as DisplayUnitNamesValue
  },
  a11y: {
    colorCodeUnits: false,
    simplifiedMapTextures: false
  }
};

export type Settings = typeof defaultSettings;
