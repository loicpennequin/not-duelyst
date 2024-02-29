<script setup lang="ts">
import { api } from '@hc/api';
import type { Id } from '@hc/api/convex/_generated/dataModel';
import {
  GameSession,
  type SerializedAction,
  type SerializedGameState,
  type ActionName
} from '@hc/sdk';
import type { PartialRecord } from '@hc/shared';
import { parse } from 'zipson';

definePageMeta({
  layout: 'fullscreen',
  colorMode: 'dark',
  name: 'Replay'
});

const ACTION_TIMEOUTS: PartialRecord<ActionName, number> = {
  REMOVE_INTERACTABLE: 0,
  END_TURN: 0,
  ADD_EFFECT: 0,
  SUMMON_INTERACTABLE: 0
};
const route = useRoute();
const { data: gameInfos, isLoading } = useConvexQuery(
  api.gameReplays.byGameId,
  {
    gameId: route.params.id as Id<'games'>
  },
  { ssr: false }
);

const parsedReplay = computed(() =>
  gameInfos.value ? (parse(gameInfos.value.replay.replay) as SerializedAction[]) : null
);

const currentStep = ref(0);
const isPlaying = ref(false);

const gameSession = shallowRef<GameSession>();

const next = () => {
  if (!parsedReplay.value) return;
  if (currentStep.value === parsedReplay.value.length - 1) {
    isPlaying.value = false;
    return;
  }

  gameSession.value?.dispatchAction(parsedReplay.value[currentStep.value]);
  currentStep.value++;
};
let unsub: () => void = () => void 0;

onUnmounted(() => {
  unsub();
});
until(parsedReplay)
  .not.toBeNull()
  .then(() => {
    const { game, map } = gameInfos.value!;

    const players = game.players.slice().sort(a => (a._id === game.firstPlayer ? -1 : 1));

    const initialState: SerializedGameState = {
      activePlayerId: game.firstPlayer,
      history: [],
      entities: [],
      turn: 0,
      players: [
        {
          gold: 2,
          id: players[0]._id,
          name: players[0].name,
          loadout: {
            units: Object.fromEntries(
              players[0].loadout!.units.map(unit => [unit, { cooldown: 0 }])
            )
          },
          generalId: players[0].loadout!.generalId
        },
        {
          gold: 2,
          id: players[1]._id,
          name: players[1].name,
          loadout: {
            units: Object.fromEntries(
              players[1].loadout!.units.map(unit => [unit, { cooldown: 0 }])
            )
          },
          generalId: players[1].loadout!.generalId
        }
      ],
      map: {
        ...map,
        cells: parse(map.cells),
        startPositions: [map.startPositions[0], map.startPositions[1]]
      }
    };
    gameSession.value = GameSession.createClientSession(initialState);

    unsub = gameSession.value.subscribe(action => {
      if (isPlaying.value) {
        setTimeout(
          () => {
            next();
          },
          ACTION_TIMEOUTS[action.name as ActionName] ?? 1000
        );
      }
    });
  });
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <ClientOnly v-else-if="gameSession">
    <div class="relative">
      <GameView :game-session="gameSession" :player-id="null" is-replay />
      <div class="flex absolute bottom-8 right-11">
        <UiButton
          class="ghost-button"
          @click="
            () => {
              isPlaying = !isPlaying;
              if (isPlaying) {
                next();
              }
            }
          "
        >
          <Icon
            size="2em"
            :name="
              isPlaying ? 'material-symbols:pause' : 'material-symbols-light:play-arrow'
            "
          />
        </UiButton>
        <UiButton class="ghost-button" :disabled="isPlaying" @click="next">
          <Icon name="material-symbols:fast-forward" size="2em" />
        </UiButton>
      </div>
    </div>
    <template #fallback><div /></template>
  </ClientOnly>
</template>
