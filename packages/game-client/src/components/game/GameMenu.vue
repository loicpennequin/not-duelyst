<script setup lang="ts">
const { sendInput } = useGame();
const { isMenuOpened } = useGameUi();

useEventListener('keydown', e => {
  if (e.code === 'Escape' && !isMenuOpened.value) {
    isMenuOpened.value = true;
  }
});

const { playerId } = useGame();

const isSettingsOpoened = ref(false);
</script>

<template>
  <UiButton @click="isMenuOpened = true">
    <Icon name="material-symbols:settings" size="1.5rem" />
  </UiButton>

  <UiModal v-model:is-opened="isMenuOpened" title="Menu">
    <div class="grid gap-4">
      <UiButton is-cta @click="isSettingsOpoened = true">Settings</UiButton>
      <UiButton v-if="playerId" @click="sendInput('surrender')">Surrender</UiButton>
      <NuxtLink v-else v-slot="{ navigate, href }" :to="{ name: 'ClientHome' }" custom>
        <UiButton is-cta :href="href" @click="navigate">Quit spectating</UiButton>
      </NuxtLink>

      <DialogClose as-child>
        <UiButton is-cta @click="isMenuOpened = false">Resume</UiButton>
      </DialogClose>
    </div>
  </UiModal>

  <UiModal v-model:is-opened="isSettingsOpoened" title="Settings">
    <SettingsEditor @close="isSettingsOpoened = false" />
  </UiModal>
</template>

<style scoped>
:is(a, button) {
  --ui-button-border-color: var(--primary);
  --ui-button-bg-hover: var(--primary-hover);
  --ui-button-bg: transparent;

  &:hover:not(:disabled) {
    color: var(--text-on-primary);
    background-color: var(--primary-hover);
  }
}
</style>
