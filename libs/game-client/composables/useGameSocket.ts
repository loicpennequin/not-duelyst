import { io, type Socket } from 'socket.io-client';

const POLLING_INTERVAL = 3000;

export const useGameSocket = (roomId: string) => {
  const sessionId = useSessionId();
  const { $hathora } = useNuxtApp();
  const config = useRuntimeConfig();

  let socket: Socket;
  const error = ref<string>();
  const connect = async () => {
    try {
      const getUrl = async (): Promise<string> => {
        if (!config.public.hathoraAppId) {
          return 'ws://localhost:8000';
        }

        const response = await $hathora.roomV2.getConnectionInfo(roomId);
        if (response.connectionInfoV2?.status !== 'active') {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(getUrl());
            }, POLLING_INTERVAL);
          });
        }
        const exposedPort = response.connectionInfoV2!.exposedPort!;

        return `wss://${exposedPort?.host}:${exposedPort?.port}`;
      };

      const socketUrl = await getUrl();

      socket = io(socketUrl, {
        transports: ['websocket'],
        upgrade: false,
        auth: {
          token: sessionId.value
        }
      });

      socket?.on('connect_error', err => {
        console.log(err);
        error.value = err.message;
      });

      return socket;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : 'An error has occured while creatign the game room';
    }
  };

  onUnmounted(() => {
    socket?.disconnect();
  });

  return { connect, error };
};
