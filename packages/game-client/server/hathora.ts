import { HathoraCloud } from '@hathora/cloud-sdk-typescript';

const config = useRuntimeConfig();
let instance: HathoraCloud;

export const getHathoraClient = () => {
  if (!instance) {
    instance = new HathoraCloud({
      appId: config.hathoraAppId
    });
  }

  return instance;
};
