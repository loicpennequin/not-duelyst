import { v } from 'convex/values';
import { internalMutation, query } from './_generated/server';
import { toUserDto } from './users/user.mapper';

export const createReplay = internalMutation({
  args: {
    gameId: v.id('games'),
    replay: v.string()
  },
  async handler(ctx, args) {
    return ctx.db.insert('gameReplays', args);
  }
});

export const byGameId = query({
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

    const gamePlayers = await ctx.db
      .query('gamePlayers')
      .withIndex('by_game_id', q => q.eq('gameId', game!._id))
      .collect();

    return {
      game: {
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
      },
      map,
      replay
    };
  }
});
