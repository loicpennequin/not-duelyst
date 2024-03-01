import { io, type Socket } from 'socket.io-client';

const POLLING_INTERVAL = 3000;

export const useGameSocket = (
  roomId: string,
  gameId: MaybeRefOrGetter<string | undefined>,
  { spectator }: { spectator: boolean }
) => {
  const sessionId = useSessionId();
  const { $hathora } = useNuxtApp();
  const config = useRuntimeConfig();

  const _gameId = computed(() => toValue(gameId));

  let socket: Socket;
  const error = ref<string>();
  const connect = async () => {
    try {
      await until(_gameId).not.toBe(undefined);

      const getUrl = async (): Promise<string> => {
        if (!config.public.hathoraAppId) {
          return `ws://localhost:8000?spectator=${spectator}&gameId=${_gameId.value}`;
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

        return `wss://${exposedPort?.host}:${exposedPort?.port}?spectator=${spectator}&roomId=${roomId}&gameId=${_gameId.value}`;
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
      console.log(err);
      error.value =
        err instanceof Error
          ? err.message
          : 'An error has occured while creating the game room';
    }
  };

  onUnmounted(() => {
    socket?.disconnect();
  });

  return { connect, error };
};
