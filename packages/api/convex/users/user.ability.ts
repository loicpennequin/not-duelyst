import { PureAbility } from '@casl/ability';
import type { User } from './user.entity';
import { createAbility } from '../utils/ability';
import type { Session } from 'lucia';
import { Nullable } from '@hc/shared';

type UserActions = 'read' | 'edit' | 'create';

type Abilities = [UserActions, 'user' | User];

export type UserAbility = PureAbility<Abilities>;

const unAuthenticatedAbility = createAbility<UserAbility>(({ can }) => {
  can('read', 'user');
});

const onboardingAbility = createAbility<UserAbility>(({ can }) => {
  can('create', 'user');
});

export const createUserAbility = async (
  session: Nullable<Session>
): Promise<UserAbility> => {
  if (!session) return unAuthenticatedAbility;

  if (!session.user.name) return onboardingAbility;

  return createAbility<UserAbility>(({ can }) => {
    can('read', 'user');
    can('edit', 'user', (subject: User) => {
      return subject._id === session.user._id;
    });
  });
};
