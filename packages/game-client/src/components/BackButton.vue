<script setup lang="ts">
import type { NuxtLinkProps } from 'nuxt/app';

const { to = { name: 'ClientHome' }, ...props } = defineProps<NuxtLinkProps>();
</script>

<template>
  <NuxtLink :to="to" v-bind="props">
    <span class="i-material-symbols-arrow-back-rounded w-5 h-5 block" />
    Go Back
  </NuxtLink>
</template>

<style scoped lang="postcss">
@layer components {
  a {
    position: relative;
    display: flex;
    gap: var(--size-1);
    align-items: center;

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
}
</style>
