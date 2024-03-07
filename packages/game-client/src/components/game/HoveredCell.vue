<script setup lang="ts">
const { hoveredCell } = useGameUi();
const { assets, state, mapRotation } = useGame();
const textures = computed(() =>
  createSpritesheetFrameObject('idle', assets.getSpritesheet('hovered_cell'))
);

const zIndexOffset = computed(() => {
  if (hoveredCell.value?.isHalfTile) {
    return SPRITE_ZINDEX_OFFSETS.HOVERED_CELL + SPRITE_ZINDEX_OFFSETS.HALF_TILE;
  }
  return SPRITE_ZINDEX_OFFSETS.HOVERED_CELL;
});
</script>

<template>
  <IsoPositioner
    v-if="hoveredCell"
    :x="hoveredCell.x"
    :y="hoveredCell.y"
    :z="hoveredCell.z"
    :z-index-offset="zIndexOffset"
    :map="{ width: state.map.width, height: state.map.height, rotation: mapRotation }"
    animated
  >
    <animated-sprite
      :x="0"
      :y="hoveredCell.isHalfTile ? CELL_SIZE * 0.75 : CELL_SIZE / 2"
      :event-mode="'none'"
      :anchor="0.5"
      playing
      :textures="textures"
    />
  </IsoPositioner>
</template>
