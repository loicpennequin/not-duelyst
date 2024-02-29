const skillImagesGlobs = import.meta.glob('./*.png', { as: 'url', eager: true });

export const skillImagesPaths = Object.fromEntries(
  Object.entries(skillImagesGlobs).map(([key, module]) => {
    return [key.replace('./', '').replace('.png', ''), module];
  })
);
