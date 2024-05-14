import { isDefined } from '@game/shared';
import { api, internal } from './_generated/api';
import { query, internalMutation, action } from './_generated/server';
import { ensureAuthenticated, mutationWithAuth, queryWithAuth } from './auth/auth.utils';
import { toGameDto } from './game/game.mapper';
import { getCurrentGame, getGameById, getGamePlayers } from './game/game.utils';
import { toUserDto } from './users/user.mapper';
import { v } from 'convex/values';
import { toGameMapDto } from './gameMap/gameMap.mapper';

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
    await ctx.runMutation(internal.games.createReplay, {
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
    const game = await getGameById(ctx, args.gameId);
    if (!game) return null;
    return toGameDto(game);
  }
});

export const getAllOngoing = query(async ctx => {
  const games = await ctx.db
    .query('games')
    .withIndex('by_status', q => q.eq('status', 'ONGOING'))
    .collect();

  return Promise.all(
    games.map(async game => {
      return toGameDto({
        ...game,
        players: await getGamePlayers(ctx, game)
      });
    })
  );
});

export const myGameHistory = queryWithAuth({
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

export const latestGamesWithReplays = queryWithAuth({
  args: {},
  async handler(ctx) {
    const replays = await ctx.db
      .query('gameReplays')
      .withIndex('by_creation_time')
      .order('desc')
      .take(15);

    const games = await Promise.all(
      replays.map(replay => getGameById(ctx, replay.gameId))
    );

    return games.filter(isDefined).map(toGameDto);
  }
});

export const createReplay = internalMutation({
  args: {
    gameId: v.id('games'),
    replay: v.string()
  },
  async handler(ctx, args) {
    return ctx.db.insert('gameReplays', args);
  }
});

export const replayByGameId = query({
  args: { gameId: v.id('games') },
  async handler(ctx, args) {
    const replay = await ctx.db
      .query('gameReplays')
      .withIndex('by_game_id', q => q.eq('gameId', args.gameId))
      .unique();

    if (!replay) throw new Error('Replay not found.');

    const game = await ctx.db.get(replay.gameId);
    if (!game) throw new Error('Game not found.');

    const map = await ctx.db.get(game!.mapId);
    if (!map) throw new Error('Map not found.');

    return {
      game: toGameDto({
        ...game,
        players: await getGamePlayers(ctx, game)
      }),
      replay: replay.replay,
      map: toGameMapDto(map)
    };
  }
});