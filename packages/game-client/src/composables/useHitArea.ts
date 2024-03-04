import type { Entity } from '@hc/sdk';
import { Polygon } from 'pixi.js';

export const useHitArea = (entity: MaybeRefOrGetter<Entity>) => {
  const { assets } = useGame();

  const spritesheet = computed(() =>
    assets.getSpritesheet(toValue(entity).unit.spriteId, 'placeholder-unit')
  );

  return computed(() => {
    const meta = spritesheet.value.data.meta as AsepriteMeta;

    // we need to offset the slice because the sprite has its anchor in the center
    const offset = {
      x: CELL_SIZE * 1.25,
      y: 0
    };

    // default hit area is a square the size of one cell
    const defaultHitArea = new Polygon(
      { x: -CELL_SIZE / 2, y: CELL_SIZE / 2 },
      { x: CELL_SIZE / 2, y: CELL_SIZE / 2 },
      { x: CELL_SIZE / 2, y: CELL_SIZE * 1.5 },
      { x: -CELL_SIZE / 2, y: CELL_SIZE * 1.5 }
    );

    if (!meta.slices) return defaultHitArea;

    const hitAreaSlice = meta.slices.find(slice => slice.name === 'hitArea');
    if (!hitAreaSlice) return defaultHitArea;

    const {
      bounds: { x, y, w, h }
    } = hitAreaSlice.keys[0];

    return new Polygon([
      { x: x - offset.x, y: y - offset.y },
      { x: x + w - offset.x, y: y - offset.y },
      { x: x + w - offset.x, y: y + h - offset.y },
      { x: x - offset.x, y: y + h - offset.y }
    ]);
  });
};
