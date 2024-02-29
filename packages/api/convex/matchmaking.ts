import { api, internal } from './_generated/api';
import { internalAction, internalMutation, query } from './_generated/server';
import { Matchmaking } from './matchmaking/matchmaking';
import { MatchmakingTestStrategy } from './matchmaking/strategies/test.strategy';
import {
  createGameFromMatchmadePair,
  ensureIsInMatchmaking,
  ensureIsNotInMatchmaking,
  getMatchmaking,
  scheduleNextMatchmakingInvocation,
  startMatchmakingIfNeeded
} from './matchmaking/matchmaking.utils';
import { v } from 'convex/values';
import { ensureHasNoCurrentGame, getGameInitialState } from './game/utils';
import { ensureAuthenticated, mutationWithAuth } from './auth/auth.utils';

export const join = mutationWithAuth({
  args: {
    loadoutId: v.id('loadouts')
  },
  handler: async (ctx, args) => {
    const user = ensureAuthenticated(ctx.session);

    await ensureHasNoCurrentGame(ctx, user._id);
    await ensureIsNotInMatchmaking(ctx, user._id);

    const result = await ctx.db.insert('matchmakingUsers', {
      loadoutId: args.loadoutId,
      userId: user!._id
    });
    await startMatchmakingIfNeeded(ctx);

    return result;
  }
});

export const leave = mutationWithAuth({
  args: {},
  handler: async ctx => {
    const user = ensureAuthenticated(ctx.session);
    const matchMakingUser = await ensureIsInMatchmaking(ctx, user._id);

    return ctx.db.delete(matchMakingUser._id);
  }
});

export const matchPlayers = internalAction(async ctx => {
  const participants = await ctx.runQuery(api.matchmaking.getMatchmakingUsers);

  const strategy = new MatchmakingTestStrategy();
  const { pairs, remaining } = new Matchmaking(participants, strategy).makePairs();

  await Promise.allSettled(
    pairs.map(pair =>
      createGameFromMatchmadePair(
        ctx,
        pair.map(p => ({
          userId: p.user._id,
          matchmakingUserId: p.matchmakingUser._id,
          loadoutId: p.matchmakingUser.loadoutId
        }))
      )
    )
  );

  await scheduleNextMatchmakingInvocation(ctx, remaining.length);
});

export const handleMatchmadePair = internalMutation({
  args: {
    roomId: v.string(),
    players: v.array(
      v.object({
        loadoutId: v.id('loadouts'),
        matchmakingUserId: v.id('matchmakingUsers'),
        userId: v.id('users')
      })
    )
  },
  async handler(ctx, arg) {
    await Promise.all(
      arg.players.map(({ matchmakingUserId }) => ctx.db.delete(matchmakingUserId))
    );

    const { mapId, firstPlayer, status } = await getGameInitialState(
      ctx,
      arg.players.map(p => p.userId)
    );

    const gameId = await ctx.db.insert('games', {
      firstPlayer,
      mapId,
      status,
      roomId: arg.roomId
    });

    await Promise.all(
      arg.players.map(({ userId, loadoutId }) =>
        ctx.db.insert('gamePlayers', {
          loadoutId,
          gameId,
          userId
        })
      )
    );

    ctx.scheduler.runAfter(45_000, internal.games.timeout, { roomId: arg.roomId });
  }
});

export const getMatchmakingUsers = query(async ctx => {
  const matchmakingUsers = await ctx.db.query('matchmakingUsers').collect();

  return await Promise.all(
    matchmakingUsers.map(async matchmakingUser => ({
      matchmakingUser,
      user: (await ctx.db.get(matchmakingUser.userId))!
    }))
  );
});

export const setupNextInvocation = internalMutation({
  args: {
    schedulerId: v.optional(v.id('_scheduled_functions'))
  },
  async handler(ctx, arg) {
    const matchmaking = await getMatchmaking(ctx.db);
    await ctx.db.patch(matchmaking._id, { nextInvocationId: arg.schedulerId });
  }
});
