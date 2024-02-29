const uiSpritesGlobs = import.meta.glob('./*.json', { as: 'url', eager: true });

export const uiSpritesPaths = Object.fromEntries(
  Object.entries(uiSpritesGlobs).map(([key, module]) => {
    return [key.replace('./', '').replace('.json', ''), module];
  })
);

const uiImagesGlobs = import.meta.glob('./*.png', { as: 'url', eager: true });
export const uiImagesPaths = Object.fromEntries(
  Object.entries(uiImagesGlobs).map(([key, module]) => {
    return [key.replace('./', '').replace('.png', ''), module];
  })
);
