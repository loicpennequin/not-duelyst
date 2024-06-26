import { api } from '@game/api';
import type { GameServer, GameSocket } from './types';
import { Game } from './game';

export const handlePlayerSocket = async (
  io: GameServer,
  socket: GameSocket,
  ongoingGames: Map<string, Game>
) => {
  const roomId = socket.handshake.query.roomId as string;

  try {
    const game = await socket.data.convexClient.query(api.games.getCurrent, {
      sessionId: socket.data.sessionId
    });
    if (!game) {
      socket.disconnect();
      throw new Error('Game not found');
    }
    const map = await socket.data.convexClient.query(api.gameMaps.getById, {
      mapId: game.mapId
    });
    if (!map) {
      socket.disconnect();
      throw new Error('Map not found');
    }

    if (!ongoingGames.has(game._id)) {
      ongoingGames.set(
        game._id,
        new Game(io, socket.data.convexClient, game, map, roomId)
      );
    }

    const gameSession = ongoingGames.get(game._id)!;
    gameSession.join(socket);
  } catch (err) {
    console.error('Game error', err);
    socket.emit('error', (err as Error).message);
    socket.data.convexClient.action(api.games.cancel, { roomId });
  }
};
