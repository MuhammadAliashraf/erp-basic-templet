import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosRequestConfig } from 'axios';

import { httpClient, normalizeError } from '@/lib/http';
import type { ApiErrorPayload } from '@/types/api';

/**
 * RTK Query base query backed by the shared Axios instance.
 *
 * Using Axios rather than `fetchBaseQuery` means RTK Query inherits the whole
 * interceptor chain for free — auth headers, silent token refresh, correlation
 * ids and error normalisation — instead of duplicating that logic.
 */

export interface AxiosBaseQueryArgs {
  url: string;
  method?: AxiosRequestConfig['method'];
  /** Request body. Named `body` to match RTK Query conventions. */
  body?: unknown;
  params?: AxiosRequestConfig['params'];
  headers?: AxiosRequestConfig['headers'];
  responseType?: AxiosRequestConfig['responseType'];
  /** Per-request timeout override, e.g. for long-running reports. */
  timeout?: number;
}

/**
 * Errors surface as the serialisable `ApiErrorPayload`, not the `HttpError`
 * class instance: Redux state must stay serialisable for time-travel debugging
 * and state persistence.
 */
export type AxiosBaseQueryError = ApiErrorPayload;

export const axiosBaseQuery =
  (): BaseQueryFn<AxiosBaseQueryArgs | string, unknown, AxiosBaseQueryError> =>
  async (args, api) => {
    const config: AxiosRequestConfig =
      typeof args === 'string'
        ? { url: args, method: 'GET' }
        : {
            url: args.url,
            method: args.method ?? 'GET',
            data: args.body,
            params: args.params,
            headers: args.headers,
            responseType: args.responseType,
            timeout: args.timeout,
          };

    try {
      const response = await httpClient({
        ...config,
        // Lets RTK Query cancel in-flight requests when a component unmounts
        // or a query is superseded.
        signal: api.signal,
      });

      return { data: response.data };
    } catch (error) {
      return { error: normalizeError(error).toJSON() };
    }
  };
