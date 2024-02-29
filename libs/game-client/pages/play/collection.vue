<script setup lang="ts">
import { UNITS, type UnitBlueprint } from '@hc/sdk';
import type { LoadoutDto } from '@hc/api/convex/loadout/loadout.mapper';
import type { Nullable } from '@hc/shared';

definePageMeta({
  name: 'Collection',
  pageTransition: {
    name: 'collection',
    mode: 'out-in'
  }
});

const LOADOUT_MAX_SIZE = 6;

const sidebarView = ref<'list' | 'form'>('list');
const {
  values,
  general,
  initEmpty,
  initFromLoadout,
  canAddUnit,
  isInLoadout,
  toggleUnit,
  save,
  isSaving
} = useLoadoutForm({
  defaultName: computed(() => `My New Loadout ${loadouts.value.length || ''}`),
  maxSize: LOADOUT_MAX_SIZE,
  onSuccess() {
    sidebarView.value = 'list';
  }
});

const {
  factionFilter,
  displayedUnits,
  loadouts,
  isLoadoutsLoading,
  isCollectionLoading
} = useCollection();

const sortedLoadoutUnits = computed(() =>
  [...(values.value?.unitIds ?? [])]
    .map(id => UNITS[id])
    .concat(general.value ? [general.value] : [])
    .sort((a, b) => {
      if (a.kind === 'GENERAL') return -1;
      if (b.kind === 'GENERAL') return 1;
      return a.summonCost - b.summonCost;
    })
);

const toggleLoadoutCard = (unit: UnitBlueprint) => {
  if (sidebarView.value === 'list') return;
  toggleUnit(unit);
};

const canAddToLoadout = (unitId: string) => {
  if (sidebarView.value === 'list') return false;
  return canAddUnit(unitId);
};

const loadoutToDelete = ref<Nullable<LoadoutDto>>(null);

const editLoadout = (loadout: LoadoutDto) => {
  initFromLoadout(loadout);
  sidebarView.value = 'form';
};
</script>

<template>
  <div v-if="isCollectionLoading || isLoadoutsLoading" class="loader">
    Loading collection page...
  </div>

  <div v-else class="collection-page">
    <CollectionDeleteModal v-model:loadout="loadoutToDelete" />
    <CollectionHeader v-model:filter="factionFilter" />

    <section class="card-list fancy-scrollbar">
      <CollectionCard
        v-for="item in displayedUnits"
        :key="item._id"
        :card="item"
        :is-in-loadout="!!isInLoadout(item.unitId)"
        :is-editing-loadout="sidebarView === 'form'"
        :can-add-to-loadout="canAddToLoadout(item.unitId)"
        @click="toggleLoadoutCard(item.unit)"
      />
    </section>

    <section class="sidebar">
      <template v-if="sidebarView === 'form'">
        <form @submit.prevent="save">
          <header>
            <input v-model="values!.name" class="py-3 flex-1" contenteditable />
            {{ values?.unitIds.size }} / {{ LOADOUT_MAX_SIZE }}
          </header>

          <ul v-if="values" v-auto-animate class="flex-1">
            <li v-for="unit in sortedLoadoutUnits" :key="unit.id">
              <div v-if="unit.kind === 'SOLDIER'" class="cost">
                {{ unit.summonCost }}
              </div>

              <img :src="`/assets/units/${unit.spriteId}-icon.png`" />
              <div class="flex gap-2">
                <img
                  v-for="(_, index) in 3"
                  :key="index"
                  :src="`/assets/ui/rune-${
                    unit.factions[index]?.id.toLocaleLowerCase() ?? 'empty'
                  }.png`"
                  class="faction-rune"
                />
              </div>
              {{ unit.id }}

              <UiIconButton
                name="mdi:minus"
                aria-label="remove from loadout"
                class="error-button"
                type="button"
                @click="toggleLoadoutCard(unit)"
              />
            </li>
          </ul>

          <footer>
            <UiButton
              class="ghost-button"
              left-icon="mdi:undo"
              type="button"
              :is-loading="isSaving"
              @click="sidebarView = 'list'"
            >
              Back
            </UiButton>
            <UiFancyButton :is-loading="isSaving">Save</UiFancyButton>
          </footer>
        </form>
      </template>

      <template v-else>
        <ul v-if="loadouts" v-auto-animate>
          <li v-for="loadout in loadouts" :key="loadout._id" class="m-2 relative">
            <LoadoutCard
              :loadout="loadout"
              tabindex="0"
              @click="editLoadout(loadout)"
              @keydown.enter="editLoadout(loadout)"
            />

            <div class="delete-loadout">
              <UiIconButton
                name="material-symbols:delete-outline"
                class="error-button"
                :style="{
                  '--ui-icon-button-size': 'var(--font-size-4)',
                  '--ui-icon-button-radius': '0'
                }"
                @click="loadoutToDelete = loadout"
              />
            </div>
          </li>
        </ul>

        <p v-if="!loadouts.length" class="py-3 text-center">
          You don't have any loadout yet
        </p>

        <UiFancyButton
          class="primary-button mx-auto"
          left-icon="material-symbols:add"
          @click="
            () => {
              initEmpty();
              sidebarView = 'form';
            }
          "
        >
          Create new Loadout
        </UiFancyButton>
      </template>
    </section>
  </div>
</template>

<style lang="postcss">
.collection-enter-active,
.collection-leave-active {
  transition: all 0.4s;
}
.collection-enter-from,
.collection-leave-to {
  opacity: 0;
  filter: blur(5px);

  .sidebar {
    transform: translateX(100%);
  }
}
</style>

<style scoped lang="postcss">
.collection-page {
  overflow-x: hidden;
  display: grid;
  grid-template-columns: 1fr var(--size-xs);
  grid-template-rows: auto 1fr auto;

  height: 100vh;

  backdrop-filter: blur(5px);

  > .loader {
    grid-column: 1 / -1;
  }
}

.loader {
  display: grid;
  place-content: center;
}
.card-list {
  scroll-snap-type: y mandatory;

  overflow-x: hidden;
  overflow-y: auto;
  display: grid;
  grid-auto-rows: calc(50% - 2 * var(--size-2));
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  row-gap: var(--size-6);
  column-gap: var(--size-4);
  justify-items: center;

  padding-block-start: var(--size-3);
  padding-inline: var(--size-4);

  border-radius: var(--radius-2);

  > * {
    scroll-margin-block-start: var(--size-4);
    scroll-snap-align: start;
  }
}

.loadout {
  position: relative;

  width: 100%;
  padding: 0;

  text-align: left;

  transition: 0.3s;
}

.sidebar {
  will-change: transform;

  grid-column: 2;
  grid-row: 1 / -1;

  background: var(--fancy-bg);
  background-blend-mode: overlay;
  border-left: var(--fancy-border);

  transition: transform 0.7s;
  transition-delay: 0.3s;
  transition-timing-function: var(--ease-bounce-1);

  footer {
    display: flex;
    gap: var(--size-3);
    justify-content: flex-end;
    padding-block: var(--size-3);
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

form {
  display: flex;
  flex-direction: column;

  height: 100%;
  padding-top: var(--size-5);
  padding-right: var(--size-3);
  padding-left: var(--size-3);

  > header {
    display: flex;
    gap: var(--size-3);
    align-items: center;
    justify-content: space-between;
  }

  li {
    display: flex;
    gap: var(--size-2);
    align-items: center;

    padding-block: var(--size-2);

    border-bottom: solid var(--border-size-1) var(--border-dimmed);
    > img {
      overflow: hidden;

      aspect-ratio: 1;
      width: 32px;

      border: solid var(--border-size-1) var(--primary);
      border-radius: var(--radius-round);
    }

    > button {
      margin-left: auto;
      padding: var(--size-1);

      font-size: var(--font-size-0);

      border-radius: var(--radius-round);
      box-shadow: inset 0 0 3px 4px rgba(0, 0, 0, 0.35);
    }
  }
}

.delete-loadout {
  position: absolute;
  top: 0;
  right: 0;

  display: grid;
  align-items: flex-end;

  height: 100%;
  padding: 2px;

  > button {
    border-top: var(--fancy-border);
    border-left: var(--fancy-border);
    border-top-left-radius: var(--radius-3);
    box-shadow: inset 0 0 3px 4px rgba(0, 0, 0, 0.35);

    transition: transform 0.2s;

    &:hover {
      transform: translateY(2px);
    }
  }
}

.faction-rune {
  width: 18px;
  height: 20px;
  image-rendering: pixelated;
}
</style>
