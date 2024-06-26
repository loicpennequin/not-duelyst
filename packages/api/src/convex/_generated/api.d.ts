/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * Generated by convex@1.12.0.
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as collection from "../collection.js";
import type * as featureFlags from "../featureFlags.js";
import type * as friend_usecases_sendFriendRequest from "../friend/usecases/sendFriendRequest.js";
import type * as friends from "../friends.js";
import type * as game_usecases_getAllOngoingGames from "../game/usecases/getAllOngoingGames.js";
import type * as gameMaps from "../gameMaps.js";
import type * as games from "../games.js";
import type * as hathora from "../hathora.js";
import type * as loadout from "../loadout.js";
import type * as matchmaking_matchmaking from "../matchmaking/matchmaking.js";
import type * as matchmaking from "../matchmaking.js";
import type * as users from "../users.js";
import type * as utils_ability from "../utils/ability.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  auth: typeof auth;
  collection: typeof collection;
  featureFlags: typeof featureFlags;
  "friend/usecases/sendFriendRequest": typeof friend_usecases_sendFriendRequest;
  friends: typeof friends;
  "game/usecases/getAllOngoingGames": typeof game_usecases_getAllOngoingGames;
  gameMaps: typeof gameMaps;
  games: typeof games;
  hathora: typeof hathora;
  loadout: typeof loadout;
  "matchmaking/matchmaking": typeof matchmaking_matchmaking;
  matchmaking: typeof matchmaking;
  users: typeof users;
  "utils/ability": typeof utils_ability;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
