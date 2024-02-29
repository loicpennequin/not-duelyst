import { UserDto } from '@hc/api';
import { Server, Socket } from 'socket.io';
import { ConvexHttpClient } from 'convex/browser';

type SocketData = {
  convexClient: ConvexHttpClient;
  user: UserDto;
  sessionId: string;
};

export type GameServer = Server<any, any, Record<string, never>, SocketData>;

export type GameSocket = Socket<any, any, Record<string, never>, SocketData>;
