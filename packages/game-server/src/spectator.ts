import { api } from '@hc/api';
// eslint-disable-next-line import/no-unresolved
import { Id } from '@hc/api/convex/_generated/dataModel';
import { GameServer, GameSocket } from './types';
import { Game } from './game';

export const handleSpectatorSocket = async (
  io: GameServer,
  socket: GameSocket,
  ongoingGames: Map<string, Game>,
  gameId: Id<'games'>
) => {
  try {
    const game = await socket.data.convexClient.query(api.games.getById, {
      gameId
    });
    if (!game) {
      return socket.disconnect();
    }

    if (!ongoingGames.has(game._id)) {
      socket.disconnect();
    }

    const gameSession = ongoingGames.get(game._id)!;
    gameSession.spectate(socket);
  } catch (err) {
    console.error(err);
  }
};
