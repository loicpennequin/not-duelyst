<script setup lang="ts">
import { api } from '@hc/api';
import { UNITS } from '@hc/sdk';

definePageMeta({
  name: 'WatchList'
});

const { data: games, isLoading } = useConvexAuthedQuery(api.games.getAllOngoing, {});

const getGeneralImage = (generalId: string) => {
  const unit = UNITS[generalId];
  return `/assets/units/${unit.spriteId}-icon.png`;
};
</script>

<template>
  <div v-if="isLoading">Loading games...</div>
  <div v-else-if="games" class="container">
    <header>
      <BackButton />
      <h1 class="text-5">Ongoing games</h1>
    </header>

    <p v-if="!games.length">
      There are no ongoing game at the moment. Check back later !
    </p>

    <article v-for="game in games" :key="game._id">
      <div class="flex-1 flex gap-4 items-center">
        <img :src="getGeneralImage(game.players[0].loadout!.generalId)" />
        {{ game.players[0].name }}

        <span class="mx-auto">VS</span>

        {{ game.players[1].name }}
        <img :src="getGeneralImage(game.players[1].loadout!.generalId)" />
      </div>
      <NuxtLink
        v-slot="{ navigate, href }"
        :to="{
          name: 'WatchGame',
          params: { id: game._id },
          query: { roomId: game.roomId }
        }"
        custom
      >
        <UiButton class="primary-button" :href="href" @click="navigate">Watch</UiButton>
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
</style>
../../../assets/units{m}
