import { v } from 'convex/values';
import { internalAction, internalMutation } from './_generated/server';
import { UNITS } from '@hc/sdk';
import { toCollectionItemDto } from './collection/collection.utils';
import { internal } from './_generated/api';
import { ensureAuthenticated, queryWithAuth } from './auth/auth.utils';

export const grantAllCollection = internalMutation({
  args: {
    userId: v.id('users')
  },
  async handler(ctx, args) {
    console.log('granting all collection to', args.userId);
    const collection = await ctx.db
      .query('collectionItems')
      .withIndex('by_owner_id', q => q.eq('ownerId', args.userId))
      .collect();

    const unitsToAdd = Object.values(UNITS).filter(
      unit => !collection.some(item => item.itemId === unit.id)
    );

    console.log(unitsToAdd.map(u => u.id));
    return Promise.all(
      unitsToAdd.map(unit =>
        ctx.db.insert('collectionItems', {
          itemId: unit.id,
          ownerId: args.userId
        })
      )
    );
  }
});

export const grantAllCollectionToAllPlayers = internalAction(async ctx => {
  const users = await ctx.runQuery(internal.users.all);

  await Promise.all(
    users.map(user => {
      return ctx.runMutation(internal.collection.grantAllCollection, {
        userId: user._id
      });
    })
  );

  return true;
});

export const myCollection = queryWithAuth({
  args: {},
  handler: async ctx => {
    const user = await ensureAuthenticated(ctx.session);

    const collection = await ctx.db
      .query('collectionItems')
      .withIndex('by_owner_id', q => q.eq('ownerId', user._id))
      .collect();

    return collection.map(toCollectionItemDto);
  }
});
