<script setup lang="ts">
import bg from '../assets/backgrounds/palace.jpg';

definePageMeta({
  middleware: ['auth'],
  layout: 'fullscreen',
  colorMode: 'dark',
  pageTransition: { mode: 'out-in' }
});
</script>

<template>
  <div :style="{ '--bg': `url(${bg})` }" class="root">
    <div>
      <UsernameModal />
      <CurrentGameModal />
      <NuxtPage />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.root {
  min-height: 100vh;
  background: var(--bg);
  background-attachment: fixed;
  background-size: cover;

  > div {
    height: 100%;
    min-height: 100vh;
    background: var(--fancy-bg-transparency);
  }
}
</style>
