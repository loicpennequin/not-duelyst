<script setup lang="ts">
import { api } from '@hc/api';
import type { LoadoutDto } from '@hc/api/convex/loadout/loadout.mapper';
import type { GameMapDto } from '@hc/api/convex/gameMap/gameMap.mapper';
import { type SerializedGameState } from '@hc/sdk';
import type { Nullable } from '@hc/shared';
import { parse } from 'zipson';

definePageMeta({
  name: 'Sandbox',
  pageTransition: {
    name: 'sandbox',
    mode: 'out-in'
  }
});

const { data: maps, isLoading: isMapsLoading } = useConvexQuery(api.gameMaps.getAll, {});
const { data: loadouts, isLoading: isLoadoutsLoading } = useConvexAuthedQuery(
  api.loadout.myLoadouts,
  {}
);

const isLoading = computed(() => isMapsLoading.value || isLoadoutsLoading.value);

const form = reactive<{
  map: Nullable<GameMapDto>;
  player1Loadout: Nullable<LoadoutDto>;
  player2Loadout: Nullable<LoadoutDto>;
}>({
  map: null,
  player1Loadout: null,
  player2Loadout: null
});

const isReady = ref(false);
const createGameState = (): Promise<SerializedGameState> => {
  return Promise.resolve({
    activePlayerId: 'Player1',
    history: [],
    entities: [],
    turn: 0,
    players: [
      {
        gold: 2,
        id: 'Player1',
        name: 'Player1',
        loadout: {
          units: Object.fromEntries(
            form.player1Loadout!.unitIds.map(unit => [unit, { cooldown: 0 }])
          )
        },
        generalId: form.player1Loadout!.generalId
      },
      {
        gold: 2,
        id: 'Player2',
        name: 'Player2',
        loadout: {
          units: Object.fromEntries(
            form.player2Loadout!.unitIds.map(unit => [unit, { cooldown: 0 }])
          )
        },
        generalId: form.player2Loadout!.generalId
      }
    ],
    map: {
      ...form.map!,
      cells: parse(form.map!.cells),
      startPositions: [form.map!.startPositions[0], form.map!.startPositions[1]]
    }
  });
};
</script>

<template>
  <div class="overflow-hidden">
    <section v-if="!isReady" class="container mt-10">
      <header>
        <BackButton class="inline-flex" :to="{ name: 'SelectGameMode' }" />
        <h1 class="text-5">Create sandbox game</h1>
      </header>

      <div v-if="isLoading">Loading...</div>
      <form v-else @submit.prevent="isReady = true">
        <fieldset class="fancy-surface">
          <legend>Map</legend>

          <label
            v-for="map in maps"
            :key="map.id"
            class="cursor-pointer"
            :style="{ '--bg': `url('/assets/maps/${map.name}.png')` }"
          >
            <input
              v-model="form.map"
              type="radio"
              :value="map"
              class="sr-only"
              name="map"
            />
            {{ map.name }}
          </label>
        </fieldset>
        <div class="grid grid-cols-2 gap-2">
          <fieldset class="fancy-surface player-loadout">
            <legend>Player 1 loadout</legend>
            <div>
              <label
                v-for="loadout in loadouts"
                :key="loadout._id"
                class="cursor-pointer"
              >
                <LoadoutCard :loadout="loadout" />
                <input
                  v-model="form.player1Loadout"
                  name="playr-1-loadout"
                  type="radio"
                  :value="loadout"
                  class="sr-only"
                />
              </label>
            </div>
          </fieldset>
          <fieldset class="fancy-surface player-loadout">
            <legend>Player 2 loadout</legend>
            <div>
              <label v-for="loadout in loadouts" :key="loadout._id">
                <LoadoutCard :loadout="loadout" />
                <input
                  v-model="form.player2Loadout"
                  name="playr-2-loadout"
                  type="radio"
                  :value="loadout"
                  class="sr-only"
                />
              </label>
            </div>
          </fieldset>
        </div>

        <Transition>
          <UiFancyButton
            v-if="form.map && form.player1Loadout && form.player2Loadout"
            class="primary-button start-button"
          >
            Start
          </UiFancyButton>
        </Transition>
      </form>
    </section>

    <ClientOnly v-else>
      <SandboxGame :initial-state-factory="createGameState" />
      <template #fallback>
        <div />
      </template>
    </ClientOnly>
  </div>
</template>

<style lang="postcss">
.sandbox-enter-active,
.sandbox-leave.active {
  transition: all 0.3s;

  .player-loadout {
    transition: all 0.3s;
    transition-timing-function: var(--ease-out-2);
  }
}

.sandbox-enter-from,
.sandbox-leave-to {
  transform: translateY(-1.5rem);
  opacity: 0;

  .player-loadout {
    &:first-of-type {
      transform: translateX(-25%);
      opacity: 0;
    }
    &:last-of-type {
      transform: translateX(25%);
      opacity: 0;
      filter: sepia(100%);
    }
  }
}
</style>

<style scoped lang="postcss">
header {
  padding-block: var(--size-6);
  text-shadow: black 0px 4px 1px;
}

fieldset {
  padding: var(--size-4);
  border: var(--fancy-border);
  > div {
    display: flex;
    flex-direction: column;
    gap: var(--size-2);
  }

  > legend {
    font-size: var(--font-size-3);
    color: var(--primary);
  }
}

form {
  padding-block-end: var(--size-5);

  & > fieldset {
    display: flex;
    flex-wrap: wrap;
    gap: var(--size-3);
  }

  & > button {
    --ui-button-size: var(--font-size-4);

    width: var(--size-12);
    margin-block-start: var(--size-4);
    margin-inline: auto;
  }

  & > fieldset > label {
    display: block;

    width: var(--size-12);
    height: var(--size-11);
    padding: var(--size-1) var(--size-2);

    background: linear-gradient(black, transparent), var(--bg);
    background-size: cover;
    border: var(--fancy-border);
  }
}

label {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  &:hover,
  &:focus-within {
    transform: scale(1.02);
    filter: brightness(120%);
    box-shadow: var(--shadow-3);
  }

  &:has(input:checked) {
    filter: brightness(125%);
    outline: solid var(--border-size-2) var(--primary);
    outline-offset: var(--size-1);
  }
}

.start-button {
  &:is(.v-enter-active, .v-leave-active) {
    transition: all 0.3s;
  }

  &:is(.v-enter-from, .v-leave-to) {
    transform: translateY(var(--size-4));
    opacity: 0;
  }
}
</style>
