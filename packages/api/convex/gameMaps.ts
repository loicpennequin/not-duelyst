import { query, mutation, internalQuery } from './_generated/server';
import { v } from 'convex/values';
import { toGameMapDto } from './gameMap/gameMap.mapper';

export const getById = query({
  args: {
    mapId: v.id('gameMaps')
  },
  handler(ctx, args) {
    return ctx.db.get(args.mapId);
  }
});

export const internalGetAll = internalQuery(async ({ db }) => {
  return db.query('gameMaps').collect();
});

export const getAll = query(async ({ db }) => {
  const maps = await db.query('gameMaps').collect();

  return maps.map(toGameMapDto);
});

export const save = mutation({
  args: {
    name: v.string(),
    width: v.number(),
    height: v.number(),
    startPositions: v.array(
      v.object({
        x: v.number(),
        y: v.number(),
        z: v.number()
      })
    ),
    interactables: v.array(
      v.object({
        position: v.object({
          x: v.number(),
          y: v.number(),
          z: v.number()
        }),
        id: v.string()
      })
    ),
    cells: v.string()
  },
  handler: async ({ db }, mapData) => {
    const map = await db
      .query('gameMaps')
      .withIndex('by_name', q => q.eq('name', mapData.name))
      .unique();

    if (!map) {
      return db.insert('gameMaps', mapData);
    } else {
      return db.patch(map._id, mapData);
    }
  }
});
