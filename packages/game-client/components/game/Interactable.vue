<script setup lang="ts">
import type { Interactable } from '@hc/sdk';
import { Polygon } from 'pixi.js';

const { interactable } = defineProps<{
  interactable: Interactable;
}>();

const { mapRotation, state, gameSession, assets, fx } = useGame();
const { targetMode } = useGameUi();

const sheet = assets.getSpritesheet(interactable.spriteId);
const textures = computed(() => {
  return createSpritesheetFrameObject('idle', sheet);
});

const offset = computed(() => ({
  x: 0,
  z: 0,
  y: gameSession.map.getCellAt(interactable.position)?.isHalfTile
    ? -CELL_SIZE * 0.75
    : -CELL_SIZE
}));

const hitArea = computed(() => {
  const meta = sheet.data.meta as AsepriteMeta;

  // we need to offset the slice because the sprite has its anchor in the center
  const offset = {
    x: 0,
    y: 0
  };

  // default hit area is a square the size of once cell
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
</script>

<template>
  <IsoPositioner
    :x="interactable.position.x"
    :y="interactable.position.y"
    :z="interactable.position.z"
    :animated="fx.isMoving.value"
    :z-index-offset="SPRITE_OFFSETS.INTERACTABLE"
    :offset="offset"
    :map="{ width: state.map.width, height: state.map.height, rotation: mapRotation }"
  >
    <animated-sprite
      :event-mode="targetMode ? 'none' : 'static'"
      :x="-CELL_SIZE"
      :y="CELL_SIZE / 4"
      :textures="textures"
      :hit-area="hitArea"
      playing
    />
  </IsoPositioner>
</template>
