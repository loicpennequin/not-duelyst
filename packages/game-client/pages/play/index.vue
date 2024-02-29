<script setup lang="ts">
definePageMeta({
  name: 'ClientHome',
  pageTransition: {
    name: 'client-home',
    mode: 'out-in',
    appear: true
  }
});
</script>

<template>
  <div class="page">
    <nav>
      <ul class="grid gap-2">
        <li><NuxtLink :to="{ name: 'SelectGameMode' }">Play</NuxtLink></li>
        <li><NuxtLink :to="{ name: 'Collection' }">Collection</NuxtLink></li>
        <li><NuxtLink :to="{ name: 'WatchList' }">Watch</NuxtLink></li>
        <li><NuxtLink :to="{ name: 'MyProfile' }">Profile</NuxtLink></li>
        <li><a href="/api/signoff">Sign off</a></li>
      </ul>
    </nav>
  </div>
</template>

<style lang="postcss">
.client-home-enter-active,
.client-home-leave-active {
  transition: all 0.3s;
}
.client-home-enter-from,
.client-home-leave-to {
  transform: translateY(-1.5rem);
  opacity: 0;
}
</style>
<style scoped lang="postcss">
.page {
  display: grid;
  place-content: center;
  min-height: 100vh;
}

li > * {
  position: relative;

  display: block;

  padding: 0;

  font-size: var(--font-size-5);
  text-align: left;
  text-shadow: black 0px 4px 1px;
  &::after {
    content: '';

    position: absolute;
    bottom: -5px;
    left: 50%;

    width: 0;
    height: 3px;

    background-color: var(--primary);

    transition:
      width 0.2s,
      left 0.2s;
  }

  &:hover::after {
    left: 0;
    width: 100%;
  }
}
</style>
