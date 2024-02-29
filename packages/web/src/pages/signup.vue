<script setup lang="ts">
import { api } from '@hc/api';

definePageMeta({
  middleware: ['public']
});

const formData = reactive({
  email: '',
  password: ''
});

const { push } = useRouter();
const { mutate: signup } = useConvexMutation(api.auth.signUp, {
  onSuccess() {
    push({ name: 'Login' });
  }
});

const onSubmit = () => {
  signup({ ...formData, sessionId: null });
};
</script>

<template>
  <div class="grid place-content-center h-screen">
    <h2>Sign up</h2>

    <form class="fancy-surface" @submit.prevent="onSubmit">
      <label>E-mail address</label>
      <input v-model="formData.email" type="email" />

      <label>Password</label>
      <input v-model="formData.password" type="password" />

      <UiButton class="primary-button">Sign up</UiButton>
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
</style>
