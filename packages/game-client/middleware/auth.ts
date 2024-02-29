import { useSessionId } from '../composables/useSession';
import { api } from '@hc/api';

export default defineNuxtRouteMiddleware(async () => {
  const sessionId = useSessionId();

  if (!sessionId.value) {
    return navigateTo({ name: 'Login' });
  }

  const sessionExpiresAt = useCookie('sessionExpiresAt');
  const convex = useConvexClient();

  try {
    if (!sessionExpiresAt.value) {
      await $fetch('/api/signoff');
      sessionId.value = null;
      return navigateTo({ name: 'Login' });
    }

    const isExpired = Date.now() >= Number(sessionExpiresAt.value);
    if (!isExpired) return;

    const result = await convex.mutation(api.auth.validateSession, {
      sessionId: sessionId.value
    });
    sessionExpiresAt.value = result?.expiresAt;

    if (!result && process.client) {
      await $fetch('/api/signoff');
      sessionId.value = null;
      return navigateTo({ name: 'Login' });
    }
  } catch (err) {
    useCookie('sessionId').value = null;
    sessionExpiresAt.value = null;
    return navigateTo({ name: 'Login' });
  }
});
