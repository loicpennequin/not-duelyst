<script setup lang="ts">
export type ButtonStyleVariables =
  | '--ui-button-color'
  | '--ui-button-bg'
  | '--ui-button-hover-color'
  | '--ui-button-hover-bg'
  | '--ui-button-focus-color'
  | '--ui-button-focus-bg'
  | '--ui-button-disabled-color'
  | '--ui-button-disabled-bg'
  | '--ui-button-size'
  | '--ui-button-weight'
  | '--ui-button-border-color'
  | '--ui-button-border-size'
  | '--ui-button-radius';

export type ButtonProps = {
  leftIcon?: string;
  rightIcon?: string;
  isLoading?: boolean;
  isInline?: boolean;
  isCta?: boolean;
  style?: StyleProp<ButtonStyleVariables>;
};

const {
  isLoading = false,
  leftIcon,
  rightIcon,
  isInline,
  isCta,
  style = {}
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
    :style="style"
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
  .ui-button {
    --_ui-button-size: var(--ui-button-size, var(--font-size-1));
    --_ui-button-weight: var(--ui-button-weight, var(--font-weight-6));
    --_ui-button-border-color: var(--ui-button-border-color, transparent);
    --_ui-button-border-size: var(--ui-button-border-size, var(--border-size-1));
    --_ui-button-radius: var(--ui-button-radius, var(--radius-2));

    --_ui-button-color: var(--ui-button-color, white);
    --_ui-button-bg: var(--ui-button-bg, var(--gray-10));

    --_ui-button-hover-color: var(--ui-button-hover-color, var(--_ui-button-color));
    --_ui-button-hover-bg: var(--ui-button-hover-bg, var(--_ui-button-bg));

    --_ui-button-focus-color: var(--ui-button-focus-color, var(--_ui-button-color));
    --_ui-button-focus-bg: var(--ui-button-focus-bg, var(--_ui-button-bg));

    --_ui-button-disabled-color: var(--ui-button-disabled-color, var(--text-on-disabled));
    --_ui-button-disabled-bg: var(--ui-button-disabled-bg, var(--disabled));

    cursor: pointer;

    display: flex;
    gap: var(--size-2);
    align-items: center;
    justify-content: center;

    width: fit-content;
    padding: var(--size-2-em) var(--size-3-em);

    font-size: var(--_ui-button-size);
    font-weight: var(--_ui-button-weight);
    color: var(--_ui-button-color);
    white-space: nowrap;
    vertical-align: middle;

    background-color: var(--_ui-button-bg);
    border: solid var(--_ui-button-border-size) var(--_ui-button-border-color);
    border-radius: var(--_ui-button-radius);

    &:disabled {
      cursor: not-allowed;
      color: var(--_ui-button-disabled-color);
      background-color: var(--_ui-button-disabled-bg);
    }

    &,
    &:hover {
      text-decoration: none;
    }

    &:hover &:active {
      transform: scale(0.98);
      transition: transform 0.2s;
    }

    &:focus-visible {
      color: var(--_ui-button-focus-color);
      background-color: var(--_ui-button-focus-bg);
    }
    &.is-inline {
      display: inline-flex;
    }

    &.is-cta {
      width: 100%;
    }

    & > .icon {
      display: block;
      flex-shrink: 0;
      aspect-ratio: 1;
      font-size: var(--font-size-4);
    }

    @media (--mouse) {
      &:hover:not(:disabled) {
        color: var(--_ui-button-hover-color);
        background-color: var(--_ui-button-hover-bg);
      }
    }
  }
}
</style>
