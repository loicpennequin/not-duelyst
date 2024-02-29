import type { InjectionKey } from 'nuxt/dist/app/compat/capi';
import { ConvexClientWithSSR } from '@hc/api';

export const CONVEX_CLIENT = Symbol('convex-client') as InjectionKey<ConvexClientWithSSR>;
export const CONVEX_AUTH = Symbol('convex-auth') as InjectionKey<{
  isAuthenticated: Ref<boolean>;
  isLoading: Ref<boolean>;
  getToken(): Promise<string | null>;
}>;

export default defineNuxtPlugin(async nuxt => {
  const config = useRuntimeConfig();

  const convexClient = new ConvexClientWithSSR(config.public.convexUrl);

  nuxt.vueApp.provide(CONVEX_CLIENT, convexClient);
});
