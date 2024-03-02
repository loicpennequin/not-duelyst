export const defaultSettings = {
  bindings: defaultBindings,
  sound: {
    musicVolume: [50],
    sfxVolume: [50]
  },
  ui: {
    displayUnitsStats: 'hover-on-top' as 'hover-only' | 'hover-on-top' | 'always'
  },
  a11y: {
    colorCodeUnits: false,
    simplifiedMapTextures: false
  }
};

export type Settings = typeof defaultSettings;
