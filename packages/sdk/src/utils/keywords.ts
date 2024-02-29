export type Keyword = {
  name: string;
  description: string;
};

export const KEYWORDS = {
  EXHAUSTED: {
    name: 'Exhausted',
    description: 'This unit has already acted this turn and cannot act again'
  },
  RUSH: {
    name: 'Rush',
    description: 'This unit can move and use abilities the turn it is summoned.'
  },
  SWIFT: {
    name: 'Swift',
    description: "This skill doesn't prevent movement"
  },
  SECOND_WIND: {
    name: 'Swift',
    description: "This skill doesn't exhaust its caster."
  },
  BURN: {
    name: 'Burn(x)',
    description: 'This unit X receives damage at the beginning of its turn.'
  },
  REGENRATION: {
    name: 'Regeneration(X)',
    description: 'This unit recovers X hp at the beginning of its turn.'
  },
  TOUGH: {
    name: 'Tough',
    description: 'This unit takes 1 less damage from all sources (min. 1).'
  },
  VULNERABLE: {
    name: 'Vulnerable',
    description: 'This unit takes 1 more damage from all sources.'
  },
  TAUNT: {
    name: 'Taunt',
    description: 'Nearby enemies cannot move and must target this unit.'
  },
  STUN: {
    name: 'Stun(x)',
    description: 'This unit cannot move or use abilities for X turns.'
  },
  THORNS: {
    name: 'Thorns(x)',
    description: 'Enemies unit dealing damage to this unit take X damage.'
  },
  ON_SUMMONED: {
    name: 'Summon',
    description: 'Triggers when the unit enters the battlefield.'
  },
  ON_DEATH: {
    name: 'Last will',
    description: 'Triggers when the unit is destroyed.'
  },
  PLUNDER: {
    name: 'Plunder(x)',
    description: 'Gain X gold when the condition is met.'
  },
  VIGILANT: {
    name: 'Vigilant',
    description: 'This unit does not exhaust when retaliating.'
  },
  DAUNTING: {
    name: 'Daunting',
    description: 'Prevents targeted units from retaliating.'
  },
  SHELL: {
    name: 'Shell',
    description: 'Prevents the next source of damage dealt to this unit.'
  },
  ISOLATED: {
    name: 'Isolated',
    description: 'Triggers when this unit has no nearby allies.'
  },
  FERVOR: {
    name: 'Fervor',
    description: 'Triggers when this unit is nearby its general.'
  },
  AURA: {
    name: 'Aura',
    description: 'Apply the effect to all nearby units.'
  },
  SLAY: {
    name: 'Slay',
    description: 'Triggers when this unit destroys another.'
  }
} satisfies Record<string, Keyword>;
