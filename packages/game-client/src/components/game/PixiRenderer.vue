<script setup lang="ts">
import { useApplication } from 'vue3-pixi';
import { type Viewport } from 'pixi-viewport';
import { CELL_SIZE } from '../../utils/constants';

const { state, ui, fx } = useGame();
const { ui: uiLayer, gameObjects: gameObjectsLayer } = ui.layers;
const app = useApplication();

const screenViewport = shallowRef<Viewport>();

useGameControls();

watchEffect(() => {
  if (!screenViewport.value) return;
  screenViewport.value.pause = ui.targetMode.value === 'move';
});

const { width, height, cells } = state.value.map;

const side = width + height;

const corners = [
  { x: 0, y: 0 },
  { x: 0, y: height - 1 },
  { x: width - 1, y: 0 },
  { x: width - 1, y: height - 1 }
];
const highestZ = Math.max(
  ...corners.map(corner =>
    Math.max(
      ...cells
        .filter(cell => cell.x === corner.x && cell.y === corner.y)
        .map(cell => cell.z)
    )
  )
);
const PADDING = CELL_SIZE;
const TOP_PADDING = (CELL_SIZE * highestZ) / 2;
const worldSize = {
  width: side * (CELL_SIZE / 2) + PADDING,
  height: side * (CELL_SIZE / 4) + TOP_PADDING + PADDING
};

until(screenViewport)
  .not.toBe(undefined)
  .then(() => {
    fx.viewport = screenViewport.value;
    screenViewport.value
      ?.drag({
        mouseButtons: 'left'
      })
      .pinch()
      .decelerate({ friction: 0.88 })
      .wheel({ smooth: 3, percent: 0.05 })
      // .mouseEdges({
      //   distance: 10,
      //   speed: 18,
      //   allowButtons: true
      // })
      .clamp({
        direction: 'all'
      })
      .clampZoom({ minScale: 1, maxScale: 3 })
      .zoomPercent(1, false);
    // .moveCenter(center.isoX, cente r.isoY);
  });

watchEffect(() => {
  if (gameObjectsLayer.value) {
    gameObjectsLayer.value.group.enableSort = true;
    gameObjectsLayer.value.sortableChildren = true;
  }
});
</script>

<template>
  <viewport
    ref="screenViewport"
    :screen-width="app.view.width"
    :screen-height="app.view.height"
    :world-width="worldSize.width"
    :world-height="worldSize.height"
    :events="app.renderer.events"
    :disable-on-context-menu="true"
    :sortable-children="true"
  >
    <container
      :x="worldSize.width / 2"
      :y="worldSize.height / 2 + TOP_PADDING / 2 - PADDING / 2"
      :sortable-children="true"
    >
      <Layer ref="gameObjectsLayer">
        <MapCell v-for="cell in state.map.cells" :key="cell.id" :cell="cell" />

        <Interactable
          v-for="interactable in state.map.interactables"
          :key="`${interactable.id}:${interactable.position.x}:${interactable.position.y}:${interactable.position.z}`"
          :interactable="interactable"
        />
        <Unit v-for="entity in state.entities" :key="entity.id" :entity="entity" />
      </Layer>
    </container>

    <Layer ref="uiLayer" />
  </viewport>
</template>
