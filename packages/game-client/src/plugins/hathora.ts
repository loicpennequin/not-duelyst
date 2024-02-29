import { HathoraCloud } from '@hathora/cloud-sdk-typescript';

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig();

  return {
    provide: {
      hathora: new HathoraCloud({
        appId: config.public.hathoraAppId
      })
    }
  };
});
