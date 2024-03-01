import type { SerializedGameState } from '@hc/sdk';

export const useSandboxState = () => {
  const state = useLocalStorage<SerializedGameState | null>('sandbox-state', null, {
    serializer: {
      read: val => JSON.parse(val),
      write: val => {
        return JSON.stringify(val);
      }
    }
  });

  return state;
};
