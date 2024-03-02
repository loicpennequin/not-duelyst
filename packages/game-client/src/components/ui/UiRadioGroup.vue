<script setup lang="ts" generic="T">
import { RadioGroupIndicator, RadioGroupItem, RadioGroupRoot } from 'radix-vue';

const { options } = defineProps<{
  options: { label: string; value: T; id: string }[];
}>();

const value = defineModel<T>({ required: true });
</script>

<template>
  <RadioGroupRoot
    v-model="value"
    class="ui-radio-group-root"
    :default-value="options[0].value"
  >
    <div v-for="option in options" :key="option.id" class="flex items-center gap-2">
      <RadioGroupItem :id="option.id" class="ui-radio-group-item" :value="option.value">
        <RadioGroupIndicator class="ui-radio-group-indicator" />
      </RadioGroupItem>
      <label class="ui-radio-group-label" :for="option.id">{{ option.label }}</label>
    </div>
  </RadioGroupRoot>
</template>

<style lang="postcss">
.ui-radio-group-root {
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
}

.ui-radio-group-item {
  aspect-ratio: 1;
  width: var(--size-4);
  background-color: hsl(var(--color-primary-hsl) / 0.4);
  border-radius: var(--radius-round);

  &:hover {
    background-color: hsl(var(--color-primary-hsl) / 0.5);
  }
}

.ui-radio-group-indicator {
  position: relative;
  transform: translateX(-2px);

  display: grid;
  place-content: center;

  aspect-ratio: 1;
  width: 12px;

  background-color: var(--primary);
  border-radius: var(--radius-round);
}

.ui-radio-group-label {
  line-height: 1;
}
</style>
