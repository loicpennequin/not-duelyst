<script setup lang="ts">
import { api } from '@hc/api';

const route = useRoute();
const router = useRouter();
const sessionId = useSessionId();
const { data: currentGame } = useConvexQuery(
  api.games.getCurrent,
  computed(() => ({ sessionId: sessionId.value })),
  { ssr: false, enabled: computed(() => !!sessionId.value) }
);

const hasCurrentOngoingGame = computed(
  () =>
    route.name !== 'Game' &&
    !!currentGame.value &&
    currentGame.value.status !== 'FINISHED'
);

watchEffect(() => {
  if (hasCurrentOngoingGame.value) {
    router.replace({ name: 'Game', query: { roomId: currentGame.value?.roomId } });
  }
});
</script>

<template>
  <UiModal :is-opened="hasCurrentOngoingGame" title="Connecting to your game..." modal>
    <DialogPortal>
      <DialogOverlay class="modal-overlay" />
      <DialogContent class="modal-content">
        <div class="fancy-surface">
          <DialogTitle>Connecting to your game...</DialogTitle>
        </div>
      </DialogContent>
    </DialogPortal>
  </UiModal>
</template>
