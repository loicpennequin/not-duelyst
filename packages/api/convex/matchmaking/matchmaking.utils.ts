// eslint-disable-next-line import/no-unresolved
import { internal } from '../_generated/api';
import type { Doc, Id } from '../_generated/dataModel';
import type { ActionCtx, DatabaseWriter, MutationCtx } from '../_generated/server';
import { MATCHMAKING_SCHEDULER_INTERVAL_MS } from './matchmaking.constants';

export const getMatchmaking = async (db: DatabaseWriter): Promise<Doc<'matchmaking'>> => {
  let matchmaking = await db.query('matchmaking').first();
  if (!matchmaking) {
    const id = await db.insert('matchmaking', {
      nextInvocationId: undefined
    });
    matchmaking = await db.get(id)!;
  }

  return matchmaking!;
};

export const startMatchmakingIfNeeded = async ({
  db,
  scheduler
}: Pick<MutationCtx, 'db' | 'scheduler'>) => {
  const matchmaking = await getMatchmaking(db);
  if (!matchmaking.nextInvocationId) {
    const next = await scheduler.runAfter(0, internal.matchmaking.matchPlayers);
    await db.patch(matchmaking._id, { nextInvocationId: next });
  }
};

export const ensureIsInMatchmaking = async (
  { db }: Pick<MutationCtx, 'db'>,
  userId: Id<'users'>
) => {
  const matchmakingUser = await db
    .query('matchmakingUsers')
    .withIndex('by_userId', q => q.eq('userId', userId))
    .unique();

  if (!matchmakingUser) throw new Error('User is not in matchmaking');

  return matchmakingUser;
};

export const ensureIsNotInMatchmaking = async (
  { db }: Pick<MutationCtx, 'db'>,
  userId: Id<'users'>
) => {
  const matchmakingUser = await db
    .query('matchmakingUsers')
    .withIndex('by_userId', q => q.eq('userId', userId))
    .unique();

  if (matchmakingUser) throw new Error('User is already in matchmaking');
};

export const createGameFromMatchmadePair = async (
  ctx: ActionCtx,
  pair: {
    userId: Id<'users'>;
    matchmakingUserId: Id<'matchmakingUsers'>;
    loadoutId: Id<'loadouts'>;
  }[]
) => {
  const roomId = await ctx.runAction(internal.hathora.getRoomId);
  await ctx.runMutation(internal.matchmaking.handleMatchmadePair, {
    roomId,
    players: pair
  });
};

export const scheduleNextMatchmakingInvocation = async (
  ctx: ActionCtx,
  remaining: number
) => {
  const nextInvocationId =
    remaining > 1
      ? await ctx.scheduler.runAfter(
          MATCHMAKING_SCHEDULER_INTERVAL_MS,
          internal.matchmaking.matchPlayers
        )
      : undefined;

  await ctx.runMutation(internal.matchmaking.setupNextInvocation, {
    schedulerId: nextInvocationId
  });
};
