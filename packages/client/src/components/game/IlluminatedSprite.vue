<script setup lang="ts">
import { type Texture, type FrameObject, Filter } from 'pixi.js';
import { diffuseGroup, normalGroup } from '@pixi/lights';

defineOptions({
  inheritAttrs: false
});

const { diffuseTextures, normalTextures, isFlipped, filters } = defineProps<{
  diffuseTextures: (Texture | FrameObject)[];
  normalTextures: (Texture | FrameObject)[];
  filters?: Filter[];
  isFlipped?: boolean;
  alpha?: number;
}>();

const fragShader = /*glsl*/ `
varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main() {
  vec4 original = texture2D(uSampler, vTextureCoord);
  gl_FragColor = vec4(mix(original.r, 1.0 - original.r, original.a), original.gba);
}
`;

const flipFilter = new Filter(undefined, fragShader);

const attrs = useAttrs();
const normalFilters = computed(() => {
  if (!isFlipped) return filters;

  return (filters ?? []).concat([flipFilter]);
});
</script>

<template>
  <animated-sprite
    v-bind="attrs"
    :ref="
      (el: any) => {
        if (!el) return;
        // el.parentGroup = diffuseGroup;
      }
    "
    :filters="filters"
    :textures="diffuseTextures"
  />

  <!-- <animated-sprite
    v-bind="attrs"
    :ref="
      (el: any) => {
        if (!el) return;
        el.parentGroup = normalGroup;
      }
    "
    :filters="normalFilters"
    :textures="normalTextures"
  /> -->
</template>