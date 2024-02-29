<script setup lang="ts">
import { api } from '@hc/api';
import { UNITS } from '@hc/sdk';

definePageMeta({
  name: 'MyProfile'
});

const { data: me } = useConvexAuthedQuery(api.users.me, {});
const { data: gameHistory, isLoading: isLoadingHistory } = useConvexAuthedQuery(
  api.games.getMyGameHistory,
  {},
  { ssr: false }
);

const getOpponent = (game: (typeof gameHistory)['value'][number]) => {
  return game.players.find(p => p._id !== me.value?._id);
};

const getResult = (game: (typeof gameHistory)['value'][number]) =>
  getOpponent(game)?.gamePlayerId === game.winnerId ? 'loss' : 'win';

const getGeneralImage = (generalId: string) => {
  const unit = UNITS[generalId];
  return `/assets/units/${unit.spriteId}-icon.png`;
};
</script>

<template>
  <div v-if="!me">Loading profile...</div>

  <div v-else class="container">
    <header class="flex gap-5 items-center">
      <BackButton />
      <h1 class="text-5">{{ me.name }}</h1>
    </header>
    <h2 class="text-4 mb-5">Game History</h2>

    <div v-if="isLoadingHistory">Loading history...</div>
    <article v-for="game in gameHistory" :key="game._id">
      <div class="flex-1 flex gap-4 items-center">
        <div class="font-600 uppercase" :class="getResult(game)">
          {{ getResult(game) }}
        </div>

        <img :src="getGeneralImage(game.players[0].loadout!.generalId)" />
        {{ game.players[0].name }}

        <span class="mx-auto">VS</span>

        {{ game.players[1].name }}
        <img :src="getGeneralImage(game.players[1].loadout!.generalId)" />
      </div>

      <NuxtLink
        v-slot="{ href, navigate }"
        custom
        :to="{ name: 'Replay', params: { id: game._id } }"
      >
        <UiButton :href="href" class="primary-button" @click="navigate">
          Watch Replay
        </UiButton>
      </NuxtLink>
    </article>
  </div>
</template>

<style scoped lang="postcss">
header {
  display: flex;
  gap: var(--size-3);
  align-items: center;

  margin-bottom: var(--size-6);
  padding-top: var(--size-5);

  text-shadow: black 0px 4px 1px;
}

article {
  display: flex;
  gap: var(--size-8);
  align-items: center;

  padding: var(--size-3);

  font-size: var(--font-size-3);

  background-color: hsl(0 0% 0% / 0.3);
  backdrop-filter: blur(5px);
  border: var(--fancy-border);

  span {
    font-size: var(--font-size-5);
    font-weight: var(--font-weight-6);
  }

  img {
    overflow: hidden;
    border: var(--fancy-border);
    border-radius: var(--radius-round);
  }
}

.win {
  color: var(--green-5);
}

.loss {
  color: var(--red-8);
}
</style>
../../assets/units{m}
