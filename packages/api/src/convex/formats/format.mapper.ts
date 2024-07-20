import type { Override } from '@game/shared';
import type { Id } from '../_generated/dataModel';
import { toLoadoutDto } from '../loadout/loadout.mapper';
import { toUserDto, type UserDto } from '../users/user.mapper';
import type { User } from '../users/user.entity';
import type { GameSessionConfig, GenericSerializedBlueprint } from '@game/sdk';
import { toGameMapDto, type GameMapDto } from '../gameMap/gameMap.mapper';
import type { GameFormat } from './format.entity';
import type { GameMap } from '../gameMap/gameMap.entity';

export type GameFormatDto = {
  _id: Id<'formats'>;
  name: string;
  description: string;
  author: UserDto;
  config: GameSessionConfig;
  cards: Record<string, GenericSerializedBlueprint>;
  map: GameMapDto;
};

type GameFormatInput = GameFormat & { author: User; map: GameMap };

export const toGameFormatDto = (format: GameFormatInput): GameFormatDto => {
  return {
    _id: format._id,
    name: format.name,
    description: format.description,
    config: format.config,
    cards: format.cards,
    author: toUserDto(format.author),
    map: toGameMapDto(format.map)
  };
};