<script setup lang="ts">
import { Polygon } from 'pixi.js';
import { INTERACTABLES, type Cell } from '@hc/sdk';
import { ColorOverlayFilter } from '@pixi/filter-color-overlay';
import type { EditorMap } from './index.vue';

const { isVisible, cell, rotation, map, placeMode } = defineProps<{
  cell: Cell;
  map: EditorMap;
  isVisible: boolean;
  rotation: 0 | 90 | 180 | 270;
  placeMode: 'sprite' | 'tile';
}>();

// mapa Tile key to a sprite to display in tile place mode
const TILE_TO_EDITOR_SPRITE = {
  ground: 'editor-ground',
  groundHalf: 'editor-ground-half',
  water: 'editor-water',
  waterHalf: 'editor-water-half',
  obstacle: 'editor-obstacle'
};

const assets = useAssets();
const spriteTextures = computed(() => {
  if (placeMode === 'tile') {
    const sheet = assets.getSpritesheet(
      TILE_TO_EDITOR_SPRITE[cell.tile.id as keyof typeof TILE_TO_EDITOR_SPRITE]
    );
    return [sheet.animations[Math.abs(rotation)] ?? sheet.animations[0]];
  }

  return cell.spriteIds.map(spriteId => {
    const sheet = assets.getSpritesheet(spriteId);
    return sheet.animations[Math.abs(rotation)] ?? sheet.animations[0];
  });
});

const emptyTextures = computed(() => {
  return assets.getSpritesheet(
    TILE_TO_EDITOR_SPRITE[cell.tile.id as keyof typeof TILE_TO_EDITOR_SPRITE]
  ).animations[0];
});

const interactableTexture = computed(() => {
  const interactable = map.interactables.find(i => cell.position.equals(i.position));
  if (!interactable) return null;

  // @ts-expect-error 💀
  const ctor = INTERACTABLES[interactable.id];

  const instance = new ctor({}, { position: cell.position });
  const id = instance.spriteId;

  const sheet = assets.getSpritesheet(id);
  return createSpritesheetFrameObject('idle', sheet);
});

const hitAreaYOffset = cell.isHalfTile ? CELL_SIZE / 4 : 0;
const hitArea = new Polygon([
  { x: 0, y: 0 + hitAreaYOffset },
  { x: CELL_SIZE / 2, y: CELL_SIZE / 4 + hitAreaYOffset },
  { x: CELL_SIZE / 2, y: CELL_SIZE * 0.75 },
  { x: 0, y: CELL_SIZE },
  { x: -CELL_SIZE / 2, y: CELL_SIZE * 0.75 },
  { x: -CELL_SIZE / 2, y: CELL_SIZE / 4 + hitAreaYOffset }
]);

const hoveredFilter = new ColorOverlayFilter(0x4455bb, 0.5);
const isHovered = ref(false);
</script>

<template>
  <IsoPositioner
    :x="cell.position.x"
    :y="cell.position.y"
    :z="cell.position.z"
    :map="{ width: map.width, height: map.height, rotation: rotation }"
    :animated="false"
    :event-mode="isVisible ? 'static' : 'none'"
  >
    <container
      :hit-area="hitArea"
      :filters="isHovered ? [hoveredFilter] : []"
      :alpha="isVisible ? 1 : 0.05"
      @pointerenter="isHovered = true"
      @pointerleave="isHovered = false"
    >
      <animated-sprite
        v-for="(textures, index) in spriteTextures"
        :key="index"
        :textures="textures"
        :anchor="0.5"
        :y="CELL_SIZE / 2"
      />

      <animated-sprite
        v-if="!spriteTextures.length"
        :alpha="0.5"
        :textures="emptyTextures"
        :anchor="0.5"
        :y="CELL_SIZE / 2"
      />

      <animated-sprite
        v-if="interactableTexture"
        :textures="interactableTexture"
        :anchor="0.5"
        :y="CELL_SIZE / 4"
        :playing="true"
      />
    </container>
  </IsoPositioner>
</template>
