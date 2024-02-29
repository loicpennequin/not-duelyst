<script setup lang="ts">
const colorMode = useColorMode();

colorMode.preference = 'dark';

useHead({
  title: 'Not Duelyst (but kinda)',
  style: [
    {
      // this solve a weird issue in dev mode where the components and base layers are inverted, probably due to dynamic style blocks insertion order
      innerHTML: `
    @layer base, components, utilities;

    @layer base {
      .wtf-hack: {
        color: initial;
      }
    }
    @layer components {
      .wtf-hack: {
        color: initial;
      }
    }
    @layer utilities {
      .wtf-hack: {
        color: initial;
      }
    }
    `
    }
  ]
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
@layer base, components, utilities;
</style>
