import { localStorageService, StorageKeys } from '@/lib/storage';

/**
 * Holds the bearer tokens for the HTTP layer.
 *
 * Deliberately *not* a Redux slice: the Axios interceptor must read tokens
 * synchronously without importing the store, which would create a circular
 * dependency (store -> api slice -> axios -> store). The auth feature keeps
 * this in sync and Redux remains the source of truth for the *user*.
 *
 * Security note: with `authStrategy === 'cookie'` this store stays empty and
 * the browser handles httpOnly cookies, which is the stronger option. Bearer
 * tokens in localStorage are readable by any script on the origin — acceptable
 * only when the app has a strict CSP and no untrusted third-party scripts.
 */

interface Tokens {
  accessToken: string | null;
  refreshToken: string | null;
}

let memoryTokens: Tokens = {
  accessToken: localStorageService.get<string | null>(StorageKeys.accessToken, null),
  refreshToken: localStorageService.get<string | null>(StorageKeys.refreshToken, null),
};

/** Notified when tokens are cleared, so the app can force a logout. */
type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

export const tokenStore = {
  getAccessToken(): string | null {
    return memoryTokens.accessToken;
  },

  getRefreshToken(): string | null {
    return memoryTokens.refreshToken;
  },

  set(tokens: Partial<Tokens>): void {
    memoryTokens = { ...memoryTokens, ...tokens };

    if (tokens.accessToken !== undefined) {
      if (tokens.accessToken) {
        localStorageService.set(StorageKeys.accessToken, tokens.accessToken);
      } else {
        localStorageService.remove(StorageKeys.accessToken);
      }
    }

    if (tokens.refreshToken !== undefined) {
      if (tokens.refreshToken) {
        localStorageService.set(StorageKeys.refreshToken, tokens.refreshToken);
      } else {
        localStorageService.remove(StorageKeys.refreshToken);
      }
    }
  },

  clear(): void {
    memoryTokens = { accessToken: null, refreshToken: null };
    localStorageService.remove(StorageKeys.accessToken);
    localStorageService.remove(StorageKeys.refreshToken);
    localStorageService.remove(StorageKeys.user);
  },

  /** Registered once by the auth feature at startup. */
  setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
    onUnauthorized = handler;
  },

  /** Called by the Axios interceptor when refreshing is no longer possible. */
  notifyUnauthorized(): void {
    this.clear();
    onUnauthorized?.();
  },
};
