<script setup lang="ts">
import type { Entity } from '@hc/sdk/src';
import type { Container } from 'pixi.js';

const { entity, isHovered } = defineProps<{ entity: Entity; isHovered: boolean }>();

const { assets } = useGame();
const spritesheet = assets.getSpritesheet('unit-stats');

const textures = createSpritesheetFrameObject('idle', spritesheet);

const COLORS = {
  hp: '#a7ed00',
  attack: '#ff2245'
} as const;

const { autoDestroyRef } = useAutoDestroy();

const root = ref<Container>();
// ts in unhappy if we type the parameter, because vue expects fucntion refs to take a VNode as argument
// However, in vue3-pixi, the behavior is different
const containerRef = (_container: any) => {
  root.value = _container;
  autoDestroyRef(root.value, 100);
};

const { layers } = useGameUi();
watchEffect(() => {
  if (root.value) {
    root.value.parentLayer = isHovered ? layers.ui.value : undefined;
  }
});
</script>

<template>
  <container :ref="containerRef" :z-index="isHovered ? 99 : 2" event-mode="none">
    <animated-sprite :textures="textures" :anchor="0.5" :y="CELL_SIZE * 1.125">
      <text
        :anchor="0.5"
        :style="{
          fill: COLORS.hp,
          fontSize: 36,
          fontFamily: 'monospace',
          textAlign: 'center'
        }"
        :x="+CELL_SIZE / 2 - 9"
        :y="CELL_SIZE / 2 - 10"
        :scale="0.25"
      >
        {{ entity.hp }}
      </text>

      <text
        :style="{
          fill: COLORS.attack,
          fontSize: 36,
          textAlign: 'center',
          fontFamily: 'monospace'
        }"
        :anchor="0.5"
        :x="-CELL_SIZE / 2 + 10"
        :y="CELL_SIZE / 2 - 10"
        :scale="0.25"
      >
        {{ entity.attack }}
      </text>
    </animated-sprite>
  </container>
</template>
