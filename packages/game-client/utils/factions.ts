import { FACTION_NAMES, type FactionName } from '@hc/sdk/src/faction/faction-lookup';

import havenBorder from '../assets/ui{m}/icon-border-haven.png';
import chaosBorder from '../assets/ui{m}/icon-border-chaos.png';
import neutralBorder from '../assets/ui{m}/icon-border-neutral.png';

import havenBorderRounded from '../assets/ui{m}/icon-border-haven-rounded.png';
import chaosBorderRounded from '../assets/ui{m}/icon-border-chaos-rounded.png';
import neutralBorderRounded from '../assets/ui{m}/icon-border-neutral-rounded.png';

type FactionUtils = {
  borders: {
    square: string;
    rounded: string;
  };
};

export const factionUtils: Record<FactionName, FactionUtils> = {
  [FACTION_NAMES.HAVEN]: {
    borders: {
      square: havenBorder,
      rounded: havenBorderRounded
    }
  },
  [FACTION_NAMES.CHAOS]: {
    borders: {
      square: chaosBorder,
      rounded: chaosBorderRounded
    }
  },
  [FACTION_NAMES.NEUTRAL]: {
    borders: {
      square: neutralBorder,
      rounded: neutralBorderRounded
    }
  }
};
