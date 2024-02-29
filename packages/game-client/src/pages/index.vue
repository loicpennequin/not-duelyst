<script setup lang="ts">
definePageMeta({
  layout: 'default'
});
</script>

<template>
  <div class="hero">
    <div class="fancy-surface container">
      <h2>
        <span>Not duelyst</span>
        is a multiplayer turn-based strategy game inspired by the game...
        <a href="https://duelyst2.com/" target="_blank">Duelyst</a>
        (shocking, I know)
      </h2>

      <p>
        This is a pre-pre(-pre) alpha version of the game (if it wasn't obvious seeing the
        look of this website).
        <br />
        This means that:
      </p>
      <ul>
        <li>Any account can (and will) be wiped out at any moment.</li>
        <li>Bugs can (and will most probably) happen.</li>
        <li>Features, gameplay and game balance are lacking.</li>
        <li>
          For the time being, any created account will start with all the units collection
          unlocked, and will automatically get any new units added after the account
          creation.
        </li>
      </ul>

      <p>
        Also good luck finding a game since matchmaking will most likely always be empty.
      </p>
      <div class="flex gap-4">
        <NuxtLink v-slot="{ href, navigate }" to="/play" custom>
          <UiButton :href="href" class="primary-button" @click="navigate">
            Play now
          </UiButton>
        </NuxtLink>
        <NuxtLink v-slot="{ href, navigate }" to="/signup" custom>
          <UiButton :href="href" class="primary-button" @click="navigate">
            Get started
          </UiButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.hero {
  padding: var(--size-11) var(--size-8);
  background: linear-gradient(
      to bottom,
      var(--surface-2),
      hsl(var(--gray-10-hsl) / 0.25) 20%,
      hsl(var(--gray-10-hsl) / 0.25) 80%,
      var(--surface-2)
    ),
    radial-gradient(circle at center, transparent, var(--surface-2)),
    linear-gradient(130deg, hsl(var(--pink-6-hsl) / 0.5), hsl(var(--blue-6-hsl) / 0.5)),
    url('/home-hero.png');
  background-size: cover;

  > div {
    display: grid;
    gap: var(--size-3);
  }

  ul {
    padding-left: var(--size-4);
    list-style: initial;
  }
}

h2 {
  max-inline-size: 100%;
  text-wrap: balance;

  > span {
    color: transparent;
    background: var(--gradient-1);
    background-clip: text;

    -webkit-text-stroke: 1px white;
  }

  a {
    text-decoration: underline;
  }
}
</style>
