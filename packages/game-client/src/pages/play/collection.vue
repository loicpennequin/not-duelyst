<script setup lang="ts">
import { UNITS, config, type UnitBlueprint } from '@hc/sdk';
import type { LoadoutDto } from '@hc/api/convex/loadout/loadout.mapper';
import type { Nullable } from '@hc/shared';

definePageMeta({
  name: 'Collection',
  pageTransition: {
    name: 'collection',
    mode: 'out-in'
  }
});

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
  maxSize: config.LOADOUT_MAX_SIZE,
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

const sortedLoadoutUnits = computed(() => {
  console.log(values.value?.unitIds);
  return [...(values.value?.unitIds ?? [])]
    .map(id => UNITS[id])
    .concat(general.value ? [general.value] : [])
    .sort((a, b) => {
      if (a.kind === 'GENERAL') return -1;
      if (b.kind === 'GENERAL') return 1;
      return a.summonCost - b.summonCost;
    });
});
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
        <LoadoutForm
          v-if="values"
          v-bind="values"
          :is-saving="isSaving"
          @back="sidebarView = 'list'"
          @save="save"
          @toggle-unit="toggleLoadoutCard($event)"
        />
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
</style>
