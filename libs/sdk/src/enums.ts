import { Values } from '@hc/shared';

export const RARITY = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary'
} as const;

export type Rarity = Values<typeof RARITY>;
