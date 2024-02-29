import type { EFFECTS } from '@hc/sdk';
import type { PartialRecord } from '@hc/shared';
import { AdjustmentFilter } from '@pixi/filter-adjustment';
import { ColorOverlayFilter } from '@pixi/filter-color-overlay';
import type { Filter } from 'pixi.js';

export const EFFECT_FILTERS = {
  exhausted: [new AdjustmentFilter({ saturation: 0.3 })],
  frozen: [new ColorOverlayFilter(0x66aadd, 0.4)],
  taunted: [new ColorOverlayFilter(0x770000, 0.25)]
} as const satisfies PartialRecord<keyof typeof EFFECTS, Filter[]>;
