import type { SerializedGameState } from '@hc/sdk';

const width = 5;
const height = 5;
// const mapLayout = Array.from({ length: height }, (_, y) =>
//   Array.from({ length: width }, (_, x) => ({
//     position: { x, y, z: 0 },
//     tileId: x === 0 || y === 0 ? ('water' as const) : ('grass' as const)
//   }))
// ).flat();

export const dummyState: SerializedGameState = {
  entities: [],
  history: [],
  map: {
    width,
    height,
    startPositions: [
      { x: 4, y: 2, z: 1 },
      { x: 4, y: 3, z: 1 }
    ],
    // cells: mapLayout
    cells: [
      { position: { x: 0, y: 0, z: 0 }, tileId: 'placeholder-ground' },
      { position: { x: 1, y: 0, z: 0 }, tileId: 'placeholder-ground' },
      { position: { x: 2, y: 0, z: 0 }, tileId: 'placeholder-water' },
      { position: { x: 3, y: 0, z: 0 }, tileId: 'placeholder-water' },
      { position: { x: 4, y: 0, z: 0 }, tileId: 'placeholder-ground' },
      { position: { x: 0, y: 1, z: 0 }, tileId: 'placeholder-ground' },
      { position: { x: 1, y: 1, z: 0 }, tileId: 'placeholder-ground' },
      { position: { x: 2, y: 1, z: 0 }, tileId: 'placeholder-ground' },
      { position: { x: 3, y: 1, z: 0 }, tileId: 'placeholder-ground' },
      { position: { x: 4, y: 1, z: 0 }, tileId: 'placeholder-ground' },
      { position: { x: 0, y: 2, z: 0 }, tileId: 'placeholder-ground' },
      { position: { x: 1, y: 2, z: 0 }, tileId: 'placeholder-ground' },
      { position: { x: 2, y: 2, z: 0 }, tileId: 'placeholder-ground' },
      { position: { x: 3, y: 2, z: 0 }, tileId: 'placeholder-ground' },
      { position: { x: 4, y: 2, z: 0 }, tileId: 'placeholder-ground' },
      { position: { x: 0, y: 3, z: 0 }, tileId: 'placeholder-ground' },
      { position: { x: 1, y: 3, z: 0 }, tileId: 'placeholder-ground' },
      { position: { x: 2, y: 3, z: 0 }, tileId: 'placeholder-ground' },
      { position: { x: 3, y: 3, z: 0 }, tileId: 'placeholder-ground' },
      { position: { x: 4, y: 3, z: 0 }, tileId: 'placeholder-ground' },
      { position: { x: 0, y: 4, z: 0 }, tileId: 'placeholder-ground' },
      { position: { x: 1, y: 4, z: 0 }, tileId: 'placeholder-ground' },
      { position: { x: 2, y: 4, z: 0 }, tileId: 'placeholder-ground' },
      { position: { x: 3, y: 4, z: 0 }, tileId: 'placeholder-ground' },
      { position: { x: 4, y: 4, z: 0 }, tileId: 'placeholder-ground' },

      { position: { x: 0, y: 1, z: 1 }, tileId: 'placeholder-ground-half' },
      { position: { x: 1, y: 1, z: 1 }, tileId: 'placeholder-ground' },
      { position: { x: 2, y: 1, z: 1 }, tileId: 'placeholder-ground-half' },
      { position: { x: 3, y: 1, z: 1 }, tileId: 'placeholder-ground-half' },
      { position: { x: 4, y: 1, z: 1 }, tileId: 'placeholder-ground-half' },
      { position: { x: 0, y: 2, z: 1 }, tileId: 'placeholder-ground' },
      { position: { x: 1, y: 2, z: 1 }, tileId: 'placeholder-ground' },
      { position: { x: 2, y: 2, z: 1 }, tileId: 'placeholder-ground' },
      { position: { x: 3, y: 2, z: 1 }, tileId: 'placeholder-ground' },
      { position: { x: 4, y: 2, z: 1 }, tileId: 'placeholder-ground' },
      { position: { x: 0, y: 3, z: 1 }, tileId: 'placeholder-ground' },
      { position: { x: 1, y: 3, z: 1 }, tileId: 'placeholder-ground' },
      { position: { x: 2, y: 3, z: 1 }, tileId: 'placeholder-ground' },
      { position: { x: 3, y: 3, z: 1 }, tileId: 'placeholder-ground' },
      { position: { x: 4, y: 3, z: 1 }, tileId: 'placeholder-ground' },
      { position: { x: 0, y: 4, z: 1 }, tileId: 'placeholder-ground' },
      { position: { x: 1, y: 4, z: 1 }, tileId: 'placeholder-ground' },
      { position: { x: 2, y: 4, z: 1 }, tileId: 'placeholder-ground' },
      { position: { x: 3, y: 4, z: 1 }, tileId: 'placeholder-ground' },
      { position: { x: 4, y: 4, z: 1 }, tileId: 'placeholder-ground' },

      { position: { x: 1, y: 1, z: 2 }, tileId: 'placeholder-ground' },
      { position: { x: 1, y: 2, z: 2 }, tileId: 'placeholder-ground-half' }
    ]
  },
  players: [
    {
      id: 'Player1',
      loadout: {
        units: {
          haven_soldier_1: { cooldown: 0 }
        }
      },
      generalId: 'haven_general_1'
    },
    {
      id: 'Player2',
      loadout: {
        units: {
          haven_soldier_1: { cooldown: 0 }
        }
      },
      generalId: 'haven_general_1'
    }
  ]
};
