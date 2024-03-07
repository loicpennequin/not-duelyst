import type { Constructor } from '@hc/shared';
import { Interactable, type InteractableId } from './interactable';
import { GoldCoin } from './gold-coin';
import { Firewall } from './firewall';
import { Quicksands } from './quicksand';

type GenericInteractableMap = Record<InteractableId, Constructor<Interactable>>;

type ValidatedInteractableMap<T extends GenericInteractableMap> = {
  [Name in keyof T]: T[Name] extends Constructor<Interactable>
    ? Name extends InstanceType<T[Name]>['id']
      ? T[Name]
      : never
    : never;
};

const validateInteractableMap = <T extends GenericInteractableMap>(
  data: ValidatedInteractableMap<T>
) => data;

export const INTERACTABLES = validateInteractableMap({
  GOLD_COIN: GoldCoin,
  FIREWALL: Firewall,
  QUICKSANDS: Quicksands
});
