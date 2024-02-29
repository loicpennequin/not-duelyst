<script setup lang="ts">
import { api } from '@hc/api';
import type { Id } from '@hc/api/convex/_generated/dataModel';
import { GameSession } from '@hc/sdk';

definePageMeta({
  name: 'WatchGame'
});

const route = useRoute();

const { data: game, isLoading: isGameLoading } = useConvexQuery(
  api.games.getById,
  { gameId: route.params.id as Id<'games'> },
  {}
);
const gameSession = shallowRef<GameSession>();

const { connect, error } = useGameSocket(
  route.query.roomId as string,
  () => game.value?._id,
  { spectator: true }
);

onMounted(async () => {
  const socket = await connect();

  socket?.on('game:init', (serializedState: any) => {
    if (gameSession.value) return;
    const session = GameSession.createClientSession(serializedState);

    session.onReady(() => {
      gameSession.value = session;
    });

    socket.on('game:action', (arg: any) => {
      gameSession.value?.dispatchAction(arg);
    });
  });
});
</script>

<template>
  <div>
    <ClientOnly>
      <div v-if="isGameLoading">Loading...</div>

      <div v-else-if="error">{{ error }}</div>
      <div v-else-if="game?.status === 'WAITING_FOR_PLAYERS'">
        Waiting for opponent...
      </div>
      <div v-else-if="game?.status === 'CANCELLED'">
        The game has been cancelled
        <NuxtLink :to="{ name: 'ClientHome' }">Back to home</NuxtLink>
      </div>
      <div v-else-if="game?.status === 'FINISHED'">
        This game is already finished.
        <NuxtLink :to="{ name: 'ClientHome' }">Back to home</NuxtLink>
      </div>

      <GameView v-else-if="gameSession" :game-session="gameSession" :player-id="null" />
      <template #fallback>Loading...</template>
    </ClientOnly>
  </div>
</template>
