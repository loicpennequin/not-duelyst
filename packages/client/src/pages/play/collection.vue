<script setup lang="ts">
import type { LoadoutDto } from '@game/api/src/convex/loadout/loadout.mapper';
import type { CardBlueprint } from '@game/sdk';
import type { Nullable } from '@game/shared';

definePageMeta({
  name: 'Collection',
  pageTransition: {
    name: 'collection',
    mode: 'out-in'
  }
});

const sidebarView = ref<'list' | 'form'>('list');
const {
  formValues,
  initEmpty,
  initFromLoadout,
  canAddCard,
  addCard,
  removeCard,
  save,
  isSaving
} = useLoadoutForm({
  defaultName: computed(() => `My New Loadout ${loadouts.value.length || ''}`),
  onSuccess() {
    sidebarView.value = 'list';
  }
});

const {
  factionFilter,
  displayedCards,
  loadouts,
  isLoadoutsLoading,
  isCollectionLoading
} = useCollection();

const addCardToLoadout = (card: CardBlueprint) => {
  if (sidebarView.value === 'list') return;
  addCard(card.id);
};

const removeCardFromLoadout = (card: CardBlueprint) => {
  if (sidebarView.value === 'list') return;
  removeCard(card.id);
};

const canAddToLoadout = (unitId: string) => {
  if (sidebarView.value === 'list') return false;
  return canAddCard(unitId);
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

    <section class="card-list fancy-scrollbar pb-5">
      <CollectionCard
        v-for="item in displayedCards"
        :key="item._id"
        :card="item"
        :is-editing-loadout="sidebarView === 'form'"
        :can-add-to-loadout="canAddToLoadout(item.cardId)"
        @click="addCardToLoadout(item.card)"
      />
    </section>
    <section class="sidebar">
      <template v-if="sidebarView === 'form'">
        <LoadoutForm
          v-if="formValues"
          v-model:name="formValues.name"
          :cards="formValues.cards"
          :is-saving="isSaving"
          @back="sidebarView = 'list'"
          @save="save"
          @remove="removeCardFromLoadout($event)"
          @set-pedestal="
            ({ id, pedestalId }) => {
              formValues!.cards.forEach(card => {
                if (card.id !== id) return;
                card.pedestalId = pedestalId;
              });
            }
          "
        />
      </template>

      <template v-else>
        <ul v-if="loadouts" v-auto-animate>
          <Sound
            v-for="loadout in loadouts"
            :key="loadout._id"
            sound="button-hover"
            :triggers="['mouseenter']"
          >
            <li class="m-2 relative">
              <CollectionLoadoutCard
                :loadout="loadout"
                @edit="editLoadout(loadout)"
                @delete="loadoutToDelete = loadout"
              />
            </li>
          </Sound>
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
  filter: blur(15px);

  /* .sidebar {
    transform: translateX(100%);
  } */
}
</style>

<style scoped lang="postcss">
.collection-page {
  overflow-x: hidden;
  display: grid;
  grid-template-columns: 1fr var(--size-xs);
  grid-template-rows: auto 1fr auto;

  height: 100vh;

  backdrop-filter: blur(5px) brightness(50%);
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
</style>
