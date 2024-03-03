import { MODIFIERS } from '@hc/sdk';
import type { AnyObject, PartialRecord } from '@hc/shared';
import { AdjustmentFilter } from '@pixi/filter-adjustment';
import { ColorOverlayFilter } from '@pixi/filter-color-overlay';
import { Filter, Ticker } from 'pixi.js';
import fireFrag from '@/shaders/fire.frag.glsl';
import iceFrag from '@/shaders/ice.frag.glsl';

export const makeBurnFilter = () => {
  const uniforms: AnyObject = {};
  uniforms.shift = 1.6;
  uniforms.time = 0.0;
  uniforms.speed = { x: 0.7, y: 0.4 };

  let time = 0;

  const filter = new Filter(undefined, fireFrag, uniforms);
  Ticker.shared.add(() => {
    time = time + 0.03;
    uniforms.time = time;
  });

  return filter;
};

export const makeIceFilter = () => {
  const uniforms: AnyObject = {};
  uniforms.time = 0.0;

  let time = 0;

  const filter = new Filter(undefined, iceFrag, uniforms);
  Ticker.shared.add(() => {
    time = time + 0.02;
    uniforms.time = time;
  });

  return filter;
};

export const MODIFIER_FILTERS = {
  exhausted: () => [new AdjustmentFilter({ saturation: 0.3 })],
  frozen: () => [new ColorOverlayFilter(0x66aadd, 0.4), makeIceFilter()],
  taunted: () => [new ColorOverlayFilter(0x770000, 0.25)],
  burn: () => [makeBurnFilter()]
} as const satisfies PartialRecord<keyof typeof MODIFIERS, () => Filter[]>;
