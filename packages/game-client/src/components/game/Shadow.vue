<script setup lang="ts">
import { ColorOverlayFilter } from '@pixi/filter-color-overlay';
import type { FrameObject } from 'pixi.js';

const { textures } = defineProps<{ textures: FrameObject[] }>();

const filters = [new ColorOverlayFilter(0x000000)];
</script>

<template>
  <animated-sprite
    v-if="textures?.length"
    :textures="textures"
    :z-index="1"
    :filters="filters"
    :scale-y="0.45"
    :skew-x="-1"
    :anchor="0.5"
    :y="CELL_SIZE * 1.45"
    loop
    event-mode="none"
    playing
  />
</template>
