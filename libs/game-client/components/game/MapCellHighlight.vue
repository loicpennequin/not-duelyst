<script setup lang="ts">
import { PTransition } from 'vue3-pixi';
import type { Cursor } from 'pixi.js';
import type { Cell } from '@hc/sdk';
import { isDefined } from '@hc/shared';

const { cell, cursor } = defineProps<{
  cursor?: Cursor;
  cell: Cell;
}>();

const { state, gameSession, mapRotation, assets, utils } = useGame();
const { selectedEntity, targetMode } = useGameUi();

const isHighlighted = computed(() => {
  if (!cell) return;

  switch (targetMode.value) {
    case 'skill':
      return utils.isWithinRangeOfSkill(cell.position);
    case 'summon':
      return utils.canSummonAt(cell.position);
    case 'move':
      return (
        utils.canMoveTo(cell.position) &&
        selectedEntity.value &&
        selectedEntity.value.remainingMovement > 0
      );
    default:
      return false;
  }
});

const getCellBitmask = () => {
  if (!cell) return null;

  return getBitMask(gameSession, state.value, cell, mapRotation.value, neighbor => {
    if (!neighbor) return false;
    if (targetMode.value === 'skill') {
      return utils.isWithinRangeOfSkill(neighbor.position);
    }
    if (targetMode.value === 'summon') {
      return (
        utils.canSummonAt(neighbor.position) &&
        !gameSession.entityManager.getEntityAt(neighbor.position)
      );
    }

    return utils.canMoveTo(neighbor);
  });
};

const tileset = computed(() =>
  targetMode.value === 'skill'
    ? assets.getSpritesheet('targetable_cell')
    : assets.getSpritesheet('movable_cell')
);

const texture = computed(() => {
  const bitMask = getCellBitmask();

  if (!isDefined(bitMask)) return;

  return getTextureIndexFromBitMask(bitMask, tileset.value);
});

const { autoDestroyRef } = useAutoDestroy();
</script>

<template>
  <PTransition
    appear
    :duration="{ enter: 500, leave: 300 }"
    :before-enter="{ alpha: 0 }"
    :enter="{ alpha: 1 }"
    :leave="{ alpha: 0 }"
  >
    <container
      v-if="texture && isHighlighted"
      :ref="container => autoDestroyRef(container)"
      event-mode="none"
      :x="-CELL_SIZE / 2"
      :y="gameSession.map.getCellAt(cell)?.isHalfTile ? CELL_SIZE / 4 : 0"
    >
      <sprite :texture="texture" :cursor="cursor" />
    </container>
  </PTransition>
</template>
