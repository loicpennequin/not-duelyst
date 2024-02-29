import { useSessionId } from '../composables/useSession';

export default defineNuxtRouteMiddleware(async () => {
  if (!process.server) return;

  const sessionId = useSessionId();
  const cookie = useCookie('sessionId');
  sessionId.value = cookie.value ?? null;
});
