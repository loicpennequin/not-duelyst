<script setup lang="ts">
import type { UITooltipProps } from './UiTooltip.vue';

const {
  sideOffset = 0,
  text,
  ...otherProps
} = defineProps<UITooltipProps & { text: string }>();

const passthroughProps = computed(() => ({
  sideOffset,
  ...otherProps
}));
</script>

<template>
  <UiTooltip v-bind="passthroughProps">
    <template #trigger>
      <slot />
    </template>
    <div class="bg-surface-4 p-1 text-0">
      {{ text }}
      <TooltipArrow class="ui-simple-tooltip-arrow" :width="12" :height="12" />
    </div>
  </UiTooltip>
</template>

<style scoped lang="postcss">
:global(.ui-simple-tooltip-arrow) {
  fill: var(--surface-4);
}
</style>
