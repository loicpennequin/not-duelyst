<script setup lang="ts">
import type { ButtonProps, ButtonStyleVariables } from './UiButton.vue';

type IconButtonStyleVariables = '--ui-icon-button-size' | '--ui-icon-button-radius';

const { name, style = {} } = defineProps<
  ButtonProps & {
    name: string;
    style?: StyleProp<ButtonStyleVariables | IconButtonStyleVariables>;
  }
>();
</script>

<template>
  <UiButton class="ui-icon-button" :style="style">
    <Icon :name="name" />
  </UiButton>
</template>

<style scoped lang="postcss">
@layer components {
  .ui-icon-button {
    --_ui-icon-button-size: var(--ui-icon-button-size, var(--font-size-3));
    --_ui-icon-button-radius: var(--ui-icon-button-radius, var(--radius-round));

    --ui-button-radius: var(--_ui-icon-button-radius);
    --ui-button-size: var(--_ui-icon-button-size);

    aspect-ratio: 1;
    padding: var(--size-1-em);
  }
}
</style>
