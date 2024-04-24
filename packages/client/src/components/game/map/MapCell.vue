<script setup lang="ts">
import type { CellId } from '@game/sdk/src/board/cell';
import type { FederatedPointerEvent } from 'pixi.js';
import { match } from 'ts-pattern';
import {
  DEFAULT_MOUSE_LIGHT_COLOR,
  DEFAULT_MOUSE_LIGHT_STRENGTH
} from '@/composables/useGameUi';

const { cellId } = defineProps<{ cellId: CellId }>();

const { assets, camera, ui, dispatch, pathfinding, fx, session } = useGame();
const cell = useGameSelector(session => session.boardSystem.getCellAt(cellId)!);
const activePlayer = useGameSelector(session => session.playerSystem.activePlayer);

const tileDiffuseTexture = computed(() => {
  if (!cell.value.tile) return null;
  const sheet = assets.getSpritesheet(cell.value.tile.blueprint.spriteId);
  return createSpritesheetFrameObject('idle', sheet);
});
const tileNormalTextures = computed(() => {
  if (!cell.value.tile) return null;
  const sheet = assets.getSpritesheet(cell.value.tile.blueprint.spriteId);
  return createSpritesheetFrameObject('idle', sheet);
});

const boardDimensions = useGameSelector(session => ({
  width: session.boardSystem.width,
  height: session.boardSystem.height
}));

const isHovered = computed(() => ui.hoveredCell.value?.equals(cell.value));

const isFollowupTargetable = computed(() => {
  if (!ui.selectedCard.value) return false;
  return ui.selectedCard.value.blueprint.followup?.isTargetable(cell.value, {
    session,
    summonedPoint: ui.summonTarget.value!,
    card: ui.selectedCard.value!
  });
});

const isSkillTargetable = computed(() => {
  if (!ui.selectedSkill.value) return false;
  return ui.selectedSkill.value.blueprint.isTargetable(cell.value, {
    session,
    castPoints: ui.skillTargets.value,
    skill: ui.selectedSkill.value
  });
});

const move = () => {
  if (pathfinding.canMoveTo(ui.selectedEntity.value!, cell.value)) {
    dispatch('move', {
      entityId: ui.selectedEntity.value!.id,
      position: cell.value.position
    });
  }
};

const attack = () => {
  if (!cell.value.entity) return;

  if (cell.value.entity.player.equals(activePlayer.value)) {
    ui.selectEntity(cell.value.entity.id);
  } else if (ui.selectedEntity.value!.canAttack(cell.value.entity)) {
    dispatch('attack', {
      targetId: cell.value.entity.id,
      entityId: ui.selectedEntity.value!.id
    });
  }
};

const summon = () => {
  if (!ui.selectedCard.value?.canPlayAt(cell.value.position)) return;
  if (ui.selectedCard.value.blueprint.followup) {
    ui.summonTarget.value = cell.value.position;
    ui.switchTargetingMode(TARGETING_MODES.FOLLOWUP);
  } else {
    dispatch('playCard', {
      cardIndex: ui.selectedCardIndex.value!,
      position: cell.value.position,
      targets: []
    });
    ui.unselectCard();
  }
};
</script>

<template>
  <IsoPositioner
    :animated="!fx.isPlaying.value"
    v-bind="cell.position"
    :angle="camera.angle.value"
    :height="boardDimensions.height"
    :width="boardDimensions.width"
  >
    <container>
      <container
        @pointerenter="
          () => {
            ui.hoverAt(cell.position);
            match(ui.targetingMode.value)
              .with(TARGETING_MODES.SUMMON, TARGETING_MODES.NONE, () => {})
              .with(TARGETING_MODES.BASIC, () => {
                if (
                  ui.selectedEntity.value &&
                  ui.hoveredCell.value?.equals(cell) &&
                  ui.hoveredEntity.value?.isEnemy(ui.selectedEntity.value.id) &&
                  ui.selectedEntity.value.canAttack(ui.hoveredEntity.value) &&
                  ui.targetingMode.value === TARGETING_MODES.BASIC
                ) {
                  ui.mouseLightColor.value = '#ff0000';
                  ui.mouseLightStrength.value = 8;
                }
              })
              .with(TARGETING_MODES.FOLLOWUP, () => {
                if (!cell.entity) return;
                if (!ui.selectedCard.value) return;
                if (isFollowupTargetable) {
                  ui.mouseLightStrength.value = 8;
                  ui.mouseLightColor.value = cell.entity?.player.equals(activePlayer)
                    ? '#77ff77'
                    : '#ff7777';
                }
              })
              .with(TARGETING_MODES.SKILL, () => {
                if (!cell.entity) return;
                if (!ui.selectedCard.value) return;
                if (isSkillTargetable) {
                  ui.mouseLightStrength.value = 8;
                  ui.mouseLightColor.value = cell.entity?.player.equals(activePlayer)
                    ? '#77ff77'
                    : '#ff7777';
                }
              })
              .exhaustive();
          }
        "
        @pointerleave="
          () => {
            ui.unhover();
            ui.mouseLightColor.value = DEFAULT_MOUSE_LIGHT_COLOR;
            ui.mouseLightStrength.value = DEFAULT_MOUSE_LIGHT_STRENGTH;
          }
        "
        @pointerup="
          (event: FederatedPointerEvent) => {
            if (event.button !== 0) {
              ui.unselectEntity();
              ui.unselectCard();
              return;
            }

            match(ui.targetingMode.value)
              .with(TARGETING_MODES.BASIC, () => {
                if (cell.entity) {
                  attack();
                } else {
                  move();
                }
              })
              .with(TARGETING_MODES.SUMMON, () => {
                summon();
              })
              .with(TARGETING_MODES.FOLLOWUP, () => {
                if (!ui.selectedCard.value) return;
                if (isFollowupTargetable) {
                  ui.followupTargets.value.push(cell.position);
                }
              })
              .with(TARGETING_MODES.SKILL, () => {
                if (!ui.selectedSkill.value) return;
                if (isSkillTargetable) {
                  ui.skillTargets.value.push(cell.position);
                }
              })
              .with(TARGETING_MODES.NONE, () => {
                if (cell.entity?.player.equals(activePlayer)) {
                  ui.selectEntity(cell.entity.id);
                }
              })
              .exhaustive();
          }
        "
      >
        <MapCellSprite :cell-id="cellId" />
      </container>
      <MapCellHighlights :cell="cell" />

      <HoveredCell v-if="isHovered" />
    </container>
  </IsoPositioner>

  <IsoPositioner
    :animated="!fx.isPlaying.value"
    v-bind="cell.position"
    :angle="camera.angle.value"
    :height="boardDimensions.height"
    :width="boardDimensions.width"
    :z-index-offset="1"
  >
    <container
      v-if="cell.tile && tileDiffuseTexture && tileNormalTextures"
      :y="-CELL_HEIGHT * 0.4"
      event-mode="none"
    >
      <PointLight
        v-if="cell.tile.blueprint.lightColor"
        :color="cell.tile.blueprint.lightColor"
        :brightness="0.5"
        :x="0"
        :y="0"
      />

      <IlluminatedSprite
        :diffuse-textures="tileDiffuseTexture"
        :normal-textures="tileNormalTextures"
        :anchor="0.5"
        playing
        loop
      />
    </container>
  </IsoPositioner>
</template>