import { MODIFIERS } from '@hc/sdk';
import type { AnyObject, PartialRecord } from '@hc/shared';
import { AdjustmentFilter } from '@pixi/filter-adjustment';
import { ColorOverlayFilter } from '@pixi/filter-color-overlay';
import { Filter, Ticker, BLEND_MODES } from 'pixi.js';
import testFrag from '@/shaders/fire.frag.glsl';

const makeBurnFilter = () => {
  const uniforms: AnyObject = {};
  uniforms.alpha = 1.0;
  uniforms.shift = 1.6;
  uniforms.time = 0.0;
  uniforms.speed = { x: 0.7, y: 0.4 };

  let count = 0;

  const filter = new Filter(undefined, testFrag, uniforms);
  Ticker.shared.add(() => {
    count = count + 0.02;
    uniforms.time = count;
  });

  return filter;
};

export const MODIFIER_FILTERS = {
  exhausted: () => [new AdjustmentFilter({ saturation: 0.3 })],
  frozen: () => [new ColorOverlayFilter(0x66aadd, 0.4)],
  taunted: () => [new ColorOverlayFilter(0x770000, 0.25)],
  burn: () => [makeBurnFilter()]
} as const satisfies PartialRecord<keyof typeof MODIFIERS, () => Filter[]>;
