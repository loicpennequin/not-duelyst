<script setup lang="ts">
import { api } from '@hc/api';
import type { Id } from '@hc/api/convex/_generated/dataModel';
import { UNITS } from '@hc/sdk';

definePageMeta({
  name: 'Matchmaking'
});

const { count, inc, reset } = useCounter();

const {
  pause,
  resume,
  isActive: isInMatchmaking
} = useIntervalFn(
  () => {
    inc();
  },
  1000,
  { immediate: false }
);

const { mutate: join } = useConvexAuthedMutation(api.matchmaking.join, {
  onSuccess() {
    reset();
    resume();
  },
  onError(err) {
    console.error(err);
  }
});
const { mutate: leave } = useConvexAuthedMutation(api.matchmaking.leave, {
  onSuccess() {
    pause();
    reset();
  },
  onError(err) {
    console.error(err);
  }
});

const dayjs = useDayjs();
const duration = computed(() => {
  // @ts-expect-error
  return dayjs.duration(count.value * 1000).format('mm:ss');
});

const { data: loadouts, isLoading: isLoadingLoadouts } = useConvexAuthedQuery(
  api.loadout.myLoadouts,
  {}
);
const selectedLoadoutId = ref<Id<'loadouts'>>();

const getGeneralImage = (generalId: string) => {
  const unit = UNITS[generalId];
  return `/assets/units/${unit.spriteId}-icon.png`;
};
</script>

<template>
  <div class="page container">
    <header>
      <BackButton class="inline-flex" :to="{ name: 'SelectGameMode' }" />
      <h1 class="text-5">Ranked Game</h1>
    </header>

    <h2 class="text-3">Select your loadout</h2>
    <div v-if="isLoadingLoadouts">Loading...</div>
    <div class="loadouts">
      <label v-for="loadout in loadouts" :key="loadout._id">
        <LoadoutCard :loadout="loadout"></LoadoutCard>

        <input
          v-model="selectedLoadoutId"
          :disabled="isInMatchmaking"
          type="radio"
          :value="loadout._id"
          class="sr-only"
        />
      </label>
    </div>

    <footer class="flex gap-3 items-center">
      <UiButton v-if="isInMatchmaking" class="error-button" @click="leave({})">
        Leave
      </UiButton>
      <UiButton
        v-else
        :disabled="!selectedLoadoutId"
        class="primary-button"
        @click="join({ loadoutId: selectedLoadoutId! })"
      >
        Join
      </UiButton>
      <div v-if="isInMatchmaking">Searching for opponent...{{ duration }}</div>
    </footer>
  </div>
</template>

<style scoped lang="postcss">
.page {
  height: 100vh;

  > header {
    padding-block: var(--size-6);
    text-shadow: black 0px 4px 1px;
  }

  > footer > button {
    --ui-button-size: var(--font-size-3);

    min-width: var(--size-12);
  }

  > footer > div {
    font-size: var(--font-size-5);
    text-shadow: black 0px 4px 1px;
  }
}

.loadouts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--size-3);
  margin-block: var(--size-4);

  > label {
    cursor: pointer;

    &:has(input:checked) {
      filter: brightness(120%);
      outline: solid var(--border-size-2) var(--primary);
    }

    &:has(input:disabled) {
      filter: grayscale(50%);
    }
  }
}
</style>
