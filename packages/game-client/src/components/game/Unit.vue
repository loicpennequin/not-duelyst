<script setup lang="ts">
import type { Entity } from '@hc/sdk';
import { PTransition } from 'vue3-pixi';
import { Container } from 'pixi.js';

const { entity } = defineProps<{
  entity: Entity;
}>();

const { gameSession, assets, state, mapRotation, fx } = useGame();
const { hoveredCell, layers } = useGameUi();

const spritesheet = assets.getSpritesheet(entity.unit.spriteId, 'placeholder-unit');
const textures = createSpritesheetFrameObject('idle', spritesheet);

const isSummoned = ref(entity.kind === 'GENERAL');

const scaleX = computed(() => {
  let value = entity.playerId === state.value.players[0].id ? 1 : -1;
  console.log(value);
  if (mapRotation.value === 90 || mapRotation.value === 180) {
    value *= -1;
  }

  return value;
});

const isoPositionOffset = computed(() => {
  return {
    x: 0,
    z: 0,
    y: gameSession.map.getCellAt(entity.position.clone().round())?.isHalfTile
      ? -CELL_SIZE * 0.75
      : -CELL_SIZE
  };
});

const isHovered = computed(
  () =>
    !!hoveredCell.value &&
    gameSession.entityManager.getEntityAt(hoveredCell.value.position)?.id === entity.id
);

const zIndexOffset = computed(() => {
  if (gameSession.map.getCellAt(entity.position)?.isHalfTile) {
    return SPRITE_ZINDEX_OFFSETS.ENTITY + SPRITE_ZINDEX_OFFSETS.HALF_TILE;
  }
  return SPRITE_ZINDEX_OFFSETS.ENTITY;
});

const modifiersWithSprites = computed(() => entity.modifiers.filter(m => m.spriteId));

const SPRITE_OFFSET = -CELL_SIZE / 4;
</script>

<template>
  <IsoPositioner
    :animated="fx.isMoving.value"
    :x="entity.position.x"
    :y="entity.position.y"
    :z="entity.position.z"
    :z-index-offset="zIndexOffset"
    :offset="isoPositionOffset"
    :map="{ width: state.map.width, height: state.map.height, rotation: mapRotation }"
  >
    <UnitName :entity="entity" :is-hovered="isHovered" />

    <PTransition
      v-if="isSummoned"
      appear
      :duration="{ enter: 300, leave: 0 }"
      :before-enter="{ alpha: 0, y: 8 }"
      :enter="{ alpha: 1, y: SPRITE_OFFSET }"
    >
      <container :y="SPRITE_OFFSET" :sortable-children="true">
        <container :scale-x="scaleX">
          <Shadow v-if="textures?.length" :textures="textures" />
          <UnitModifier
            v-for="modifier in modifiersWithSprites"
            :key="`${modifier.id}:${modifier.source.id}`"
            :modifier="modifier"
            :entity="entity"
          />

          <UnitSprite :entity="entity" :textures="textures" />
        </container>

        <UnitStats
          v-if="layers.ui.value && layers.gameObjects.value"
          :entity="entity"
          :is-hovered="isHovered"
        />
      </container>
    </PTransition>

    <SummonBubble :entity="entity" @done="isSummoned = true" />
  </IsoPositioner>
</template>
