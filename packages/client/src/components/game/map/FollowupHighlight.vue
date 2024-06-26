<script setup lang="ts">
import type { Cell } from '@game/sdk';
import { match } from 'ts-pattern';

const { cell } = defineProps<{ cell: Cell }>();
const { session, assets, camera, ui, fx } = useGame();

const sheet = computed(() => assets.getSpritesheet('deploy-zone'));

const isMatch = (cellToTest: Cell) => {
  return match(ui.targetingMode.value)
    .with(
      TARGETING_MODES.BASIC,
      TARGETING_MODES.SUMMON,
      TARGETING_MODES.NONE,
      TARGETING_MODES.BLUEPRINT_FOLLOWUP,
      () => false
    )
    .with(TARGETING_MODES.FOLLOWUP, () => {
      if (!ui.selectedCard.value) return false;

      return (
        ui.selectedCard.value.blueprint.followup?.isTargetable(cellToTest, {
          session,
          summonedPoint: ui.summonTarget.value!,
          card: ui.selectedCard.value
        }) ?? false
      );
    })
    .with(TARGETING_MODES.SKILL, () => {
      if (!ui.selectedSkill.value) return false;

      return (
        ui.selectedSkill.value.blueprint.isTargetable(cellToTest, {
          session,
          castPoints: ui.skillTargets.value,
          skill: ui.selectedSkill.value
        }) ?? false
      );
    })
    .exhaustive();
};

const isEnabled = computed(() => !fx.isPlaying.value && isMatch(cell));

const bitmask = computed(() => {
  return getBitMask(session, cell, camera.angle.value, neighbor => {
    if (!neighbor) return false;

    return isMatch(neighbor);
  });
});
</script>

<template>
  <BitmaskCell :bitmask="bitmask" :is-enabled="isEnabled" :sheet="sheet" />
</template>
