'use node';

import { internalAction } from './_generated/server';
import { HathoraCloud } from '@hathora/cloud-sdk-typescript';
import { Region } from '@hathora/cloud-sdk-typescript/dist/sdk/models/shared';
import { v } from 'convex/values';

export const getRoomId = internalAction(async () => {
  if (!process.env.HATHORA_TOKEN) return 'dev';

  const hathoraSdk = new HathoraCloud({
    appId: process.env.HATHORA_APP_ID,
    security: {
      hathoraDevToken: process.env.HATHORA_TOKEN!
    }
  });

  const room = await hathoraSdk.roomV2.createRoom({ region: Region.London });
  if (room.statusCode !== 201) {
    throw new Error('could not get room Id from Hathora');
  }

  return room.connectionInfoV2!.roomId;
});

export const destroyRoom = internalAction({
  args: {
    roomId: v.string()
  },
  async handler(ctx, args) {
    if (!process.env.HATHORA_TOKEN) return;

    const hathoraSdk = new HathoraCloud({
      appId: process.env.HATHORA_APP_ID,
      security: {
        hathoraDevToken: process.env.HATHORA_TOKEN!
      }
    });

    await hathoraSdk.roomV2.destroyRoom(args.roomId);
  }
});
