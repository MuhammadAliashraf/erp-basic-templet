import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

import { appConfig } from '@/config/app.config';
import { env } from '@/config/env';

import { normalizeError } from './http-error';
import { tokenStore } from './token-store';

/**
 * The application's single Axios instance.
 *
 * Responsibilities, in order of the interceptor chain:
 *  1. attach auth credentials (bearer header or cookies);
 *  2. tag every request with a correlation id for log stitching;
 *  3. transparently refresh an expired access token, queueing concurrent 401s;
 *  4. normalise every failure into `HttpError`.
 */

/** Extra fields we set on outgoing requests. */
interface RequestConfig extends InternalAxiosRequestConfig {
  /** Guards against a refresh loop — a retried request is never retried twice. */
  _retried?: boolean;
  /** Opt out of the refresh flow (used by the refresh call itself). */
  skipAuthRefresh?: boolean;
}

export const httpClient: AxiosInstance = axios.create({
  baseURL: appConfig.api.baseUrl,
  timeout: appConfig.api.timeout,
  // Required for the cookie strategy; harmless for bearer against same origin.
  withCredentials: env.authStrategy === 'cookie',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

/* -------------------------------------------------------------------------- */
/* Request interceptor                                                        */
/* -------------------------------------------------------------------------- */

httpClient.interceptors.request.use((config: RequestConfig) => {
  if (env.authStrategy === 'bearer') {
    const accessToken = tokenStore.getAccessToken();
    if (accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  // Correlation id: lets support trace one browser action across services.
  config.headers['X-Request-Id'] = crypto.randomUUID();

  return config;
});

/* -------------------------------------------------------------------------- */
/* Response interceptor — silent token refresh                                */
/* -------------------------------------------------------------------------- */

/**
 * While a refresh is in flight, every other 401 waits on this promise instead
 * of firing its own refresh. Without this, a dashboard that fires six parallel
 * requests would trigger six refreshes and invalidate its own rotating token.
 */
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStore.getRefreshToken();

  // The cookie strategy sends the refresh cookie automatically, so an absent
  // token in memory is only fatal for the bearer strategy.
  if (env.authStrategy === 'bearer' && !refreshToken) return null;

  try {
    const response = await httpClient.post<{ accessToken: string; refreshToken?: string }>(
      '/auth/refresh',
      env.authStrategy === 'bearer' ? { refreshToken } : undefined,
      { skipAuthRefresh: true } as RequestConfig,
    );

    const { accessToken, refreshToken: rotated } = response.data;
    tokenStore.set({ accessToken, ...(rotated ? { refreshToken: rotated } : {}) });
    return accessToken;
  } catch {
    return null;
  }
}

httpClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const config = error.config as RequestConfig | undefined;
    const status = error.response?.status;

    const canAttemptRefresh =
      status === 401 && config && !config._retried && !config.skipAuthRefresh;

    if (canAttemptRefresh) {
      config._retried = true;

      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });

      const accessToken = await refreshPromise;

      if (accessToken || env.authStrategy === 'cookie') {
        if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
        return httpClient(config);
      }

      // Refresh failed: the session is genuinely over.
      tokenStore.notifyUnauthorized();
    }

    return Promise.reject(normalizeError(error));
  },
);

/* -------------------------------------------------------------------------- */
/* Convenience wrappers                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Thin typed helpers that unwrap `response.data`.
 * Prefer RTK Query for server state; reach for these only for imperative,
 * non-cacheable calls such as file downloads.
 */
export const http = {
  get: <T>(url: string, config?: Parameters<AxiosInstance['get']>[1]) =>
    httpClient.get<T>(url, config).then((response) => response.data),

  post: <T, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: Parameters<AxiosInstance['post']>[2],
  ) => httpClient.post<T>(url, body, config).then((response) => response.data),

  put: <T, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: Parameters<AxiosInstance['put']>[2],
  ) => httpClient.put<T>(url, body, config).then((response) => response.data),

  patch: <T, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: Parameters<AxiosInstance['patch']>[2],
  ) => httpClient.patch<T>(url, body, config).then((response) => response.data),

  delete: <T>(url: string, config?: Parameters<AxiosInstance['delete']>[1]) =>
    httpClient.delete<T>(url, config).then((response) => response.data),
};
