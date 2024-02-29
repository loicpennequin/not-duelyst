import { Values } from '@hc/shared';

export const UNIT_KIND = {
  GENERAL: 'GENERAL',
  SOLDIER: 'SOLDIER'
} as const;

export type UnitKind = Values<typeof UNIT_KIND>;
