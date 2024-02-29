import { api } from '@hc/api';
import { UNITS, type SerializedGameState } from '@hc/sdk';
import { parse } from 'zipson';

export const makeDummyState = async (mapName: string): Promise<SerializedGameState> => {
  const { data: maps } = useConvexQuery(api.gameMaps.getAll, {});

  const map = computed(() => maps.value?.find(map => map.name === mapName));

  return until(map)
    .not.toBe(undefined)
    .then(() => {
      return {
        turn: 0,
        entities: [],
        history: [],
        map: {
          ...map.value!,
          cells: parse(map.value!.cells)
        },
        activePlayerId: 'Player1',
        players: [
          {
            id: 'Player1',
            name: 'Player 1',
            loadout: {
              units: {
                'air-elemental': { cooldown: 0 },
                'earth-elemental': { cooldown: 0 },
                'fire-elemental': { cooldown: 0 },
                'water-elemental': { cooldown: 0 },
                'light-elemental': { cooldown: 0 },
                'dark-elemental': { cooldown: 0 }
              }
            },
            generalId: 'dark-general',
            gold: 2
          },
          {
            id: 'Player2',
            name: 'Player 2',
            loadout: {
              units: {
                'air-elemental': { cooldown: 0 },
                'earth-elemental': { cooldown: 0 },
                'fire-elemental': { cooldown: 0 },
                'water-elemental': { cooldown: 0 },
                'light-elemental': { cooldown: 0 },
                'dark-elemental': { cooldown: 0 }
              }
            },
            generalId: 'earth-general',

            gold: 2
          }
        ]
      } as SerializedGameState;
    });
};
