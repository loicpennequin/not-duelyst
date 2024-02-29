<script setup lang="ts">
import type { Id } from '@hc/api/convex/_generated/dataModel';
import type { UnitBlueprint } from '@hc/sdk';

defineOptions({
  inheritAttrs: false
});

const { canAddToLoadout, isEditingLoadout, card, isInLoadout } = defineProps<{
  canAddToLoadout: boolean;
  isInLoadout: boolean;
  isEditingLoadout: boolean;
  card: { unit: UnitBlueprint; _id: Id<'collectionItems'>; unitId: string };
}>();

const emit = defineEmits<{ click: [] }>();
const rootEl = ref<HTMLElement>();

const angle = ref({
  x: 0,
  y: 0
});

const MAX_ANGLE = 15;
const onMousemove = (e: MouseEvent) => {
  if (!rootEl.value) return;

  const { clientX, clientY } = e;
  const { left, top, width, height } = rootEl.value.getBoundingClientRect();
  angle.value = {
    x: ((clientX - left) / width - 0.5) * MAX_ANGLE,
    y: ((clientY - top) / height - 0.5) * MAX_ANGLE
  };
};
</script>

<template>
  <div class="perspective-wrapper">
    <div
      ref="rootEl"
      :tabindex="isEditingLoadout && !canAddToLoadout ? -1 : 0"
      class="card"
      :class="{
        used: isEditingLoadout && isInLoadout,
        disabled: isEditingLoadout && !canAddToLoadout
      }"
      :style="{
        '--rotate-y': angle.x.toFixed(2),
        '--rotate-x': angle.y.toFixed(2)
      }"
      @mousemove="onMousemove"
      @click="emit('click')"
      @keyup.enter="emit('click')"
    >
      <UnitBlueprintCard :unit="card.unit" />

      <div v-if="isEditingLoadout && !canAddToLoadout" class="wrong-runes-warning">
        Incompatible runes.
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
@keyframes test {
  from {
    transform: translateX(calc(-1 * var(--size-4)));
    opacity: 0.5;
  }
  to {
    opacity: 1;
  }
}
.perspective-wrapper {
  transform-style: preserve-3d;
  padding: var(--size-1);
  perspective: 40rem;
  animation: test 0.3s;
  > * {
    height: 100%;
  }
}
.card {
  position: relative;
  display: grid;
  transition: filter 0.3s;

  > * {
    grid-column: 1;
    grid-row: 1;
  }

  &:focus-visible {
    outline: solid var(--border-size-3) var(--primary);
  }

  &.used {
    outline: solid var(--border-size-2) var(--primary);
  }

  &.disabled {
    opacity: 0.8;
    filter: grayscale(0.5);
  }

  &:not(.disabled):hover {
    transform: rotateY(calc(1deg * var(--rotate-y))) rotateX(calc(1deg * var(--rotate-x)));
  }
  &:not(:hover) {
    transition: transform 0.3s;
  }
}

.wrong-runes-warning {
  z-index: 1;

  place-self: center;

  width: 200px;
  margin-top: -30px;
  padding: var(--size-2) var(--size-3);

  background: hsl(0 0% 0% / 0.9);
  border-radius: var(--radius-2);
}
</style>
