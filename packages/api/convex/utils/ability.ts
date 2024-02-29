import {
  type FieldMatcher,
  type MatchConditions,
  PureAbility,
  AbilityBuilder
} from '@casl/ability';

const fieldMatcher: FieldMatcher = fields => field => fields.includes(field);

const conditionsMatcher = (matchConditions: unknown) =>
  matchConditions as MatchConditions;

export const buildOptions = { fieldMatcher, conditionsMatcher };

export const createAbility = <T extends PureAbility>(
  cb: (api: Pick<AbilityBuilder<T>, 'can' | 'cannot'>) => void
): T => {
  const { can, cannot, build } = new AbilityBuilder<T>(PureAbility as any); // idk man

  cb({ can, cannot });

  return build(buildOptions);
};

export const ensureAuthorized = async (
  valueOrCb: boolean | Promise<boolean> | (() => boolean) | (() => Promise<boolean>)
) => {
  const isAuthorized =
    typeof valueOrCb === 'function' ? await valueOrCb() : await valueOrCb;
  if (!isAuthorized) throw new Error('Forbidden');
};
