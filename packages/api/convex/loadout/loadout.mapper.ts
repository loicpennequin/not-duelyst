import type { Id } from '../_generated/dataModel';
import type { Loadout } from './loadout.entity';

export type LoadoutDto = {
  _id: Id<'loadouts'>;
  name: string;
  generalId: string;
  unitIds: string[];
};

export const toLoadoutDto = (loadout: Loadout): LoadoutDto => {
  return {
    _id: loadout._id,
    name: loadout.name,
    generalId: loadout.generalId,
    unitIds: loadout.unitIds
  };
};
