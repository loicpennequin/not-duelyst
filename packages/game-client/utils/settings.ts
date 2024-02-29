export const defaultSettings = {
  bindings: defaultBindings,
  sound: {
    musicVolume: [50],
    sfxVolume: [50]
  },
  a11y: {
    colorCodeUnits: false,
    simplifiedMapTextures: false
  }
};

export type Settings = typeof defaultSettings;
