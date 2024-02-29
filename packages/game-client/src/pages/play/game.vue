<script setup lang="ts">
import { api } from '@hc/api';
import { GameSession } from '@hc/sdk';
definePageMeta({
  name: 'Game'
});

const route = useRoute();

const { data: game, isLoading: isGameLoading } = useConvexAuthedQuery(
  api.games.getCurrent,
  {}
);
const { data: me, isLoading: isMeLoading } = useConvexAuthedQuery(api.users.me, {});

const gameSession = shallowRef<{
  session: GameSession;
  dispatch: (
    type: Parameters<GameSession['dispatchPlayerInput']>[0]['type'],
    payload: any
  ) => void;
}>();

const timeRemainingForTurn = ref(0);
const isCreatingRoom = ref(true);

const { connect, error } = useGameSocket(
  route.query.roomId as string,
  () => game.value?._id,
  { spectator: false }
);
onMounted(async () => {
  const socket = await connect();
  isCreatingRoom.value = false;

  socket?.on('game:init', (serializedState: any) => {
    if (gameSession.value) return;
    const session = GameSession.createClientSession(serializedState);

    session.onReady(() => {
      gameSession.value = {
        session,
        dispatch(type, payload) {
          socket.emit('game:input', { type, payload });
        }
      };
    });

    socket.on('game:action', (arg: any) => {
      gameSession.value?.session.dispatchAction(arg);
      if (arg.type === 'END_TURN') {
        timeRemainingForTurn.value = 0;
      }
    });

    socket.on('time-remaining', time => {
      timeRemainingForTurn.value = time;
    });
  });
});

const isLoading = computed(() => isMeLoading.value || isGameLoading.value);

const canSeeGame = computed(() => {
  if (isLoading.value) return true;

  return game.value?.players.some(p => p._id === me.value?._id);
});
</script>

<template>
  <div>
    <ClientOnly>
      <div v-if="isLoading" class="full-page">Loading...</div>

      <div v-if="!canSeeGame" class="full-page">
        You are not authorized to see this game
        <NuxtLink :to="{ name: 'ClientHome' }">Back to home</NuxtLink>
      </div>

      <div v-else-if="isCreatingRoom" class="full-page">Creating game room...</div>

      <div v-else-if="error || game?.status === 'CANCELLED'" class="full-page">
        An error has occured while creating the room.
        <div>
          TODO: Clean up game so users don't get stuck forever in a broken game 🤡
        </div>

        <code>{{ error }}</code>
      </div>

      <div v-else-if="game?.status === 'WAITING_FOR_PLAYERS'" class="full-page">
        Waiting for opponent to connect...
      </div>

      <div v-else-if="game?.status === 'FINISHED'" class="full-page">
        This game is already finished. (TODO: Add end game screen)
        <NuxtLink :to="{ name: 'ClientHome' }">Back to home</NuxtLink>
      </div>

      <template v-else-if="gameSession && me">
        <GameView
          :game-session="gameSession.session"
          :player-id="me._id"
          @move="gameSession.dispatch('MOVE', $event)"
          @end-turn="gameSession.dispatch('END_TURN', {})"
          @use-skill="gameSession.dispatch('USE_SKILL', $event)"
          @summon="gameSession.dispatch('SUMMON', $event)"
          @surrender="gameSession.dispatch('SURRENDER', {})"
        />

        <div v-if="timeRemainingForTurn" class="remaining" />
      </template>

      <template #fallback>Loading...</template>
    </ClientOnly>
  </div>
</template>

<style scoped lang="postcss">
@keyframes remaining-time {
  from {
    transform: scaleX(1);
    background-color: var(--red-4);
  }
  to {
    transform: scaleX(0);
    background-color: var(--red-7);
  }
}

.full-page {
  display: grid;
  place-content: center;
  height: 100dvh;
  font-size: var(--font-size-5);
}
.remaining {
  position: fixed;
  z-index: 1;
  bottom: 0;
  left: 0;

  width: 100%;
  height: var(--size-2);

  background-color: var(--red-7);

  animation: remaining-time;
  animation-duration: calc(v-bind(timeRemainingForTurn) * 1ms);
}
</style>
