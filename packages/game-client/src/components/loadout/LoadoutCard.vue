<script setup lang="ts">
import type { LoadoutDto } from '@hc/api/convex/loadout/loadout.mapper';
import { UNITS } from '@hc/sdk';

const { loadout } = defineProps<{
  loadout: LoadoutDto;
}>();

const getImage = (unitId: string) => {
  const unit = UNITS[unitId];

  return `/assets/units/${unit.spriteId}-icon.png`;
};

const generalImage = computed(() => {
  return getImage(loadout.generalId);
});
</script>

<template>
  <article class="fancy-surface">
    <div class="general">
      <img :src="generalImage" />

      <div>
        <img
          v-for="(_, index) in 3"
          :key="index"
          :src="`/assets/ui/rune-${
            loadout.factions[index]?.toLowerCase() ?? 'empty'
          }.png`"
        />
      </div>
    </div>
    <div class="grid grid-cols-6 gap-1">
      <span>{{ loadout.name }}</span>
      <img v-for="unitId in loadout.unitIds" :key="unitId" :src="getImage(unitId)" />
    </div>
  </article>
</template>

<style scoped lang="postcss">
article {
  user-select: none;

  display: flex;
  gap: var(--size-2);
  align-items: center;

  padding: 0;
  padding: var(--size-1) var(--size-2);

  border-top-right-radius: var(--radius-3);
  border-bottom-left-radius: var(--radius-3);
}

span {
  display: block;
  grid-column: 1 / -1;
}

img {
  overflow: hidden;

  aspect-ratio: 1;
  width: var(--size-7);

  border: var(--fancy-border);
  border-radius: var(--radius-round);

  image-rendering: pixelated;
}

.general {
  position: relative;
  align-self: start;
  > img {
    width: var(--size-9);
  }

  > div {
    position: absolute;
    bottom: 0;

    display: flex;
    justify-content: space-around;

    width: 100%;
    > img {
      width: 16px;
      height: 18px;
    }
  }
}
</style>
