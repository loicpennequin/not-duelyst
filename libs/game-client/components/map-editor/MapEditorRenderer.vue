<script setup lang="ts">
import { useApplication } from 'vue3-pixi';
import type { Viewport } from 'pixi-viewport';
import type { Cell, Point3D } from '@hc/sdk';
import type { EditorMap } from './index.vue';

const { assets, rotation, visibleFloors, placeMode } = defineProps<{
  assets: AssetsContext;
  rotation: 0 | 90 | 180 | 270;
  visibleFloors: Record<number, boolean>;
  placeMode: 'sprite' | 'tile';
}>();

const emit = defineEmits<{
  cellPointerdown: [cell: Cell];
  cellPointerup: [cell: Cell];
  cellPointerenter: [cell: Cell];
}>();
const map = defineModel<EditorMap>('map', { required: true });

provide(ASSETS_INJECTION_KEY, assets);

const app = useApplication();

const screenViewport = shallowRef<Viewport>();

until(screenViewport)
  .not.toBe(undefined)
  .then(() => {
    const center = toIso({ x: 0, y: 0, z: 0 }, rotation, {
      width: 0,
      height: 0
    });

    screenViewport.value
      ?.drag({
        mouseButtons: 'right'
      })
      .pinch()
      .decelerate({ friction: 0.88 })
      .wheel({ smooth: 3, percent: 0.05 })
      .clampZoom({ minScale: 1, maxScale: 4 })
      .zoomPercent(1, false)
      .moveCenter(center.isoX, center.isoY);
  });

const playerSprites = [
  assets.getSpritesheet('player_1_start_position').animations.idle,
  assets.getSpritesheet('player_2_start_position').animations.idle
];
</script>

<template>
  <viewport
    ref="screenViewport"
    :screen-width="app.view.width"
    :screen-height="app.view.height"
    :world-width="map.width * CELL_SIZE"
    :world-height="map.height * CELL_SIZE"
    :events="app.renderer.events"
    :disable-on-context-menu="true"
    :sortable-children="true"
  >
    <EditorCell
      v-for="cell in map.cells"
      :key="cell.id"
      :cell="cell"
      :map="map"
      :rotation="rotation"
      :is-visible="!!visibleFloors[cell.position.z]"
      :place-mode="placeMode"
      @pointerup="emit('cellPointerup', cell)"
      @pointerdown="emit('cellPointerdown', cell)"
      @pointerenter="emit('cellPointerenter', cell)"
    />

    <IsoPositioner
      v-for="(player, index) in map.startPositions"
      :key="index"
      :x="player.x"
      :y="player.y"
      :z="player.z"
      :z-index-offset="SPRITE_OFFSETS.INTERACTABLE"
      :map="{ width: map.width, height: map.height, rotation: rotation }"
      :animated="false"
      event-mode="none"
    >
      <animated-sprite
        :textures="playerSprites[index]"
        :anchor="0.5"
        :y="CELL_SIZE / 2"
      />
    </IsoPositioner>
  </viewport>
</template>
