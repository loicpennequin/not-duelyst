<script setup lang="ts">
import type { Entity } from '@hc/sdk';
import { PTransition, useApplication } from 'vue3-pixi';
import { Polygon, Container } from 'pixi.js';
import { OutlineFilter } from '@pixi/filter-outline';
import { GlowFilter } from '@pixi/filter-glow';
import { type AnimatedSprite, type Cursor, FederatedMouseEvent } from 'pixi.js';

const { entity } = defineProps<{
  entity: Entity;
}>();

const app = useApplication();
const settings = useUserSettings();
const { gameSession, assets, state, mapRotation, fx, utils, playerId } = useGame();
const {
  hoveredCell,
  skillTargets,
  selectedSkill,
  selectedEntity,
  targetMode,
  summonTargets,
  layers
} = useGameUi();

const spritesheet = assets.getSpritesheet(entity.unit.spriteId, 'placeholder-unit');
const textures = createSpritesheetFrameObject('idle', spritesheet);

const spriteRef = ref<AnimatedSprite>();
watchEffect(() => {
  fx.spriteMap.set(entity.id, spriteRef);
  spriteRef.value?.gotoAndPlay(0);
});

const scaleX = computed(() => {
  if (mapRotation.value === 90 || mapRotation.value === 180) {
    return entity.playerId === state.value.players[0].id ? -1 : 1;
  }

  return entity.playerId === state.value.players[0].id ? 1 : -1;
});

const offset = computed(() => {
  return {
    x: 0,
    z: 0,
    y: gameSession.map.getCellAt(entity.position.clone().round())?.isHalfTile
      ? -CELL_SIZE * 0.75
      : -CELL_SIZE
  };
});

const hitArea = computed(() => {
  const meta = spritesheet.data.meta as AsepriteMeta;

  // we need to offset the slice because the sprite has its anchor in the center
  const offset = {
    x: CELL_SIZE * 1.25,
    y: 0
  };

  // default hit area is a square the size of one cell
  const defaultHitArea = new Polygon(
    { x: -CELL_SIZE / 2, y: CELL_SIZE / 2 },
    { x: CELL_SIZE / 2, y: CELL_SIZE / 2 },
    { x: CELL_SIZE / 2, y: CELL_SIZE * 1.5 },
    { x: -CELL_SIZE / 2, y: CELL_SIZE * 1.5 }
  );

  if (!meta.slices) return defaultHitArea;

  const hitAreaSlice = meta.slices.find(slice => slice.name === 'hitArea');
  if (!hitAreaSlice) return defaultHitArea;

  const {
    bounds: { x, y, w, h }
  } = hitAreaSlice.keys[0];

  return new Polygon([
    { x: x - offset.x, y: y - offset.y },
    { x: x + w - offset.x, y: y - offset.y },
    { x: x + w - offset.x, y: y + h - offset.y },
    { x: x - offset.x, y: y + h - offset.y }
  ]);
});

const isHovered = computed(
  () =>
    hoveredCell.value &&
    gameSession.entityManager.getEntityAt(hoveredCell.value.position)?.id === entity.id
);

const selectedFilter = new OutlineFilter(1.5, 0xffffff, 0.2, 1);

const inSkillAreaFilter = new GlowFilter({
  outerStrength: 2,
  innerStrength: 1,
  color: 0xff0000,
  alpha: 0.75
});

const a11yColorcodeFilter = computed(() => {
  if (playerId) {
    return new OutlineFilter(2, entity.playerId === playerId ? 0x00ff00 : 0xff0000);
  } else {
    return new OutlineFilter(
      1.5,
      entity.playerId === state.value.activePlayer.id ? 0x00ff00 : 0xff0000
    );
  }
});
const filters = computed(() => {
  const result = [];

  if (settings.value.a11y.colorCodeUnits) {
    result.push(a11yColorcodeFilter.value);
  }
  if (selectedEntity.value?.equals(entity)) {
    result.push(selectedFilter);
  }

  if (
    hoveredCell.value &&
    selectedEntity.value &&
    utils.canCastSkillAt(hoveredCell.value) &&
    selectedSkill.value?.isInAreaOfEffect(
      gameSession,
      entity.position,
      selectedEntity.value,
      [...skillTargets.value, hoveredCell.value.position]
    )
  ) {
    result.push(inSkillAreaFilter);
  }

  entity.effects.forEach(effect => {
    if (effect.id in EFFECT_FILTERS) {
      result.push(...EFFECT_FILTERS[effect.id as keyof typeof EFFECT_FILTERS]);
    }
  });
  return result;
});

const cursor = computed(() => {
  if (utils.canCastSkillAt(entity.position)) {
    return app.value.renderer.events.cursorStyles.attack as Cursor;
  }
  return undefined;
});

const isSummoned = ref(entity.kind === 'GENERAL');

const zIndexOffset = computed(() => {
  if (gameSession.map.getCellAt(entity.position)?.isHalfTile) {
    return SPRITE_OFFSETS.ENTITY + SPRITE_OFFSETS.HALF_TILE;
  }
  return SPRITE_OFFSETS.ENTITY;
});
</script>

<template>
  <IsoPositioner
    :animated="fx.isMoving.value"
    :x="entity.position.x"
    :y="entity.position.y"
    :z="entity.position.z"
    :z-index-offset="zIndexOffset"
    :offset="offset"
    :map="{ width: state.map.width, height: state.map.height, rotation: mapRotation }"
  >
    <PTransition
      v-if="isSummoned"
      appear
      :duration="{ enter: 300, leave: 0 }"
      :before-enter="{ alpha: 0, y: 8 }"
      :enter="{ alpha: 1, y: -CELL_SIZE / 4 }"
    >
      <container :y="-CELL_SIZE / 4" :sortable-children="true">
        <Shadow v-if="textures?.length" :textures="textures" :scale-x="scaleX">
          <animated-sprite
            ref="spriteRef"
            :textures="textures"
            :anchor-x="0.5"
            :scale-x="scaleX"
            :hit-area="hitArea"
            :filters="filters"
            :cursor="cursor"
            :z-index="2"
            loop
            @pointerdown="
              (e: FederatedMouseEvent) => {
                if (e.button !== 0) return;
                if (targetMode) return;

                selectedEntity = entity;
                if (entity.player.equals(state.activePlayer)) targetMode = 'move';
              }
            "
            @pointerup="
              (e: FederatedMouseEvent) => {
                if (e.button !== 0) return;
                if (targetMode === 'move') targetMode = null;
                if (utils.canCastSkillAt(entity.position)) {
                  return skillTargets.add(entity.position);
                }
                if (utils.isValidSummonTarget(entity.position)) {
                  return summonTargets.add(entity.position);
                }
              }
            "
            @pointerenter="
              () => {
                hoveredCell = gameSession.map.getCellAt(entity.position);
              }
            "
          />
        </Shadow>

        <UnitStats
          v-if="layers.ui.value && layers.gameObjects.value"
          :entity="entity"
          :is-hovered="!!isHovered"
        />
      </container>
    </PTransition>

    <SummonBubble :entity="entity" @done="isSummoned = true" />
  </IsoPositioner>
</template>
