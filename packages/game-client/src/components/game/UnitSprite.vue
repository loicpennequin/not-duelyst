<script setup lang="ts">
import type { Entity } from '@hc/sdk';
import { isDefined } from '@hc/shared';
import { GlowFilter } from '@pixi/filter-glow';
import { OutlineFilter } from '@pixi/filter-outline';
import type { AnimatedSprite, Cursor, FederatedMouseEvent, FrameObject } from 'pixi.js';
import { useApplication } from 'vue3-pixi';

const { textures, entity } = defineProps<{
  textures: FrameObject[];
  entity: Entity;
}>();

const { gameSession, state, fx, utils, playerId } = useGame();
const {
  selectedEntity,
  hoveredCell,
  selectedSkill,
  skillTargets,
  targetMode,
  summonTargets
} = useGameUi();

const app = useApplication();

const settings = useUserSettings();

const hitArea = useHitArea(entity);

const modifierFilters = computed(() =>
  entity.modifiers
    .map(modifier => {
      if (modifier.id in MODIFIER_FILTERS) {
        return MODIFIER_FILTERS[modifier.id as keyof typeof MODIFIER_FILTERS]();
      } else {
        return null;
      }
    })
    .flat()
    .filter(isDefined)
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
  const result = [...modifierFilters.value];

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

  return result;
});

const cursor = computed(() => {
  if (utils.canCastSkillAt(entity.position)) {
    return app.value.renderer.events.cursorStyles.attack as Cursor;
  }
  return undefined;
});

const spriteRef = ref<AnimatedSprite>();
watchEffect(() => {
  fx.spriteMap.set(entity.id, spriteRef);
  spriteRef.value?.gotoAndPlay(0);
});
</script>

<template>
  <animated-sprite
    ref="spriteRef"
    :textures="textures"
    :anchor-x="0.5"
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
</template>
