<script setup lang="ts">
definePageMeta({
  middleware: ['public'],
  name: 'Login'
});

const formData = reactive({
  email: '',
  password: ''
});
const sessionId = useSessionId();
const { push } = useRouter();

const error = ref<string>('');
const isLoading = ref(false);
const onSubmit = async () => {
  try {
    isLoading.value = true;
    error.value = '';

    sessionId.value = await $fetch('/api/signin', {
      method: 'POST',
      body: formData
    });
    push({ name: 'ClientHome' });
  } catch (err) {
    error.value = (err as any).statusMessage;
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="grid place-content-center h-screen">
    <h2>Login</h2>
    <form class="fancy-surface" @submit.prevent="onSubmit">
      <label>E-mail address</label>
      <input v-model="formData.email" type="email" />

      <label>Password</label>
      <input v-model="formData.password" type="password" />

      <UiButton :is-loading="isLoading" is-cta class="primary-button">Login</UiButton>

      <Transition>
        <p v-if="error" class="color-red-5 mt-2">{{ error }}</p>
      </Transition>
    </form>
  </div>
</template>

<style scoped lang="postcss">
form {
  display: grid;

  > input {
    margin-block-end: var(--size-3);
    border: var(--fancy-border);
  }
}

p {
  &:is(.v-enter-active, .v-leave-active) {
    transition: all 0.3s;
  }

  &:is(.v-enter-from, .v-leave-to) {
    transform: translateY(calc(-1 * var(--size-2)));
    opacity: 0;
  }
}
</style>
