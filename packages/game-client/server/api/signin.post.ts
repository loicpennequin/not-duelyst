// server/api/login.post.ts
import { api } from '@hc/api';
import { ConvexHttpClient } from 'convex/browser';

export default defineEventHandler(async event => {
  const body = await readBody(event);
  const config = useRuntimeConfig();
  const convexClient = new ConvexHttpClient(config.public.convexUrl);

  try {
    const { sessionId, expiresAt } = await convexClient.mutation(api.auth.signIn, {
      ...body,
      sessionId: null
    });
    setCookie(event, 'sessionId', sessionId, {
      httpOnly: true,
      secure: import.meta.env.PROD
    });
    setCookie(event, 'sessionExpiresAt', expiresAt, {
      secure: import.meta.env.PROD
    });

    return sessionId;
  } catch (e) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid email or password'
    });
  }
});
