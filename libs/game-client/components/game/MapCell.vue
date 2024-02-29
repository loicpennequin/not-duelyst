<script setup lang="ts">
import { Polygon, type Cursor, FederatedPointerEvent } from 'pixi.js';
import type { Cell } from '@hc/sdk';
import { ColorOverlayFilter } from '@pixi/filter-color-overlay';
import { useApplication } from 'vue3-pixi';
import { CELL_SIZE } from '../../utils/constants';

const { cell } = defineProps<{ cell: Cell }>();

const app = useApplication();
const { assets, state, sendInput, gameSession, mapRotation, utils, fx } = useGame();
const {
  hoveredCell,
  targetMode,
  selectedSummon,
  selectedEntity,
  summonSpawnPoint,
  summonTargets,
  skillTargets
} = useGameUi();

// map a Tile key to a simplified sprite used when a11y settings are toggled on
const TILE_TO_SIMPLIFIED_SPRITE = {
  ground: 'editor-ground',
  groundHalf: 'editor-ground-half',
  water: 'editor-water',
  waterHalf: 'editor-water-half',
  obstacle: 'editor-obstacle'
};

const settings = useUserSettings();

const spriteTextures = computed(() => {
  const getTextures = (spriteId: string) => {
    const sheet = assets.getSpritesheet(spriteId);
    return sheet.animations[Math.abs(mapRotation.value)] ?? sheet.animations[0];
  };

  if (settings.value.a11y.simplifiedMapTextures) {
    const spriteId =
      TILE_TO_SIMPLIFIED_SPRITE[cell.tile.id as keyof typeof TILE_TO_SIMPLIFIED_SPRITE];
    return [getTextures(spriteId)];
  }

  return cell.spriteIds.map(getTextures);
});

const hitArea = computed(() => {
  const STEP = CELL_SIZE / 4;
  const hitAreaYOffset = cell.isHalfTile ? STEP / 2 : 0;
  //prettier-ignore
  const p = new Polygon([
    { x: STEP * -2, y: STEP + hitAreaYOffset },
    { x: 0        , y: 0 + hitAreaYOffset },
    { x: STEP * 2 , y: STEP  + hitAreaYOffset },
    { x: STEP * 2 , y: STEP * 3 },
    { x: 0        , y: STEP * 4 },
    { x: STEP * -2, y: STEP * 3 }
  ]);

  return p;
});

const canMoveTo = computed(() => utils.canMoveTo(cell.position));
const canSummonAt = computed(() => utils.canSummonAt(cell.position));
const isValidSummonTarget = computed(() => utils.isValidSummonTarget(cell.position));
const canCastSkillAt = computed(() => utils.canCastSkillAt(cell.position));

const onPointerup = (event: FederatedPointerEvent) => {
  if (event.button !== 0) return;
  if (targetMode.value === null) {
    selectedEntity.value = null;
  }

  if (canMoveTo.value) {
    sendInput('move', {
      ...cell.position,
      entityId: selectedEntity.value!.id
    });
  } else if (canSummonAt.value) {
    summonSpawnPoint.value = cell.position;
    // if (selectedSummon.value!.onSummoned) {
    //   targetMode.value = 'summon-targets';
    // }
  } else if (isValidSummonTarget.value) {
    summonTargets.value.add(cell.position);
  } else if (canCastSkillAt.value) {
    if (skillTargets.value.has(cell.position)) return;
    skillTargets.value.add(cell.position);
  }
};

const pathFilter = new ColorOverlayFilter(0x4455bb, 0.5);
const summonTargetFilter = new ColorOverlayFilter(0xbb5577, 0.6);

const isMovePathHighlighted = computed(() => {
  if (!hoveredCell.value) return false;
  if (!selectedEntity.value) return false;
  if (targetMode.value !== 'move') return false;

  const entityOnCell = gameSession.entityManager.getEntityAt(cell);
  const hasAlly = entityOnCell?.playerId === selectedEntity.value.playerId;

  if (!canMoveTo.value && !hasAlly) return false;

  const path = gameSession.map.getPathTo(
    selectedEntity.value,
    hoveredCell.value.position,
    selectedEntity.value.remainingMovement
  );

  if (!path) return false;

  const isInPath = path.path.some(vec => vec.equals(cell.position));

  return isInPath || selectedEntity.value.id === entityOnCell?.id;
});

const cursor = computed(() => {
  if (canMoveTo.value) {
    return app.value.renderer.events.cursorStyles.move as Cursor;
  }
  if (canSummonAt.value) {
    return app.value.renderer.events.cursorStyles.summon as Cursor;
  }
  return undefined;
});

const filters = computed(() => {
  if (isMovePathHighlighted.value) return [pathFilter];
  if (isValidSummonTarget.value) return [summonTargetFilter];

  return [];
});
</script>

<template>
  <IsoPositioner
    :animated="fx.isMoving.value"
    :x="cell.position.x"
    :y="cell.position.y"
    :z="cell.position.z"
    :map="{ width: state.map.width, height: state.map.height, rotation: mapRotation }"
  >
    <container
      :hit-area="hitArea"
      :cursor="cursor"
      @pointerenter="hoveredCell = cell"
      @pointerleave="hoveredCell = null"
      @pointerup="onPointerup"
    >
      <container :filters="filters" :cursor="cursor" event-mode="none">
        <animated-sprite
          v-for="(textures, index) in spriteTextures"
          :key="index"
          :textures="textures"
          :cursor="cursor"
          :anchor="0.5"
          :y="CELL_SIZE / 2"
        />
      </container>

      <MapCellHighlight :cell="cell" :cursor="cursor" />
    </container>
    <HoveredCell :cell="cell" :cursor="cursor" />
  </IsoPositioner>
  <IsoPositioner
    :animated="false"
    :x="cell.position.x"
    :y="cell.position.y"
    :z="cell.position.z + 0.1"
    :map="{ width: state.map.width, height: state.map.height, rotation: mapRotation }"
  >
    <SummonPreview :cell="cell" />
  </IsoPositioner>
</template>
