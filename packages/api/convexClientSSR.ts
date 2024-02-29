import {
  FunctionReference,
  FunctionReturnType,
  OptionalRestArgs,
  getFunctionName
} from 'convex/server';
import { ConvexClient, type ConvexClientOptions, ConvexHttpClient } from 'convex/browser';
import { Nullable, isString } from '@hc/shared';

type AuthTokenFetcher = (args: {
  forceRefreshToken: boolean;
}) => Promise<string | null | undefined>;

export class ConvexClientWithSSR extends ConvexClient {
  private httpClient: ConvexHttpClient;
  private authTokenFetcher?: AuthTokenFetcher;
  private ssrAuthToken?: Nullable<string>;
  private ssrOnTokenChange?: (isAuthenticated: boolean) => void;
  private ssrQueriesCache = new Map<string, Map<string, any>>(); // oh god

  private ssrAuthTokenPromise: Promise<string | null | undefined> | null = null;

  constructor(address: string, options: ConvexClientOptions = {}) {
    super(address, options);
    this.httpClient = new ConvexHttpClient(address);
  }

  setAuth(fetchToken: AuthTokenFetcher, onChange?: (isAuthenticated: boolean) => void) {
    super.setAuth(fetchToken, onChange);
    this.authTokenFetcher = fetchToken;
    this.ssrOnTokenChange = onChange;
  }

  private fetchAuthTokenSSR() {
    if (!this.ssrAuthTokenPromise) {
      this.ssrAuthTokenPromise = this.authTokenFetcher!({ forceRefreshToken: true });
    }

    return this.ssrAuthTokenPromise;
  }

  async querySSR<Query extends FunctionReference<'query'>>(
    query: Query,
    ...args: OptionalRestArgs<Query>
  ): Promise<FunctionReturnType<Query>> {
    const queryName = getFunctionName(query);

    if (!this.ssrQueriesCache.has(queryName)) {
      this.ssrQueriesCache.set(queryName, new Map());
    }
    const cache = this.ssrQueriesCache.get(queryName)!;

    const cacheKey = JSON.stringify(args);
    if (!cache.has(cacheKey)) {
      const promise = async () => {
        // if no third party auth provider is used, we dont need to bother wit auth
        const needToFetchToken = this.authTokenFetcher && this.ssrAuthToken === undefined;
        if (needToFetchToken) {
          this.ssrAuthToken = await this.fetchAuthTokenSSR();
          this.ssrOnTokenChange?.(isString(this.ssrAuthToken));
          if (isString(this.ssrAuthToken)) {
            this.httpClient.setAuth(this.ssrAuthToken);
          }
        }

        return this.httpClient.query(query, ...args);
      };
      cache.set(cacheKey, promise());
    }

    return cache.get(cacheKey) as Promise<FunctionReturnType<Query>>;
  }
}
