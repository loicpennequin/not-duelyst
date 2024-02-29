const sfxGlobs = import.meta.glob('./*.{mp3,m4a}', { as: 'url', eager: true });

export const sfxPaths = Object.fromEntries(
  Object.entries(sfxGlobs).map(([key, module]) => {
    return [key.replace('./', '').replace('.mp3', '').replace('.m4a', ''), module];
  })
);
