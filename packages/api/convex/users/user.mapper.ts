import type { Id } from '../_generated/dataModel';
import type { User } from './user.entity';

export type UserDto = {
  _id: Id<'users'>;
  _creationTime: number;
  name: string;
  fullName: string;
  discriminator?: string;
  hasOnboarded: boolean;
  mmr: number;
};

export const toUserDto = (user: User): UserDto => {
  return {
    _id: user._id,
    _creationTime: user._creationTime,
    hasOnboarded: !!user.name,
    name: user.name ?? 'Anonymous',
    discriminator: user.discriminator,
    fullName: `${user.name}#${user.discriminator}`,
    mmr: user.mmr
  };
};
