import type { Doc } from '../_generated/dataModel';

export type User = Omit<Doc<'users'>, 'id'>;
