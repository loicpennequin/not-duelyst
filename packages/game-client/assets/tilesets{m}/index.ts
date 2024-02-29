const tilesetsGlobs = import.meta.glob('./*.json', { as: 'url', eager: true });

export const tilesetsPaths = Object.fromEntries(
  Object.entries(tilesetsGlobs).map(([key, module]) => {
    return [key.replace('./', '').replace('.json', ''), module];
  })
);
