import type { DatabaseReader } from '../_generated/server';
import type { FeatureFlag } from './featureFlags.constants';

export const getFeatureFlag = async (db: DatabaseReader, key: FeatureFlag) => {
  const flag = await db
    .query('featureFlags')
    .filter(q => q.eq(q.field('key'), key))
    .first();

  return flag?.value;
};
