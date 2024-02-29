import { v } from 'convex/values';
import { internalQuery } from './_generated/server';
import { createUserAbility } from './users/user.ability';
import { ensureAuthorized } from './utils/ability';
import { DEFAULT_MMR, generateDiscriminator } from './users/user.utils';
import { ensureAuthenticated, mutationWithAuth, queryWithAuth } from './auth/auth.utils';
import { toUserDto } from './users/user.mapper';
import { getFeatureFlag } from './featureFlags/featureFlags.utils';
import { FEATURE_FLAGS } from './featureFlags/featureFlags.constants';
import { internal } from './_generated/api';
import { AnyObject } from '@hc/shared';

export const completeSignUp = mutationWithAuth({
  args: {
    name: v.string()
  },
  handler: async ({ session, db, scheduler }, { name }) => {
    const user = ensureAuthenticated(session);

    const userAbility = await createUserAbility(session);
    await ensureAuthorized(userAbility.can('create', 'user'));

    const updatedUser = await db.patch(user._id, {
      name: name,
      discriminator: await generateDiscriminator({ db }, name),
      mmr: DEFAULT_MMR
    });

    const grantCollection = await getFeatureFlag(
      db,
      FEATURE_FLAGS.GRANT_COLLECTION_ON_SIGNUP
    );

    if (grantCollection) {
      scheduler.runAfter(0, internal.collection.grantAllCollection, { userId: user._id });
    }

    return updatedUser;
  }
});

export const me = queryWithAuth({
  args: {},
  handler: async ctx => {
    const user = ensureAuthenticated(ctx.session);

    return toUserDto(user);
  }
});

export const all = internalQuery(({ db }) => db.query('users').collect());

export const settings = queryWithAuth({
  args: {},
  async handler({ db, session }) {
    const user = ensureAuthenticated(session);

    const settings = await db
      .query('userSettings')
      .withIndex('by_user_id', q => q.eq('userId', user._id))
      .unique();

    return (settings?.settings ?? {}) as AnyObject;
  }
});

export const saveSettings = mutationWithAuth({
  args: {
    settings: v.any()
  },
  async handler({ db, session }, args) {
    const user = ensureAuthenticated(session);

    const settings = await db
      .query('userSettings')
      .withIndex('by_user_id', q => q.eq('userId', user._id))
      .unique();

    if (!settings) {
      await db.insert('userSettings', {
        userId: user._id,
        settings: args.settings
      });
    } else {
      await db.patch(settings._id, { settings: args.settings });
    }
  }
});
