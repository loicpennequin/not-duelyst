const fxSpritesGlobs = import.meta.glob('./*.json', { as: 'url', eager: true });

export const fxSpritesPaths = Object.fromEntries(
  Object.entries(fxSpritesGlobs).map(([key, module]) => {
    return [key.replace('./', '').replace('.json', ''), module];
  })
);
