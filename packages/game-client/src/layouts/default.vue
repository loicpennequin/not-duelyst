<template>
  <div>
    <header class="container p-3 flex justify-between">
      <h1 class="text-4">
        <NuxtLink to="/">Not duelyst</NuxtLink>
      </h1>

      <nav>
        <ul class="flex gap-3">
          <li>
            <NuxtLink v-slot="{ href, navigate }" to="/play" custom>
              <UiButton :href="href" @click="navigate">Play now</UiButton>
            </NuxtLink>
          </li>

          <li>
            <NuxtLink v-slot="{ href, navigate }" to="/signup" custom>
              <UiButton :href="href" @click="navigate">Get started</UiButton>
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </header>
    <slot />
  </div>
</template>

<style scoped lang="postcss">
header {
  padding: var(--size-2);
}
</style>
