<script setup lang="ts">
const { state } = useGame();
const { selectedEntity } = useGameUi();

const historyRef = ref<HTMLElement>();
watch(
  () => state.value.history.length,
  () => {
    nextTick(() => {
      [...(historyRef.value?.children ?? [])]
        .at(-1)
        ?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  }
);
</script>

<template>
  <PlayerInfos />

  <Transition>
    <div
      v-if="selectedEntity"
      :key="selectedEntity.id"
      class="selected-entity"
      :class="selectedEntity.player.equals(state.players[0]) ? 'left' : 'right'"
    >
      <UnitCard :entity="selectedEntity" />
    </div>
  </Transition>

  <div class="game-action-bar">
    <ActionBar />
  </div>

  <div class="menu">
    <GameMenu />
  </div>

  <div class="history fancy-surface">
    <label class="fancy-surface">
      <input type="checkbox" class="sr-only" />
      <Icon name="material-symbols:arrow-forward-ios" size="2rem" />
    </label>

    <div class="pt-3 text-3 text-center">Combat log</div>
    <ul ref="historyRef" class="fancy-scrollbar">
      <li v-for="(action, index) in state.history" :key="index">
        {{ action.message }}
      </li>
    </ul>
  </div>
  <!-- <GameChat /> -->

  <!-- <UiIconButton
    icon="ic:sharp-emoji-flags"
    :theme="{ size: 'font-size-5' }"
    title="Surrender"
    class="surrender-button"
    @click="surrender"
  /> -->
</template>

<style scoped>
.selected-entity {
  position: absolute;
  z-index: 1;
  top: 14rem;
  &.left {
    left: var(--size-5);
    &:is(.v-enter-from, .v-leave-to) {
      transform: translateX(-50%) rotateY(45deg);
    }
  }
  &.right {
    right: var(--size-5);
    &:is(.v-enter-from, .v-leave-to) {
      transform: translateX(50%) rotateY(-45deg);
    }
  }

  &:is(.v-enter-active, .v-leave-active) {
    transition:
      transform 0.3s,
      opacity 0.3s;
  }

  &:is(.v-enter-from, .v-leave-to) {
    opacity: 0;
  }
}

.game-action-bar {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.menu {
  position: absolute;
  right: var(--size-3);
  bottom: var(--size-3);
}

.history {
  position: absolute;
  top: 33%;
  left: 0;

  width: 20rem;
  padding: 0;

  transition: transform 0.3s;

  &:has(input:not(:checked)) {
    transform: translateX(-100%);
  }

  ul {
    overflow-y: auto;
    height: 20rem;
    padding: 0;

    li {
      padding: var(--size-3);
    }
  }

  label {
    cursor: pointer;

    position: absolute;
    top: 50%;
    right: 0;
    transform: translate(100%, -50%);

    padding: var(--size-2);
  }
}
</style>
