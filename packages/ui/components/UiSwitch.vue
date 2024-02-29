<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'radix-vue';

const switchState = defineModel({ required: true });
</script>

<template>
  <SwitchRoot id="airplane-mode" v-model:checked="switchState" class="ui-switch">
    <SwitchThumb class="ui-switch-thumb" />
  </SwitchRoot>
</template>

<style lang="postcss">
.ui-switch {
  position: relative;

  width: 42px;
  height: 25px;

  background-color: hsl(var(--color-primary-hsl) / 0.15);
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-2);

  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

  &:focus-visible {
    box-shadow: 0 0 0 2px black;
  }

  &[data-state='checked'] {
    background-color: hsl(var(--color-primary-hsl) / 0.5);
  }
}

.ui-switch-thumb {
  will-change: transform;

  transform: translateX(-2px);

  display: block;

  width: 21px;
  height: 21px;

  background-color: var(--primary);
  border-radius: var(--radius-pill);

  transition: transform 100ms;

  &[data-state='checked'] {
    transform: translateX(12px);
  }
}
</style>
