import { BurnModifier } from './burn.modifier';
import { Modifier } from './modifier';
import { Constructor, objectKeys } from '@hc/shared';
import { StatModifierModifier } from './stat-modifier.modifier';
import { ExhaustedModifier } from './exhausted.modifier';
import { TauntedModifier } from './taunted.modifier';
import { ThornsModifier } from './thorns.modifier';
import { RushModifier } from './rush.modifier';
import { RootedModifier } from './rooted.modifier';
import { ExecuteModifier } from './execute.modifier';
import { StunnedModifier } from './frozen.modifier';
import { ToughModifier } from './tough.modifier';
import { PlunderOnKillModifier } from './plunder-on-kill.modifier';
import { VulnerableModifier } from './vulnerable.modifier';
import { AuraBurnModifier } from './aura-burn.modifier';

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
  burn: BurnModifier,
  statModifier: StatModifierModifier,
  exhausted: ExhaustedModifier,
  taunted: TauntedModifier,
  thorns: ThornsModifier,
  rush: RushModifier,
  rooted: RootedModifier,
  auraBurn: AuraBurnModifier,
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
