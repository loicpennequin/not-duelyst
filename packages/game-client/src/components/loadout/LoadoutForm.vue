<script setup lang="ts">
import {
  config,
  UNITS,
  type FactionName,
  type UnitId,
  type UnitBlueprint
} from '@hc/sdk';
import type { Nullable } from '@hc/shared';

const { isSaving, unitIds, factions, generalId } = defineProps<{
  unitIds: Set<UnitId>;
  generalId: Nullable<UnitId>;
  factions: FactionName[];
  isSaving: boolean;
}>();

const emit = defineEmits<{
  save: [];
  toggleUnit: [UnitBlueprint];
  back: [];
}>();

const name = defineModel('name', { required: true });

const general = computed(() => (generalId ? UNITS[generalId] : null));

const sortedUnits = computed(() => {
  return [...unitIds]
    .map(id => UNITS[id])
    .concat(general.value ? [general.value] : [])
    .sort((a, b) => {
      if (a.kind === 'GENERAL') return -1;
      if (b.kind === 'GENERAL') return 1;
      return a.summonCost - b.summonCost;
    });
});
</script>

<template>
  <form @submit.prevent="emit('save')">
    <header>
      <input v-model="name" class="py-3 flex-1" />
      {{ unitIds.size }} / {{ config.LOADOUT_MAX_SIZE }}
    </header>

    <div class="flex gap-2 my-4">
      <img
        v-for="(_, index) in 3"
        :key="`${index}:${factions[index]}`"
        :src="`/assets/ui/rune-${factions[index]?.toLocaleLowerCase() ?? 'empty'}.png`"
        class="rune"
      />
    </div>

    <ul v-if="generalId || unitIds.size" v-auto-animate class="flex-1">
      <li v-for="unit in sortedUnits" :key="unit.id">
        <div v-if="unit.kind === 'SOLDIER'" class="cost">
          {{ unit.summonCost }}
        </div>

        <img :src="`/assets/units/${unit.spriteId}-icon.png`" />

        <img
          v-for="(_, index) in 3"
          :key="index"
          :src="`/assets/ui/rune-${
            unit.factions[index]?.id.toLocaleLowerCase() ?? 'empty'
          }.png`"
          class="rune"
        />

        <span>{{ unit.id }}</span>

        <UiIconButton
          name="mdi:minus"
          aria-label="remove from loadout"
          class="error-button"
          type="button"
          @click="emit('toggleUnit', unit)"
        />
      </li>
    </ul>

    <p v-else class="my-8 text-center">
      Click units on the left to add them to your deck.
    </p>

    <footer class="mt-auto">
      <UiButton
        class="ghost-button"
        left-icon="mdi:undo"
        type="button"
        :is-loading="isSaving"
        @click="emit('back')"
      >
        Back
      </UiButton>
      <UiFancyButton :is-loading="isSaving">Save</UiFancyButton>
    </footer>
  </form>
</template>

<style scoped lang="postcss">
form {
  display: flex;
  flex-direction: column;

  height: 100%;
  padding-top: var(--size-5);
  padding-right: var(--size-3);
  padding-left: var(--size-3);
}

header {
  display: flex;
  gap: var(--size-3);
  align-items: center;
  justify-content: space-between;
}

footer {
  display: flex;
  gap: var(--size-3);
  justify-content: flex-end;
  padding-block: var(--size-3);
}

li {
  display: flex;
  gap: var(--size-2);
  align-items: center;

  padding-block: var(--size-2);

  font-size: var(--font-size-3);

  border-bottom: solid var(--border-size-1) var(--border-dimmed);

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  > img {
    flex-shrink: 0;
  }
  > img:not(.rune) {
    overflow: hidden;

    aspect-ratio: 1;
    width: 48px;

    border: solid var(--border-size-1) var(--primary);
    border-radius: var(--radius-round);
  }

  > .rune {
    width: 18px;
    height: 20px;
  }

  > button {
    margin-left: auto;
    padding: var(--size-1);

    font-size: var(--font-size-0);

    border-radius: var(--radius-round);
    box-shadow: inset 0 0 3px 4px rgba(0, 0, 0, 0.35);
  }
}

.cost {
  display: grid;
  place-content: center;

  width: var(--size-6);
  height: var(--size-6);
  padding: var(--size-1);

  color: white;

  background-color: var(--blue-9);
  border-radius: var(--radius-round);
}

.rune {
  width: 24px;
  height: 28px;
  image-rendering: pixelated;
}
</style>
