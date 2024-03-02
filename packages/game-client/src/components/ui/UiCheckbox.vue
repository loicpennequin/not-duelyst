<script setup lang="ts" generic="T">
import { CheckboxIndicator, CheckboxRoot, type CheckboxRootProps } from 'radix-vue';
import { Icon } from '@iconify/vue';

const checked = defineModel<boolean>('checked', { required: true });

const props = defineProps<Omit<CheckboxRootProps, 'checked'>>();
</script>

<template>
  <label>
    <CheckboxRoot v-model:checked="checked" class="root" v-bind="props">
      <CheckboxIndicator class="inner">
        <Icon icon="radix-icons:check" />
      </CheckboxIndicator>
    </CheckboxRoot>
    <span class="Label">Accept terms and conditions.</span>
  </label>
</template>

<style scoped lang="postcss">
.root {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 25px;
  height: 25px;

  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px var(--black-a7);
  &:hover {
    background-color: var(--grass-3);
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px black;
  }
}

.inner {
  color: var(--primary);
}

label {
  display: flex;
  align-items: center;
  line-height: 1;
  color: var(--gray-11);
}
</style>
