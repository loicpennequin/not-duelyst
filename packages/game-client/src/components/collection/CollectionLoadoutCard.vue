<script setup lang="ts">
import type { LoadoutDto } from '@hc/api/convex/loadout/loadout.mapper';

const props = defineProps<{
  loadout: LoadoutDto;
}>();
const emit = defineEmits<{
  edit: [];
  delete: [];
}>();
</script>

<template>
  <LoadoutCard
    :loadout="loadout"
    tabindex="0"
    @click="emit('edit')"
    @keydown.enter="emit('edit')"
  />

  <div class="delete-loadout">
    <UiIconButton
      name="material-symbols:delete-outline"
      class="error-button"
      :style="{
        '--ui-icon-button-size': 'var(--font-size-4)',
        '--ui-icon-button-radius': '0'
      }"
      @click="emit('delete')"
    />
  </div>
</template>

<style scoped lang="postcss">
.delete-loadout {
  position: absolute;
  top: 0;
  right: 0;

  display: grid;
  align-items: flex-end;

  height: 100%;
  padding: 2px;

  > button {
    border-top: var(--fancy-border);
    border-left: var(--fancy-border);
    border-top-left-radius: var(--radius-3);
    box-shadow: inset 0 0 3px 4px rgba(0, 0, 0, 0.35);

    transition: transform 0.2s;

    &:hover {
      transform: translateY(2px);
    }
  }
}
</style>
