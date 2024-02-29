import { api, internal } from './_generated/api';
import { query, internalMutation, action } from './_generated/server';
import { ensureAuthenticated, mutationWithAuth, queryWithAuth } from './auth/auth.utils';
import { getCurrentGame } from './game/utils';
import { toUserDto } from './users/user.mapper';
import { v } from 'convex/values';

export const getCurrent = queryWithAuth({
  args: {},
  handler: async ctx => {
    const user = ensureAuthenticated(ctx.session);

    return getCurrentGame({ db: ctx.db }, user._id);
  }
});

export const start = mutationWithAuth({
  args: {
    gameId: v.id('games')
  },
  async handler(ctx, args) {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error('Not Found');
    if (game?.status !== 'WAITING_FOR_PLAYERS') {
      throw new Error('Game is already started');
    }

    await ctx.db.patch(game._id, { status: 'ONGOING' });
  }
});

export const timeout = internalMutation({
  args: {
    roomId: v.string()
  },
  async handler(ctx, { roomId }) {
    const game = await ctx.db
      .query('games')
      .withIndex('by_roomId', q => q.eq('roomId', roomId))
      .first();
    if (!game) throw new Error('Game Not Found');
    if (game.status === 'WAITING_FOR_PLAYERS') {
      ctx.scheduler.runAfter(0, api.games.cancel, {
        roomId
      });
    }
  }
});

export const destroy = internalMutation({
  args: {
    gameId: v.id('games'),
    winnerId: v.id('users')
  },
  async handler(ctx, args) {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error('Game Not Found');
    if (game?.status !== 'ONGOING') {
      throw new Error('Game is not ongoing');
    }

    const gamePlayer = await ctx.db
      .query('gamePlayers')
      .withIndex('by_user_id', q => q.eq('userId', args.winnerId))
      .filter(q => q.eq(q.field('gameId'), args.gameId))
      .unique();

    await ctx.db.patch(game._id, { status: 'FINISHED', winnerId: gamePlayer!._id });

    return game;
  }
});

export const internalCancel = internalMutation({
  args: {
    roomId: v.string()
  },
  async handler(ctx, args) {
    const game = await ctx.db
      .query('games')
      .withIndex('by_roomId', q => q.eq('roomId', args.roomId))
      .first();
    if (!game) throw new Error('Game Not Found');

    await ctx.db.patch(game._id, { status: 'CANCELLED' });
  }
});

export const cancel = action({
  args: {
    roomId: v.string()
  },
  async handler(ctx, { roomId }) {
    await ctx.runMutation(internal.games.internalCancel, { roomId });
    await ctx.runAction(internal.hathora.destroyRoom, { roomId });
  }
});

export const end = action({
  args: {
    gameId: v.id('games'),
    winnerId: v.id('users'),
    replay: v.string()
  },
  async handler(ctx, { replay, ...args }) {
    const game = await ctx.runMutation(internal.games.destroy, args);
    await ctx.runMutation(internal.gameReplays.createReplay, {
      gameId: args.gameId,
      replay: replay
    });
    await ctx.runAction(internal.hathora.destroyRoom, { roomId: game.roomId });
  }
});

export const getById = query({
  args: {
    gameId: v.id('games')
  },
  async handler(ctx, args) {
    const game = await ctx.db.get(args.gameId);
    if (!game) return null;

    const gamePlayers = await ctx.db
      .query('gamePlayers')
      .withIndex('by_game_id', q => q.eq('gameId', game?._id))
      .collect();

    return {
      ...game,
      players: await Promise.all(
        gamePlayers.map(async gamePlayer => {
          const user = await ctx.db.get(gamePlayer.userId);
          return {
            ...toUserDto(user!),
            loadout: await ctx.db.get(gamePlayer.loadoutId)
          };
        })
      )
    };
  }
});

export const getAllOngoing = query(async ctx => {
  const games = await ctx.db
    .query('games')
    .withIndex('by_status', q => q.eq('status', 'ONGOING'))
    .collect();

  return Promise.all(
    games.map(async game => {
      const gamePlayers = await ctx.db
        .query('gamePlayers')
        .withIndex('by_game_id', q => q.eq('gameId', game?._id))
        .collect();

      return {
        ...game,
        players: await Promise.all(
          gamePlayers.map(async gamePlayer => {
            const user = await ctx.db.get(gamePlayer.userId);
            return {
              ...toUserDto(user!),
              loadout: await ctx.db.get(gamePlayer.loadoutId)
            };
          })
        )
      };
    })
  );
});

export const getMyGameHistory = queryWithAuth({
  args: {},
  handler: async ctx => {
    const user = ensureAuthenticated(ctx.session);

    const gameUsers = await ctx.db
      .query('gamePlayers')
      .withIndex('by_creation_time')
      .filter(q => q.eq(q.field('userId'), user._id))
      .collect();

    return Promise.all(
      gameUsers.map(async gu => {
        const game = await ctx.db.get(gu.gameId);
        if (!game) throw new Error('Game not found.');

        const gamePlayers = await ctx.db
          .query('gamePlayers')
          .withIndex('by_game_id', q => q.eq('gameId', game?._id))
          .collect();

        return {
          ...game,

          players: await Promise.all(
            gamePlayers.map(async gamePlayer => {
              const user = await ctx.db.get(gamePlayer.userId);
              return {
                ...toUserDto(user!),
                gamePlayerId: gamePlayer._id,
                loadout: await ctx.db.get(gamePlayer.loadoutId)
              };
            })
          )
        };
      })
    );
  }
});
