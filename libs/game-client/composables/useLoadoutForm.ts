import { api } from '@hc/api';
import type { Id } from '@hc/api/convex/_generated/dataModel';
import type { LoadoutDto } from '@hc/api/convex/loadout/loadout.mapper';
import { UNITS, type UnitBlueprint } from '@hc/sdk';
import { UNIT_KIND } from '@hc/sdk/src/units/constants';

export const useLoadoutForm = ({
  defaultName,
  maxSize,
  onSuccess
}: {
  defaultName: MaybeRefOrGetter<string>;
  maxSize: number;
  onSuccess: () => void;
}) => {
  const values = ref<{
    loadoutId?: Id<'loadouts'>;
    name: string;
    generalId: string | null;
    unitIds: Set<string>;
    // factions: [Nullable<FactionName>, Nullable<FactionName>, Nullable<FactionName>];
  }>();

  const general = computed(() =>
    values.value?.generalId ? UNITS[values.value.generalId] : null
  );

  const initEmpty = () => {
    values.value = {
      generalId: null,
      unitIds: new Set(),
      name: toValue(defaultName)
      // factions: [null, null, null]
    };
  };

  const initFromLoadout = (loadout: LoadoutDto) => {
    values.value = {
      loadoutId: loadout._id,
      generalId: loadout.generalId,
      unitIds: new Set(loadout.unitIds),
      name: loadout.name
      // factions: loadout.factions
    };
  };

  const loadoutIsFull = computed(() => values.value!.unitIds.size >= maxSize);

  const canAddUnit = (unitId: string) => {
    const unit = UNITS[unitId];

    if (!values.value) return false;
    if (values.value.generalId && unit.kind === UNIT_KIND.GENERAL && unit.id !== unitId) {
      return false;
    }

    return true;
    // const available = [...values.value.factions];

    // return unit.factions.every(faction => {
    //   const index = available.findIndex(value => value === faction.id || value === null);
    //   if (index === -1) {
    //     return false;
    //   }

    //   available.splice(index, 1);
    //   return true;
    // });
  };

  const isInLoadout = (unitId: string) => {
    if (UNITS[unitId].kind === 'GENERAL') {
      return values.value?.generalId === unitId;
    }

    return values.value?.unitIds.has(unitId);
  };

  // const updateFactions = () => {
  //   if (!values.value) return;
  //   const result: Nullable<FactionName>[] = [];

  //   const all = [...values.value.unitIds.values(), values.value.generalId].filter(
  //     isDefined
  //   );
  //   for (const unitId of all) {
  //     const available = [...result];
  //     const unit = UNITS[unitId];

  //     unit.factions.forEach(faction => {
  //       const index = available.findIndex(
  //         value => value === faction.id || value === null
  //       );
  //       if (index === -1) {
  //         result.push(faction.id);
  //       } else {
  //         available.splice(index, 1);
  //       }
  //     });

  //     const isFull = result.length == 3;
  //     if (isFull) break;
  //   }

  //   values.value.factions = result.concat(
  //     Array.from({ length: 3 - result.length }, () => null)
  //   ) as [FactionName, FactionName, FactionName];
  // };

  const toggleUnit = (unit: UnitBlueprint) => {
    if (!values.value) return;
    if (!canAddUnit(unit.id)) return;

    switch (unit.kind) {
      case 'GENERAL':
        if (isInLoadout(unit.id)) {
          values.value.generalId = null;
        } else {
          values.value.generalId = unit.id;
        }
        break;
      case 'SOLDIER':
        if (isInLoadout(unit.id)) {
          values.value.unitIds.delete(unit.id);
        } else if (!loadoutIsFull.value) {
          values.value.unitIds.add(unit.id);
        }
        break;
    }

    // updateFactions();
  };

  const { mutate: saveNewDeck, isLoading: isSavingNewDeck } = useConvexAuthedMutation(
    api.loadout.create,
    {
      onSuccess
    }
  );
  const { mutate: updateDeck, isLoading: isUpdatingDeck } = useConvexAuthedMutation(
    api.loadout.update,
    {
      onSuccess
    }
  );

  const isSaving = computed(() => isSavingNewDeck.value || isUpdatingDeck.value);

  const save = () => {
    if (!values.value) return;
    if (values.value.loadoutId) {
      updateDeck({
        loadoutId: values.value.loadoutId,
        name: values.value!.name,
        generalId: values.value.generalId!,
        units: [...values.value.unitIds]
        // factions: values.value.factions as any // @FIXME
      });
    } else {
      saveNewDeck({
        name: values.value!.name,
        generalId: values.value.generalId!,
        units: [...values.value.unitIds]
        // factions: values.value.factions as any // @FIXME
      });
    }
  };

  return {
    values,
    general,
    initEmpty,
    initFromLoadout,
    canAddUnit,
    isInLoadout,
    loadoutIsFull,
    toggleUnit,
    save,
    isSaving
  };
};
