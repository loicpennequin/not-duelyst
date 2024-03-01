import { DotEffect } from './dot.effect';
import { Modifier } from './modifier';
import { Constructor, objectKeys } from '@hc/shared';
import { StatModifierModifier } from './stat-modifier.effect';
import { ExhaustedModifier } from './exhausted.effect';
import { TauntedModifier } from './taunted.effect';
import { ThornsModifier } from './thorns.effect';
import { RushModifier } from './rush.effect';
import { RootedModifier } from './rooted.effect';
import { ImmolateModifier } from './immolate.effect';
import { ExecuteModifier } from './execute.effect';
import { StunnedModifier } from './frozen.effect';
import { ToughModifier } from './tough.effect';
import { PlunderOnKillModifier } from './plunder-on-kill.effect';
import { VulnerableModifier } from './vulnerable.effect';

type GenericEffectMap = Record<string, Constructor<Modifier>>;

type ValidatedEffectMap<T extends GenericEffectMap> = {
  [Name in keyof T]: T[Name] extends Constructor<Modifier>
    ? Name extends InstanceType<T[Name]>['id']
      ? T[Name]
      : never
    : never;
};

const validateEffectMap = <T extends GenericEffectMap>(data: ValidatedEffectMap<T>) =>
  data;

export const EFFECTS = validateEffectMap({
  dot: DotEffect,
  statModifier: StatModifierModifier,
  exhausted: ExhaustedModifier,
  taunted: TauntedModifier,
  thorns: ThornsModifier,
  rush: RushModifier,
  rooted: RootedModifier,
  immolate: ImmolateModifier,
  execute: ExecuteModifier,
  frozen: StunnedModifier,
  tough: ToughModifier,
  plunderOnKill: PlunderOnKillModifier,
  vulnerable: VulnerableModifier
});

export const EFFECT_NAMES = Object.fromEntries(
  objectKeys(EFFECTS).map(k => [k.toUpperCase(), k])
) as {
  [key in Uppercase<keyof typeof EFFECTS>]: string;
};
