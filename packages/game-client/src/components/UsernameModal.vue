<script setup lang="ts">
import { api } from '@hc/api';
import { object, string } from 'zod';

const sessionId = useSessionId();
const { data: me, isLoading } = useConvexQuery(
  api.users.me,
  computed(() => ({ sessionId: sessionId.value }))
);

const isOpened = computed(() => {
  if (isLoading.value) return false;
  return !!sessionId.value && !me.value?.hasOnboarded;
});

const { mutate: signup, isLoading: isSubmitting } = useConvexMutation(
  api.users.completeSignUp
);

const schema = toTypedSchema(
  object({
    name: string()
  })
);
</script>

<template>
  <UiModal
    :is-opened="isOpened"
    title="Almost there!"
    description="We just need you to choose a username below"
  >
    <VeeForm
      :validation-schema="schema"
      class="grid gap-3"
      @submit="values => signup({ ...(values as any), sessionId })"
    >
      <div class="flex gap-3 items-center mt-4">
        <VeeField name="name" />
        <VeeErrorMessage name="name" class="text-red-5" />
      </div>

      <UiButton :disbaled="isSubmitting" class="primary-button">Continue</UiButton>
    </VeeForm>
  </UiModal>
</template>

<style scoped>
input {
  display: block;
  border: var(--fancy-border);
}
</style>
