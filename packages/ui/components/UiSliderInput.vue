<script setup lang="ts">
const vmodel = defineModel<number[]>({ required: true });
const { label } = defineProps<{
  label: string;
}>();
</script>

<template>
  <SliderRoot v-model="vmodel" class="ui-slider-root" :max="100" :step="1">
    <SliderTrack class="ui-slider-track">
      <SliderRange class="ui-slider-range" />
    </SliderTrack>
    <SliderThumb class="ui-slider-thumb" :aria-label="label" as-child>
      <div class="ui-slider-thumb" :data-value="vmodel[0]"></div>
    </SliderThumb>
  </SliderRoot>
</template>

<style lang="postcss">
.ui-slider-root {
  touch-action: none;
  user-select: none;

  position: relative;

  display: flex;
  align-items: center;

  height: var(--size-4);
}

.ui-slider-track {
  position: relative;

  flex-grow: 1;

  height: 3px;

  background-color: hsl(var(--color-primary-hsl) / 0.2);
  border-radius: var(--radius-pill);
}

.ui-slider-range {
  position: absolute;
  height: 100%;
  background-color: hsl(var(--color-primary-hsl) / 0.5);
  border-radius: var(--radius-pill);
}

.ui-slider-thumb {
  position: relative;

  display: block;

  aspect-ratio: 1;
  width: var(--size-4);

  background-color: var(--primary);
  border-radius: var(--radius-2);
  box-shadow: var(--shadow-2);

  &:hover {
    background-color: var(--primary-hover);
  }

  &:focus {
    box-shadow: var(--shadow-3);
  }

  &:after {
    content: attr(data-value);
    position: absolute;
    top: calc(-1 * var(--size-5));
  }
}
</style>
