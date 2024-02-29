// server/api/login.post.ts
import { api } from '@hc/api';
import { ConvexHttpClient } from 'convex/browser';

export default defineEventHandler(async event => {
  const config = useRuntimeConfig();
  const convexClient = new ConvexHttpClient(config.public.convexUrl);

  try {
    const sessionId = getCookie(event, 'sessionId');
    if (!sessionId) {
      throw new Error('No sesion cookie found');
    }

    await convexClient.mutation(api.auth.signOff, { sessionId });
    deleteCookie(event, 'sessionId');
    deleteCookie(event, 'sessionExpiresAt');

    return sendRedirect(event, '/login');
  } catch (e) {
    throw createError({
      message: 'Unable to sign off',
      statusCode: 400
    });
  }
});
