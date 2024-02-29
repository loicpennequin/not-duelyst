import { api } from '@hc/api';
import type { CollectionItemDto } from '@hc/api/convex/collection/collection.utils';
import { UNITS, type UnitBlueprint } from '@hc/sdk';
import { FACTIONS, type FactionId } from '@hc/sdk/src/faction/faction-lookup';
import { UNIT_KIND } from '@hc/sdk/src/units/constants';

export const useCollection = () => {
  const { data: collection, isLoading: isCollectionLoading } = useConvexAuthedQuery(
    api.collection.myCollection,
    {}
  );

  const factions: FactionId[] = Object.values(FACTIONS).map(f => f.id);

  const factionFilter = ref<FactionId[]>([]);

  const allUnits = computed(() =>
    collection.value.map(item => {
      return { ...item, unit: UNITS[item.unitId] };
    })
  );

  type CollectionItemWithUnit = CollectionItemDto & { unit: UnitBlueprint };

  const sortUnitFunction = (a: CollectionItemWithUnit, b: CollectionItemWithUnit) => {
    if (a.unit.kind === UNIT_KIND.GENERAL && b.unit.kind === UNIT_KIND.SOLDIER) return -1;
    if (b.unit.kind === UNIT_KIND.GENERAL && a.unit.kind === UNIT_KIND.SOLDIER) return 1;
    const aFaction = a.unit.factions[0];
    const bFaction = b.unit.factions[0];

    const factionDiff = factions.indexOf(bFaction.id) - factions.indexOf(aFaction.id);
    if (factionDiff !== 0) return factionDiff * -1;

    return a.unit.summonCost - b.unit.summonCost;
  };

  const displayedUnits = computed(() => {
    if (!collection.value) return [];
    if (!factionFilter.value.length) return allUnits.value.sort(sortUnitFunction);

    return allUnits.value
      .filter(({ unit }) =>
        unit.factions.some(({ id }) => factionFilter.value.includes(id))
      )
      .sort(sortUnitFunction);
  });

  const { data: loadouts, isLoading: isLoadoutsLoading } = useConvexAuthedQuery(
    api.loadout.myLoadouts,
    {}
  );

  return {
    factionFilter,
    loadouts,
    isLoadoutsLoading,
    collection,
    isCollectionLoading,
    displayedUnits
  };
};
