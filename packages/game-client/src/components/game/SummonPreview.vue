<script setup lang="ts">
import { PTransition } from 'vue3-pixi';
import type { Container } from 'pixi.js';
import { AdjustmentFilter } from '@pixi/filter-adjustment';
import { TextStyle } from 'pixi.js';

const { state, mapRotation, assets, utils } = useGame();
const { selectedSummon, hoveredCell, targetMode, summonSpawnPoint } = useGameUi();

const isSummonTarget = computed(
  () => hoveredCell.value && utils.canSummonAt(hoveredCell.value.position)
);

const sheet = computed(() => {
  if (!selectedSummon.value) return null;
  return assets.getSpritesheet(selectedSummon.value.spriteId, 'placeholder-unit');
});
const textures = computed(() =>
  sheet.value ? createSpritesheetFrameObject('idle', sheet.value) : null
);
const scaleX = computed(() => {
  if (mapRotation.value === 90 || mapRotation.value === 180) {
    return state.value.activePlayer.id === state.value.players[0].id ? -1 : 1;
  }

  return state.value.activePlayer.id === state.value.players[0].id ? 1 : -1;
});
const filters = [
  new AdjustmentFilter({
    brightness: 2,
    alpha: 0.5
  })
];

const isDisplayed = computed(() => {
  return (
    (isSummonTarget.value && hoveredCell.value) || targetMode.value === 'summon-targets'
  );
});

const textStyle = new TextStyle({
  fontSize: 20,
  fontWeight: '700',
  fill: 'red',
  stroke: 'black',
  strokeThickness: 4
});

const ui = useGameUi();
// ts in unhappy if we type the parameter, because vue expects fucntion refs to take a VNode as argument
// However, in vue3-pixi, the behavior is different
const addToUiLayerRef = (_container: any) => {
  const container = _container as Container;
  if (!container) return;
  container.parentLayer = ui.layers.ui.value;
};

const position = computed(() => {
  if (targetMode.value === 'summon-targets') {
    return summonSpawnPoint.value!;
  }

  return hoveredCell.value!.position;
});
</script>

<template>
  <PTransition
    appear
    :duration="{ enter: 100, leave: 100 }"
    :before-enter="{ alpha: 0 }"
    :enter="{ alpha: 1 }"
    :leave="{ alpha: 0 }"
  >
    <IsoPositioner
      v-if="isDisplayed"
      :animated="false"
      v-bind="position"
      :map="{ width: state.map.width, height: state.map.height, rotation: mapRotation }"
    >
      <container :ref="addToUiLayerRef" :y="hoveredCell!.isHalfTile ? CELL_SIZE / 4 : 0">
        <animated-sprite
          v-if="textures"
          :event-mode="'none'"
          :textures="textures"
          :scale-x="scaleX"
          :anchor="0.5"
          :playing="false"
          :filters="filters"
        />

        <container :x="CELL_SIZE * 0.5" :y="-10">
          <text :scale="0.5" :style="textStyle as any" :anchor="0.5">
            - {{ selectedSummon?.summonCost }}
          </text>
          <animated-sprite
            :x="15"
            :event-mode="'none'"
            :textures="
              createSpritesheetFrameObject(
                'idle',
                assets.getSpritesheet('summon-cost-gold')
              )
            "
            :scale-x="scaleX"
            :anchor="0.5"
            :playing="false"
          />
        </container>
      </container>
    </IsoPositioner>
  </PTransition>
</template>
