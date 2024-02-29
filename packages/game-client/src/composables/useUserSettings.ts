import { api } from '@hc/api';
import { merge } from 'lodash-es';
import type { Settings } from '../utils/settings';

export const useUserSettings = () => {
  const { data: settings } = useConvexAuthedQuery(api.users.settings, {});

  return computed(() => merge(defaultSettings, settings.value) as Settings);
};
