<script setup lang="ts">
import type { Entity } from '@hc/sdk';
import { TextStyle } from 'pixi.js';

const { entity, isHovered } = defineProps<{
  entity: Entity;
  isHovered: boolean;
}>();

const settings = useUserSettings();
const hitArea = useHitArea(entity);
const ui = useGameUi();

// ts in unhappy if we type the parameter, because vue expects fucntion refs to take a VNode as argument
// However, in vue3-pixi, the behavior is different
const nameRef = (_container: any) => {
  if (!_container) return;

  _container.parentLayer = ui.layers.ui.value;
};

const nameStyle = new TextStyle({
  fill: 'white',
  fontSize: 26,
  fontFamily: 'monospace',
  dropShadow: true,
  dropShadowColor: 'black',
  dropShadowDistance: 2,
  stroke: 'black',
  strokeThickness: 4
});

const isNameDisplayed = computed(() => {
  switch (settings.value.ui.displayUnitsNames) {
    case 'never':
      return false;
    case 'always':
      return true;
    case 'hover-only':
      return isHovered;
  }
});

const namePositionY = computed(() => {
  return Math.min(
    ...hitArea.value.points.map((point, index) => (index % 2 === 0 ? Infinity : point))
  );
});
</script>

<template>
  <pixi-text
    v-if="isNameDisplayed"
    :ref="nameRef"
    :style="nameStyle"
    :anchor="0.5"
    :y="namePositionY - 25"
    :scale="0.25"
    event-mode="none"
  >
    {{ entity.unit.id.toLocaleUpperCase() }}
  </pixi-text>
</template>
