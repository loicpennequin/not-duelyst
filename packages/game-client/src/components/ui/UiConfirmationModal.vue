<script setup lang="ts">
const isOpened = defineModel<boolean>('isOpened', { required: true });
const { description, isDestructive } = defineProps<{
  description: string;
  isDestructive?: boolean;
}>();
const emit = defineEmits<{ ok: [] }>();
</script>

<template>
  <UiModal v-model:is-opened="isOpened" title="Delete loadout" :description="description">
    <div class="flex gap-5 justify-around mt-6">
      <UiButton class="ghost-button" @click="isOpened = false">Cancel</UiButton>
      <UiFancyButton
        class="error-button"
        :style="{
          '--hue': isDestructive ? '0deg' : undefined
        }"
        @click="emit('ok')"
      >
        OK
      </UiFancyButton>
    </div>
  </UiModal>
</template>
