<script setup lang="ts">
import type { Modifier, Entity } from '@hc/sdk';
import { type AnimatedSprite } from 'pixi.js';

const { entity, modifier } = defineProps<{
  entity: Entity;
  modifier: Modifier;
}>();

const { assets, state, mapRotation } = useGame();

const scaleX = computed(() => {
  if (mapRotation.value === 90 || mapRotation.value === 180) {
    return entity.playerId === state.value.players[0].id ? -1 : 1;
  }

  return entity.playerId === state.value.players[0].id ? 1 : -1;
});

const { autoDestroyRef } = useAutoDestroy();

const frontTextures = createSpritesheetFrameObject(
  'idle',
  assets.getSpritesheet(`${modifier.spriteId}-front`)
);
const backTextures = createSpritesheetFrameObject(
  'idle',
  assets.getSpritesheet(`${modifier.spriteId}-back`)
);
</script>

<template>
  <animated-sprite
    :ref="autoDestroyRef"
    :textures="backTextures"
    :anchor-x="0.5"
    :scale-x="scaleX"
    event-mode="none"
    :z-index="1"
  />
  <animated-sprite
    :ref="autoDestroyRef"
    :textures="frontTextures"
    :anchor-x="0.5"
    :scale-x="scaleX"
    event-mode="none"
    :z-index="3"
  />
</template>
