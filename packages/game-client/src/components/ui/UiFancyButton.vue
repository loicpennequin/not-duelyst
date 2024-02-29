<script setup lang="ts">
export type ButtonProps = {
  leftIcon?: string;
  rightIcon?: string;
  isLoading?: boolean;
  isInline?: boolean;
  isCta?: boolean;
};

const {
  isLoading = false,
  leftIcon,
  rightIcon,
  isInline,
  isCta
} = defineProps<ButtonProps>();

const attrs = useAttrs();

const tag = computed(() => {
  if (attrs.href) return 'a';

  return 'button';
});
</script>

<template>
  <component
    :is="tag"
    class="ui-button"
    :class="{
      'is-inline': isInline,
      'is-cta': isCta,
      'is-loading': isLoading
    }"
    :disabled="attrs.disabled || isLoading"
  >
    <Icon v-if="leftIcon && !isLoading" :name="leftIcon" aria-hidden="true" />

    <!-- <UiSpinner v-if="isLoading" /> -->
    <slot />

    <Icon v-if="rightIcon && !isLoading" :name="rightIcon" aria-hidden="true" />
  </component>
</template>

<style scoped lang="postcss">
@import 'open-props/media';

@layer components {
  button {
    --_font-size: var(--font-size, var(--font-size-3));
    --_hue: var(--hue, 40deg);
    --_sat: var(--sat, 60%);
    --_hue2: var(--hue2, calc(var(--_hue) + 200deg));
    --_sat2: var(--sat2, 50%);

    --_clr: hsl(var(--_hue) var(--_sat) 35%);
    --_clr2: hsl(var(--_hue2) var(--_sat2) 10%);
    --_gradgap: 30%;
    --_gradoffset: 45%;

    position: relative;

    display: block;

    min-width: 10ch;
    padding: var(--size-2-em) var(--size-3-em);

    font-family: monospace;
    font-size: var(--_font-size);
    font-weight: var(--font-weight-7);
    color: var(--text-1);
    text-shadow: 0 2px black;
    letter-spacing: -0.025em;

    background-color: var(--_clr);
    background-image: linear-gradient(
      180deg,
      var(--_clr2) var(--_gradgap),
      transparent calc(100% - var(--_gradgap))
    );
    background-repeat: no-repeat;
    background-position: center var(--_gradoffset);
    background-size: 100% 200%;
    border: var(--fancy-border);
    border-radius: var(--radius-pill);

    transition: all 0.3s ease;

    &::before,
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: var(--radius-pill);
    }

    &::before {
      background-image: radial-gradient(
          ellipse,
          hsla(var(--_hue), 100%, 90%, 0.8) 20%,
          transparent 50%,
          transparent 200%
        ),
        linear-gradient(
          90deg,
          hsl(0deg, 0%, 25%) -10%,
          transparent 30%,
          transparent 70%,
          hsl(0deg, 0%, 25%) 110%
        );
      background-repeat: no-repeat;
      background-position: center 220%;
      background-size:
        200% 80%,
        cover;
      background-blend-mode: overlay;
      box-shadow:
        inset 0 0.25em 0.75em hsla(0deg, 0%, 0%, 0.8),
        inset 0 -0.05em 0.2em rgba(255, 255, 255, 0.4),
        inset 0 -1px 3px hsla(var(--_hue), 80%, 50%, 0.75);
      mix-blend-mode: overlay;
    }

    &::after {
      top: 0.075em;
      right: 0.75em;
      bottom: 1.8em;
      left: 0.75em;

      background: linear-gradient(
        180deg,
        hsla(var(--_hue2), 100%, 90%, 0.9),
        hsla(var(--_hue2), calc(var(--_sat2) * 0.7), 50%, 0.75) 40%,
        transparent 80%
      );
      mix-blend-mode: screen;
    }

    &:hover,
    &:active {
      background-position: center calc(var(--_gradoffset) - 0.75em);
      filter: contrast(125%);
      outline: none;
      box-shadow:
        0 -0.2em 1em hsla(var(--hue2), 70%, 80%, 0.3),
        0 0.5em 1.5em hsla(var(--hue), 70%, 80%, 0.5),
        0 0.25em 0.3em -0.2em hsl(var(--hue) 90% 70%),
        0 0.25em 0.5em hsla(var(--hue), 20%, 30%, 0.2),
        inset 0 -2px 2px rgba(255, 255, 255, 0.2);
    }

    &:focus-visible {
      outline: solid var(--border-size-2) var(--primary);
      outline-offset: 5px;
    }
  }
}
</style>
