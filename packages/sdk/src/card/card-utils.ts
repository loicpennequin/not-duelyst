import { type Values } from '@game/shared';

export const CARD_KINDS = {
  MINION: 'MINION',
  GENERAL: 'GENERAL'
} as const;

export type CardKind = Values<typeof CARD_KINDS>;

export class Faction {
  constructor(
    public id: string,
    public name: string
  ) {}

  equals(faction: Faction) {
    return faction.id === this.id;
  }
}

export const FACTIONS = {
  F1: new Faction('f1', 'Life'),
  F2: new Faction('f2', 'Death'),
  F3: new Faction('f3', 'Order'),
  F4: new Faction('f4', 'Chaos'),
  F5: new Faction('f5', 'Elemental')
} as const satisfies Record<string, Faction>;

export const RARITIES = {
  BASIC: 'basic',
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
  TOKEN: 'token'
} as const;

export type Rarity = Values<typeof RARITIES>;

export const TRIBES = {
  DERVISH: 'Dervish',
  STRUCTURE: 'Structure'
} as const;

export type Tribe = Values<typeof TRIBES>;

export const INTERCEPTOR_PRIORITIES = {
  FINAL: 999
};