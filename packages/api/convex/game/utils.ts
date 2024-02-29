import { randomInt } from '@hc/shared';
import { Id } from '../_generated/dataModel';
import type { QueryCtx } from '../_generated/server';
import { GAME_STATUS } from './game.constants';
import { toUserDto } from '../users/user.mapper';

export const getCurrentGame = async (
  { db }: { db: QueryCtx['db'] },
  userId: Id<'users'>
) => {
  const currentGameUser = await db
    .query('gamePlayers')
    .withIndex('by_creation_time')
    .filter(q => q.eq(q.field('userId'), userId))
    .order('desc')
    .first();

  if (!currentGameUser) return null;

  const game = await db.get(currentGameUser?.gameId);
  if (!game) return null;
  if (game.status === 'FINISHED') return null;
  if (game.status === 'CANCELLED') return null;

  const gamePlayers = await db
    .query('gamePlayers')
    .withIndex('by_game_id', q => q.eq('gameId', game?._id))
    .collect();

  return {
    ...game,
    players: await Promise.all(
      gamePlayers.map(async gamePlayer => {
        const user = await db.get(gamePlayer.userId);
        return {
          ...toUserDto(user!),
          loadout: await db.get(gamePlayer.loadoutId)
        };
      })
    )
  };
};

export const ensureHasNoCurrentGame = async (
  { db }: { db: QueryCtx['db'] },
  userId: Id<'users'>
) => {
  const game = await getCurrentGame({ db }, userId);
  if (game && game.status !== 'CANCELLED') throw new Error('Already in game');
};

export const getGameInitialState = async (
  { db }: { db: QueryCtx['db'] },
  playerIds: Id<'users'>[]
) => {
  const maps = await db.query('gameMaps').collect();
  const firstPlayerIndex = Math.round(Math.random());
  const mapIndex = randomInt(maps.length - 1);

  return {
    firstPlayer: playerIds[firstPlayerIndex],
    mapId: maps[mapIndex]._id,
    status: GAME_STATUS.WAITING_FOR_PLAYERS
  };
};
