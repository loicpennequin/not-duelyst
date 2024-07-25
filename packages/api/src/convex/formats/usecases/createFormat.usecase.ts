import { v } from 'convex/values';
import { authedMutation } from '../../auth/auth.utils';
import { DEFAULT_MAP_ID, formatConfigValidator } from '../format.utils';

export const createFormatUsecase = authedMutation({
  args: {
    name: v.string(),
    description: v.string(),
    config: formatConfigValidator,
    cards: v.any()
  },
  async handler(ctx, args) {
    const format = await ctx.db.insert('formats', {
      ...args,
      authorId: ctx.user._id,
      cards: JSON.stringify(args.cards),
      mapId: DEFAULT_MAP_ID
    });

    return format;
  }
});
