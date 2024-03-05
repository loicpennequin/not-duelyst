import type { UnitBlueprint } from '../units/unit-lookup';

export type Effect = NonNullable<UnitBlueprint['effects']>[number];
