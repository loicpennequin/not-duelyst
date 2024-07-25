import { keyBy } from 'lodash-es';
import type { CardBlueprintId } from './card';
import type { GenericSerializedBlueprint, SerializedBlueprint } from './card-blueprint';
import { f1General } from './cards/faction_1/general';
import { f2General } from './cards/faction_2/general';
import { neutralHealingMystic } from './cards/neutral/neutral_healing_mystic';
import { neutralRiftWalker } from './cards/neutral/neutral_rift_walker';
import { f1TrueStrike } from './cards/faction_1/true_strike';
import { f1SunstoneBracers } from './cards/faction_1/sunstone_bracers';
import { f1WindbladeAdept } from './cards/faction_1/windblade_adept';
import { neutralPrimusShieldMaster } from './cards/neutral/neutral_primus-shieldmaster';
import { f1SilverguardKnight } from './cards/faction_1/silverguard_knight';
import { f1AzuriteLion } from './cards/faction_1/azurite_lion';
import { f1Martyrdom } from './cards/faction_1/martyrdom';
import { f1LionheartBlessing } from './cards/faction_1/lionheart_blessing';
import { f1IroncliffeGuardian } from './cards/faction_1/ironcliffe_guardian';
import { f1SilverguardSquire } from './cards/faction_1/silverguard_squire';
import { f1ArclyteSentinel } from './cards/faction_1/arclyte_sentinel';
import { f1Lightchaser } from './cards/faction_1/lightchaser';
import { f1Sunriser } from './cards/faction_1/sunriser';
import { f1SuntideMaiden } from './cards/faction_1/suntide_mainden';
import { f1LysianBrawler } from './cards/faction_1/lysian_brawler';
import { f1SecondSun } from './cards/faction_1/second_sun';
import { f1Tempest } from './cards/faction_1/tempest';
import { f1HolyImmolation } from './cards/faction_1/holy_immolation';
import { f1DivineBond } from './cards/faction_1/divine_bond';
import { f1SundropElixir } from './cards/faction_1/sundrop_elixir';
import { f1LastingJudgement } from './cards/faction_1/lasting_judgment';
import { f1ArclyteRegalia } from './cards/faction_1/arclyte_regalia';
import { f1CircleOfLife } from './cards/faction_1/circle_of_life';
import { f1WarSurge } from './cards/faction_1/war_surge';
import { f1SunBloom } from './cards/faction_1/sun_bloom';
import { f1ElyxStormblade } from './cards/faction_1/elyx_stormBlade';

const allCards: SerializedBlueprint<any>[] = [
  f1General,
  f2General,
  f1IroncliffeGuardian,
  f1TrueStrike,
  f1LionheartBlessing,
  f1Martyrdom,
  f1SunstoneBracers,
  f1SilverguardKnight,
  f1WindbladeAdept,
  f1AzuriteLion,
  f1SilverguardSquire,
  f1ArclyteSentinel,
  f1Lightchaser,
  f1Sunriser,
  f1LysianBrawler,
  f1SecondSun,
  f1Tempest,
  f1HolyImmolation,
  f1DivineBond,
  f1SundropElixir,
  f1SuntideMaiden,
  f1LastingJudgement,
  f1ArclyteRegalia,
  f1CircleOfLife,
  f1WarSurge,
  f1SunBloom,
  f1ElyxStormblade,
  neutralHealingMystic,
  neutralRiftWalker,
  neutralPrimusShieldMaster
];

export const CARDS = keyBy(allCards, 'id') as Record<
  CardBlueprintId,
  GenericSerializedBlueprint
>;
