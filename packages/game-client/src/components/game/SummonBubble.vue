<script setup lang="ts">
import type { Entity } from '@hc/sdk';
import { type AnimatedSprite } from 'pixi.js';
import { AdvancedBloomFilter } from '@pixi/filter-advanced-bloom';

const { entity } = defineProps<{
  entity: Entity;
}>();

const emit = defineEmits<{ done: [] }>();
const { assets } = useGame();

const sheet = assets.getSpritesheet(`summon-neutral`);
const textures = createSpritesheetFrameObject('idle', sheet);
const spriteRef = ref<AnimatedSprite>();
const filters = [
  new AdvancedBloomFilter({
    threshold: 0.5,
    bloomScale: 1,
    brightness: 0.8,
    blur: 8,
    quality: 4
  })
];

const isSummonAnimationDone = ref(false);
</script>

<template>
  <AnimatedSprite
    v-if="!isSummonAnimationDone && entity.kind !== 'GENERAL'"
    ref="spriteRef"
    :textures="textures"
    playing
    :x="-CELL_SIZE / 2"
    :y="CELL_SIZE / 2"
    :loop="false"
    :filters="filters"
    @frame-change="
      (frame: number) => {
        if (frame >= spriteRef!.totalFrames * 0.5) {
          emit('done');
        }
      }
    "
    @complete="isSummonAnimationDone = true"
  />
</template>
