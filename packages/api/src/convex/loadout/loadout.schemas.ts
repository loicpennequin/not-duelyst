import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const loadoutSchemas = {
  loadouts: defineTable({
    name: v.string(),
    ownerId: v.id('users'),
    cards: v.array(
      v.object({
        id: v.string(),
        pedestalId: v.string()
      })
    )
  }).index('by_owner_id', ['ownerId'])
};
