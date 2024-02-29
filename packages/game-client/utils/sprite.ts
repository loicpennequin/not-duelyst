import type { FrameObject, Spritesheet } from 'pixi.js';

// matches textures from an animation to its duration in the sprite sheet data
export const createSpritesheetFrameObject = (
  name: string,
  spritesheet: Spritesheet
): FrameObject[] => {
  const frames = spritesheet.data.animations?.[name];
  // @ts-expect-error
  const textures = spritesheet.animations[name];
  if (!frames || !textures) throw new Error(`unknown animation: ${name}`);

  return frames.map((frame, index) => {
    return {
      texture: textures[index],
      // @ts-ignore bruh
      time: spritesheet.data.frames[frame].duration
    };
  });
};

export const SPRITE_OFFSETS = {
  INTERACTABLE: 2,
  ENTITY: 2.1,
  HALF_TILE: -1
} as const;
