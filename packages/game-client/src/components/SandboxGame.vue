<script setup lang="ts">
import { GameSession, type Player, type SerializedGameState } from '@hc/sdk';

const { initialStateFactory } = defineProps<{
  initialStateFactory: () => Promise<SerializedGameState>;
}>();

const state = useSandboxState();
const serverSession = GameSession.createServerSession(await initialStateFactory());
const clientSession = GameSession.createClientSession(await initialStateFactory());
serverSession.onReady(() => {
  serverSession.subscribe(action => {
    clientSession.dispatchAction(action.serialize() as any); // @FIXME
    state.value = serverSession.serialize();
  });
});

const ready = ref(false);
clientSession.onReady(() => {
  ready.value = true;
});
const dispatch = (
  type: Parameters<(typeof serverSession)['dispatchPlayerInput']>[0]['type'],
  payload: any
) => {
  serverSession.dispatchPlayerInput({
    type,
    payload: {
      ...payload,
      playerId: clientSession.playerManager.getActivePlayer().id
    }
  });
};

const onEnd = ({ winner }: { winner: Player }) => {
  alert(`Game Over ! ${winner.id} won !`);
};
</script>

<template>
  <GameView
    v-if="ready"
    :player-id="null"
    :game-session="clientSession"
    @move="dispatch('MOVE', $event)"
    @end-turn="dispatch('END_TURN', {})"
    @use-skill="dispatch('USE_SKILL', $event)"
    @summon="dispatch('SUMMON', $event)"
    @surrender="dispatch('SURRENDER', {})"
    @end="onEnd"
  />
  <div class="fixed bottom-5 left-5">
    <button
      @click="
        () => {
          console.log({ serverSession, clientSession });
        }
      "
    >
      Debug
    </button>
  </div>
</template>
