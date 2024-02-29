const interactableSpritesGlobs = import.meta.glob('./*.json', { as: 'url', eager: true });
export const interactableSpritesPaths = Object.fromEntries(
  Object.entries(interactableSpritesGlobs).map(([key, module]) => {
    return [key.replace('./', '').replace('.json', ''), module];
  })
);

const interactableImagesGlobs = import.meta.glob('./*.png', { as: 'url', eager: true });
export const interactableImagesPaths = Object.fromEntries(
  Object.entries(interactableImagesGlobs).map(([key, module]) => {
    return [key.replace('./', '').replace('.png', ''), module];
  })
);
