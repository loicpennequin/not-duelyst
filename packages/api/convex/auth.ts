import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import { mutationWithAuth } from './auth/auth.utils';
import { DEFAULT_MMR } from './users/user.utils';

export const signOff = mutationWithAuth({
  args: {},
  handler: async ctx => {
    if (ctx.session) {
      await ctx.auth.invalidateSession(ctx.session.sessionId);
    }

    return null;
  }
});

export const signIn = mutationWithAuth({
  args: {
    email: v.string(),
    password: v.string()
  },
  handler: async (ctx, { email, password }) => {
    const key = await ctx.auth.useKey('password', email, password);
    const session = await ctx.auth.createSession({
      userId: key.userId,
      attributes: {
        // These will be filled out by Convex
        _id: '' as Id<'sessions'>,
        _creationTime: 0
      }
    });
    return {
      sessionId: session.sessionId,
      expiresAt: session.activePeriodExpiresAt.getTime()
    };
  }
});

export const signUp = mutationWithAuth({
  args: {
    email: v.string(),
    password: v.string()
  },
  handler: async (ctx, { email, password }) => {
    const user = await ctx.auth.createUser({
      key: {
        password: password,
        providerId: 'password',
        providerUserId: email
      },
      attributes: {
        email,
        // These will be filled out by Convex
        mmr: DEFAULT_MMR,
        _id: '' as Id<'users'>,
        _creationTime: 0
      }
    });
    const session = await ctx.auth.createSession({
      userId: user.userId,
      attributes: {
        // These will be filled out by Convex
        _id: '' as Id<'sessions'>,
        _creationTime: 0
      }
    });
    return session.sessionId;
  }
});

export const validateSession = mutationWithAuth({
  args: {},
  handler({ session }) {
    if (!session) return null;

    return {
      sessionId: session.sessionId,
      expiresAt: session.activePeriodExpiresAt.getTime()
    };
  }
});
