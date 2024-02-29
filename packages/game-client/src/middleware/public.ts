import { useSessionId } from '../composables/useSession';

export default defineNuxtRouteMiddleware(async () => {
  const sessionId = useSessionId();

  if (sessionId.value) {
    return navigateTo('/play');
  }
});
