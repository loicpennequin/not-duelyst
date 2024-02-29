import type { Id } from '../_generated/dataModel';
import type { GameMap } from './gameMap.entity';
import { Point3D } from '@hc/sdk';

export type GameMapDto = {
  id: Id<'gameMaps'>;
  cells: string;
  height: number;
  width: number;
  startPositions: [Point3D, Point3D];
  interactables: { position: Point3D; id: string }[];
  name: string;
};

export const toGameMapDto = (gameMap: GameMap): GameMapDto => {
  return {
    id: gameMap._id,
    cells: gameMap.cells,
    height: gameMap.height,
    width: gameMap.width,
    startPositions: gameMap.startPositions as [Point3D, Point3D],
    name: gameMap.name,
    interactables: gameMap.interactables
  };
};
