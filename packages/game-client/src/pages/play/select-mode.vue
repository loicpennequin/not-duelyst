<script setup lang="ts">
definePageMeta({
  name: 'SelectGameMode',
  pageTransition: {
    name: 'select-mode',
    mode: 'out-in'
  }
});
</script>

<template>
  <div class="page container">
    <header>
      <BackButton class="inline-flex" />
      <h1 class="text-5">Select game mode</h1>
    </header>

    <div class="mode">
      <NuxtLink :to="{ name: 'Matchmaking' }">
        <div class="fancy-surface">
          <h2>Ranked</h2>
          <p>Play against another player to climb the rankings.</p>
        </div>
      </NuxtLink>
    </div>

    <div class="mode" style="--hue-shift: 45">
      <NuxtLink :to="{ name: 'Sandbox' }" @click.prevent>
        <div class="fancy-surface">
          <h2>Sandbox</h2>

          <p>Play a practice game where you control both players.</p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<style lang="postcss">
.select-mode-enter-active,
.select-mode-leave.active {
  transition: all 0.4s;
}

.select-mode-enter-from,
.select-mode-leave-to {
  transform: translateY(-1.5rem);
  opacity: 0;
}
</style>

<style scoped lang="postcss">
.page {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: auto 1fr;
  column-gap: var(--size-6);

  height: 100vh;

  > header {
    grid-column: 1 / -1;
    padding-block: var(--size-6);
    text-shadow: black 0px 4px 1px;
  }
}

.mode {
  > a {
    display: grid;
    height: 100%;
    font-size: var(--font-size-4);

    &:hover {
      filter: brightness(130%);
    }

    > div {
      display: grid;
      place-content: center;
      filter: hue-rotate(calc(1deg * var(--hue-shift)));
    }
  }
}
</style>
