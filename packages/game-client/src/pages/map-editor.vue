<script setup lang="ts">
definePageMeta({
  layout: 'fullscreen'
});
</script>

<template>
  <ClientOnly>
    <Suspense>
      <MapEditor />
      <template #fallback>Loading maps...</template>
    </Suspense>

    <template #fallback>
      <div />
    </template>
  </ClientOnly>
</template>
