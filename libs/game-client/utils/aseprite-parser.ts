import { ExtensionType, LoaderParserPriority, Texture } from 'pixi.js';
import { z } from 'zod';
import { uiSpritesPaths } from '../assets/ui';
import { unitSpritesPaths } from '../assets/units';
import { tileSpritesPaths } from '../assets/tiles';
import { tilesetsPaths } from '../assets/tilesets';
import { fxSpritesPaths } from '../assets/fx';
import { interactableSpritesPaths } from '../assets/interactables';

export const trimExtension = (str: string) => str.replace(/\.[^/.]+$/, '');

const asepriteSizeSchema = z.object({
  w: z.number(),
  h: z.number()
});
const asepriteRectSchema = asepriteSizeSchema.extend({
  x: z.number(),
  y: z.number()
});

export const asepriteJsonMetaSchema = z.object({
  image: z.string(),
  size: asepriteSizeSchema,
  scale: z.string(),
  frameTags: z
    .object({
      name: z.string(),
      from: z.number(),
      to: z.number(),
      direction: z.string()
    })
    .array(),
  slices: z
    .object({
      name: z.string(),
      keys: z
        .object({
          frame: z.number(),
          bounds: z.object({
            x: z.number(),
            y: z.number(),
            w: z.number(),
            h: z.number()
          })
        })
        .array()
    })
    .array()
    .optional()
});
export type AsepriteMeta = z.infer<typeof asepriteJsonMetaSchema>;

const asepriteJsonSchema = z.object({
  frames: z
    .object({
      filename: z.string(),
      frame: asepriteRectSchema,
      spriteSourceSize: asepriteRectSchema,
      duration: z.number().optional()
    })
    .array(),
  meta: asepriteJsonMetaSchema
});
type AsepriteJson = z.infer<typeof asepriteJsonSchema>;

const spriteUrls: string[] = [
  ...Object.values(uiSpritesPaths),
  ...Object.values(tileSpritesPaths),
  ...Object.values(unitSpritesPaths),
  ...Object.values(fxSpritesPaths),
  ...Object.values(interactableSpritesPaths)
];
const tilesetUrls: string[] = [...Object.values(tilesetsPaths)];

const isSprite = (url: string) => !!spriteUrls.find(path => url.includes(path));
const isTileset = (url: string) => !!tilesetUrls.find(path => url.includes(path));

const parseSprite = ({ frames, meta }: AsepriteJson) => {
  const sheet = {
    frames: Object.fromEntries(
      frames.map(frame => {
        const { filename } = frame;
        // avoids console warnings with HMR
        if (import.meta.env.DEV) {
          Texture.removeFromCache(filename);
        }
        return [filename, frame];
      })
    ),
    animations: Object.fromEntries(
      meta.frameTags.map(tag => [
        tag.name,
        frames.slice(tag.from, tag.to + 1).map(frame => frame.filename)
      ])
    ),
    meta: {
      ...meta,
      scale: '1'
    }
  };

  return sheet;
};

const parseTileset = ({ frames, meta }: AsepriteJson) => ({
  frames: Object.fromEntries(
    frames.map((frame, index) => {
      const frameName = `${trimExtension(meta.image)}-${index}`;
      // avoids console warnings with HMR
      if (import.meta.env.DEV) {
        Texture.removeFromCache(frameName);
      }

      return [frameName, frame];
    })
  ),
  meta
});

export const spriteSheetParser = {
  extension: {
    name: 'Aseprite spritesheet Parser',
    priority: LoaderParserPriority.Normal,
    type: ExtensionType.LoadParser
  },
  test(url: string): boolean {
    return isTileset(url) || isSprite(url);
  },
  async load(url: string) {
    const response = await fetch(url);
    const json = await response.json();

    const parsed = asepriteJsonSchema.parse(json);

    if (isTileset(url)) return parseTileset(parsed);
    if (isSprite(url)) return parseSprite(parsed);
  }
};
