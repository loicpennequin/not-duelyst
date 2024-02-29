import { Assets, type AssetsManifest, Spritesheet, Texture, extensions } from 'pixi.js';
import type { InjectionKey } from 'vue';

export type AssetsContext = {
  getSpritesheet(
    key: string,
    falback?: string
  ): Spritesheet & { animations: Record<string, Texture[]> };
  getTexture(key: string): any;
  load: () => Promise<void>;
};

export const ASSETS_INJECTION_KEY = Symbol('assets') as InjectionKey<AssetsContext>;

export const useAssetsProvider = () => {
  const spritesheets: Record<
    string,
    Spritesheet & { animations: Record<string, Texture[]> }
  > = {};
  const textures: Record<string, Texture> = {};

  const load = async () => {
    extensions.add(asepriteSpriteSheetParser, asepriteTilesetParser);

    const manifest = await $fetch<AssetsManifest>('/assets/assets-manifest.json');
    Assets.init({ manifest });
    const bundles = await Promise.all([
      Assets.loadBundle('tiles'),
      Assets.loadBundle('ui'),
      Assets.loadBundle('units'),
      Assets.loadBundle('tilesets'),
      Assets.loadBundle('interactables'),
      Assets.loadBundle('fx')
    ]);

    bundles.forEach(bundle => {
      Object.assign(spritesheets, bundle);
    });

    const skillBundle = await Assets.loadBundle('skills');
    Object.entries(skillBundle).forEach(([key, value]) => {
      // skill have the file extension in the manifest keys
      textures[trimExtension(key)] = value as Texture;
    });
  };

  const api: AssetsContext = {
    load,
    getSpritesheet(key: string, fallback?: string) {
      const sprite = spritesheets[key];
      if (!sprite && fallback) return spritesheets[fallback];
      if (!sprite) {
        throw new Error(`Unknown sprite: ${key} and no fallback specified.`);
      }
      return sprite;
    },
    getTexture(key) {
      const texture = textures[key];
      if (!texture) {
        throw new Error(`Unknown texture: ${key}.`);
      }
      return texture;
    }
  };

  provide(ASSETS_INJECTION_KEY, api);

  return api;
};

export const useAssets = () => useSafeInject(ASSETS_INJECTION_KEY);
