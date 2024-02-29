import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { api } from '@hc/api';
import { ConvexHttpClient } from 'convex/browser';
import { handlePlayerSocket } from './player';
import { handleSpectatorSocket } from './spectator';
// eslint-disable-next-line import/no-unresolved
import { Id } from '@hc/api/convex/_generated/dataModel';
import { Game } from './game';
import { GameServer } from './types';

const PORT = process.env.PORT || 8000;

async function main() {
  const ongoingGames = new Map<string, Game>();
  try {
    const httpServer = createServer();
    const io: GameServer = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    httpServer.listen(PORT);

    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        const client = new ConvexHttpClient(process.env.CONVEX_URL!);

        console.log('new connection', token);
        const user = await client.query(api.users.me, { sessionId: token });
        if (!user) return next(new Error('Unauthorized'));

        socket.data.convexClient = client;
        socket.data.user = user;
        socket.data.sessionId = token;
        next();
      } catch (err) {
        console.error(err);
        next(new Error('Unauthorized'));
      }
    });

    io.on('connection', async socket => {
      const spectator = socket.handshake.query.spectator;
      const isSpectator = spectator === 'true';

      const gameId = socket.handshake.query.gameId as Id<'games'>;

      if (!isSpectator) {
        handlePlayerSocket(io, socket, ongoingGames);
      } else {
        handleSpectatorSocket(io, socket, ongoingGames, gameId);
      }
    });

    console.log(`Server running on port ${PORT}`);
  } catch (err) {
    console.error(`Process error: shutting down all ongoing games`);
    console.error(err);
    await Promise.all([...ongoingGames.values()].map(game => game.shutdown()));
    process.exit(0);
  }
}

main();
