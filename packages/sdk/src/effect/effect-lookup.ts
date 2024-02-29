import { DotEffect } from './dot.effect';
import { Effect } from './effect';
import { Constructor, objectKeys } from '@hc/shared';
import { StatModifierEffect } from './stat-modifier.effect';
import { ExhaustedEffect } from './exhausted.effect';
import { TauntedEffect } from './taunted.effect';
import { ThornsEffect } from './thorns.effect';
import { RushEffect } from './rush.effect';
import { RootedEffect } from './rooted.effect';
import { ImmolateEffect } from './immolate.effect';
import { ExecuteEffect } from './execute.effect';
import { FrozenEffect } from './frozen.effect';
import { ToughEffect } from './tough.effect';
import { PlunderOnKillEffect } from './plunder-on-kill.effect';
import { VulnerableEffect } from './vulnerable.effect';

type GenericEffectMap = Record<string, Constructor<Effect>>;

type ValidatedEffectMap<T extends GenericEffectMap> = {
  [Name in keyof T]: T[Name] extends Constructor<Effect>
    ? Name extends InstanceType<T[Name]>['id']
      ? T[Name]
      : never
    : never;
};

const validateEffectMap = <T extends GenericEffectMap>(data: ValidatedEffectMap<T>) =>
  data;

export const EFFECTS = validateEffectMap({
  dot: DotEffect,
  statModifier: StatModifierEffect,
  exhausted: ExhaustedEffect,
  taunted: TauntedEffect,
  thorns: ThornsEffect,
  rush: RushEffect,
  rooted: RootedEffect,
  immolate: ImmolateEffect,
  execute: ExecuteEffect,
  frozen: FrozenEffect,
  tough: ToughEffect,
  plunderOnKill: PlunderOnKillEffect,
  vulnerable: VulnerableEffect
});

export const EFFECT_NAMES = Object.fromEntries(
  objectKeys(EFFECTS).map(k => [k.toUpperCase(), k])
) as {
  [key in Uppercase<keyof typeof EFFECTS>]: string;
};
