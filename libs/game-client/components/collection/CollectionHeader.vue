<script setup lang="ts">
import { FACTIONS } from '@hc/sdk';
import type { FactionId } from '@hc/sdk/src/faction/faction-lookup';

const factions: FactionId[] = Object.values(FACTIONS).map(f => f.id);
const filter = defineModel<string[]>('filter', { required: true });

const toggle = (faction: string) => {
  const index = filter.value.indexOf(faction);
  if (index === -1) {
    filter.value.push(faction);
  } else {
    filter.value.splice(index, 1);
  }
};
</script>

<template>
  <header class="fancy-surface border-none">
    <BackButton class="flex-self-center" />
    <div class="flex gap-2">
      <label v-for="faction in factions" :key="faction" class="capitalize">
        <img :src="`/assets/ui/rune-${faction.toLocaleLowerCase()}.png`" />
        {{ faction }}
        <input v-model="filter" type="checkbox" :value="faction" class="sr-only" />
      </label>
    </div>
  </header>
</template>

<style scoped lanh="postcss">
header {
  display: flex;
  gap: var(--size-8);
  padding: var(--size-2) var(--size-6);
  box-shadow: none;
}

label {
  cursor: pointer;
  user-select: none;

  display: flex;
  gap: var(--size-1);
  align-items: center;

  padding: var(--size-2);

  font-weight: var(--font-weight-5);

  &:hover {
    color: var(--primary);
  }

  &:has(input:is(:checked, :focus-visible)) {
    border-bottom: solid var(--border-size-1) var(--primary);
    > img {
      transform: scale(1.25);
      filter: contrast(1.5) brightness(1.3);
    }
  }

  img {
    transition: transform 0.2s;
  }
}
</style>
