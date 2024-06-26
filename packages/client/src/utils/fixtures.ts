import { TERRAINS, type SerializedGameState } from '@game/sdk';
import { isDefined } from '@game/shared';
import { match } from 'ts-pattern';

const dirtTile = (
  x: number,
  y: number,
  z: number,
  tileBlueprintId: string | undefined
) => ({
  position: { x, y, z },
  terrain: TERRAINS.GROUND,
  spriteId: z === 0 ? 'dirt-edge' : 'dirt',
  tileBlueprintId: tileBlueprintId ?? null
});
const grassTile = (
  x: number,
  y: number,
  z: number,
  tileBlueprintId: string | undefined
) => ({
  position: { x, y, z },
  terrain: TERRAINS.GROUND,
  spriteId: z === 0 ? 'grass-edge' : 'grass',
  tileBlueprintId: tileBlueprintId ?? null
});
const waterTile = (
  x: number,
  y: number,
  z: number,
  tileBlueprintId: string | undefined
) => ({
  position: { x, y, z },
  terrain: TERRAINS.WATER,
  spriteId: 'water',
  tileBlueprintId: tileBlueprintId ?? null
});

const makeRow = (
  y: number,
  z: number,
  cells: Array<'dirt' | 'grass' | 'water' | null>,
  tiles?: Record<number, string>
) => {
  return cells
    .map((tile, index) => {
      return match(tile)
        .with('dirt', () => dirtTile(index, y, z, tiles?.[index]))
        .with('grass', () => grassTile(index, y, z, tiles?.[index]))
        .with('water', () => waterTile(index, y, z, tiles?.[index]))
        .with(null, () => undefined)
        .exhaustive();
    })
    .filter(isDefined);
};

const makeColumn = (
  x: number,
  z: number,
  cells: Array<'dirt' | 'grass' | 'water' | null>,
  tiles?: Record<number, string>
) => {
  return cells
    .map((tile, index) => {
      return match(tile)
        .with('dirt', () => dirtTile(x, index, z, tiles?.[index]))
        .with('grass', () => grassTile(x, index, z, tiles?.[index]))
        .with('water', () => waterTile(x, index, z, tiles?.[index]))
        .with(null, () => undefined)
        .exhaustive();
    })
    .filter(isDefined);
};

export const tutorialMap: SerializedGameState['map'] = {
  width: 8,
  height: 8,
  player1StartPosition: { x: 0, y: 3, z: 0 },
  player2StartPosition: { x: 7, y: 3, z: 0 },
  cells: [
    ...makeRow(0, 0, [
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass'
    ]),
    ...makeRow(1, 0, [
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass'
    ]),
    ...makeRow(2, 0, [
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass'
    ]),
    ...makeRow(3, 0, [
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass'
    ]),
    ...makeRow(4, 0, [
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass'
    ]),
    ...makeRow(5, 0, [
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass'
    ]),
    ...makeRow(6, 0, [
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass'
    ]),
    ...makeRow(7, 0, [
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass'
    ])
  ]
};

export const testMap: SerializedGameState['map'] = {
  width: 13,
  height: 9,
  player1StartPosition: { x: 0, y: 4, z: 2 },
  player2StartPosition: { x: 12, y: 4, z: 2 },
  cells: [
    // outer map
    // ...makeRow(9, 0, [
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water'
    // ]),
    // ...makeRow(10, 0, [
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water'
    // ]),
    // ...makeRow(11, 0, [
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water'
    // ]),
    // ...makeRow(12, 0, [
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water'
    // ]),
    // ...makeRow(13, 0, [
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water'
    // ]),
    // ...makeColumn(13, 0, [
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water'
    // ]),
    // ...makeColumn(14, 0, [
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water'
    // ]),
    // ...makeColumn(15, 0, [
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water'
    // ]),
    // ...makeColumn(16, 0, [
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water'
    // ]),
    // ...makeColumn(17, 0, [
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water',
    //   'water'
    // ]),
    // inner map
    ...makeRow(0, 2, [
      'dirt',
      'dirt',
      'grass',
      'dirt',
      'dirt',
      'dirt',
      'dirt',
      'dirt',
      'dirt',
      'dirt',
      'grass',
      'dirt',
      'dirt'
    ]),

    ...makeRow(1, 2, [
      'dirt',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'dirt'
    ]),

    ...makeRow(2, 2, [
      'grass',
      'grass',
      'water',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'water',
      'grass',
      'grass'
    ]),

    ...makeRow(3, 2, [
      'grass',
      'grass',
      'water',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'water',
      'grass',
      'grass'
    ]),

    ...makeRow(
      4,
      2,
      [
        'grass',
        'grass',
        'grass',
        'grass',
        'grass',
        'water',
        'water',
        'water',
        'grass',
        'grass',
        'grass',
        'grass',
        'grass'
      ]
      // { 4: 'sanctuary', 8: 'sanctuary' }
    ),

    ...makeRow(5, 2, [
      'grass',
      'grass',
      'water',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'water',
      'grass',
      'grass'
    ]),

    ...makeRow(6, 2, [
      'grass',
      'grass',
      'water',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'water',
      'grass',
      'grass'
    ]),

    ...makeRow(7, 2, [
      'dirt',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'grass',
      'dirt'
    ]),

    ...makeRow(8, 2, [
      'dirt',
      'dirt',
      'grass',
      'dirt',
      'dirt',
      'dirt',
      'dirt',
      'dirt',
      'dirt',
      'dirt',
      'grass',
      'dirt',
      'dirt'
    ]),

    ...makeRow(0, 3, [
      'grass',
      'grass',
      null,
      'grass',
      'dirt',
      'dirt',
      'dirt',
      'dirt',
      'dirt',
      'grass',
      null,
      'grass',
      'grass'
    ]),

    ...makeRow(1, 3, [
      'grass',
      null,
      null,
      null,
      null,
      'grass',
      'dirt',
      'grass',
      null,
      null,
      null,
      null,
      'grass'
    ]),

    ...makeRow(7, 3, [
      'grass',
      null,
      null,
      null,
      null,
      'grass',
      'dirt',
      'grass',
      null,
      null,
      null,
      null,
      'grass'
    ]),

    ...makeRow(8, 3, [
      'grass',
      'grass',
      null,
      'grass',
      'dirt',
      'dirt',
      'dirt',
      'dirt',
      'dirt',
      'grass',
      null,
      'grass',
      'grass'
    ]),

    ...makeRow(0, 4, [
      null,
      null,
      null,
      null,
      'grass',
      'grass',
      'dirt',
      'grass',
      'grass',
      null,
      null,
      null,
      null
    ]),

    ...makeRow(1, 4, [
      null,
      null,
      null,
      null,
      null,
      null,
      'grass',
      null,
      null,
      null,
      null,
      null,
      null
    ]),

    ...makeRow(7, 4, [
      null,
      null,
      null,
      null,
      null,
      null,
      'grass',
      null,
      null,
      null,
      null,
      null,
      null
    ]),

    ...makeRow(8, 4, [
      null,
      null,
      null,
      null,
      'grass',
      'grass',
      'dirt',
      'grass',
      'grass',
      null,
      null,
      null,
      null
    ]),

    ...makeRow(
      0,
      5,
      [null, null, null, null, null, null, 'grass', null, null, null, null, null, null],
      { 6: 'gold_coin' }
    ),

    ...makeRow(
      8,
      5,
      [null, null, null, null, null, null, 'grass', null, null, null, null, null, null],
      { 6: 'gold_coin' }
    )
  ]
};
