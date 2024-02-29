<script setup lang="ts">
const isDark = useDarkMode();
</script>

<template>
  <div class="flex items-center gap-1">
    <Icon name="ph:sun-fill" class="icon" />
    <SwitchRoot id="dark-mode" v-model:checked="isDark" as-child class="dark-mode">
      <button>
        <SwitchThumb as-child>
          <span />
        </SwitchThumb>
      </button>
    </SwitchRoot>
    <Icon name="ph:moon-fill" class="icon" />
  </div>
</template>

<style scoped lang="postcss">
button {
  position: relative;

  display: flex;

  width: var(--size-8);
  height: var(--size-6);

  background: var(--surface-2);
  border: solid 2px var(--border-dimmed);
  border-radius: var(--radius-pill);

  > span {
    transform: translateX(calc(-1 * var(--size-1)));

    display: block;

    aspect-ratio: 1;
    width: var(--size-5);
    margin-block: auto;

    background-color: var(--surface-1);
    border-radius: var(--radius-round);
    box-shadow: var(--shadow-1);

    transition: transform 0.2s;

    &[data-state='checked'] {
      transform: translateX(var(--size-3));
      background-color: var(--primary);
    }
  }
}
</style>
