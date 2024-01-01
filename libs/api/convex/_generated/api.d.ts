/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * Generated by convex@1.6.3.
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as collection from "../collection.js";
import type * as game_utils from "../game/utils.js";
import type * as gameMaps from "../gameMaps.js";
import type * as gameReplays from "../gameReplays.js";
import type * as games from "../games.js";
import type * as hathora from "../hathora.js";
import type * as loadout from "../loadout.js";
import type * as matchmaking_matchmaking from "../matchmaking/matchmaking.js";
import type * as matchmaking from "../matchmaking.js";
import type * as users from "../users.js";
import type * as utils_ability from "../utils/ability.js";
import type * as utils_auth from "../utils/auth.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  collection: typeof collection;
  "game/utils": typeof game_utils;
  gameMaps: typeof gameMaps;
  gameReplays: typeof gameReplays;
  games: typeof games;
  hathora: typeof hathora;
  loadout: typeof loadout;
  "matchmaking/matchmaking": typeof matchmaking_matchmaking;
  matchmaking: typeof matchmaking;
  users: typeof users;
  "utils/ability": typeof utils_ability;
  "utils/auth": typeof utils_auth;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
