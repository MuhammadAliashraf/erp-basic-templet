import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from './base-query';
import { API_TAGS } from './tags';

/**
 * The root API slice.
 *
 * There is exactly ONE `createApi` call in the application. Features attach
 * their endpoints with `apiSlice.injectEndpoints(...)`, which keeps a single
 * cache, a single middleware registration and a single set of tags — and lets
 * feature code be lazily loaded without touching the store.
 *
 * @example
 * // src/features/<name>/api/<name>.api.ts
 * export const widgetApi = apiSlice.injectEndpoints({
 *   endpoints: (build) => ({
 *     getWidgets: build.query<Widget[], void>({
 *       query: () => ({ url: '/widgets' }),
 *       providesTags: [API_TAGS.Widget],
 *     }),
 *   }),
 * });
 */
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: Object.values(API_TAGS),

  /** Server state is considered fresh for 60s across component remounts. */
  keepUnusedDataFor: 60,
  refetchOnMountOrArgChange: false,
  /** Reconnect and tab-focus refetching keep long-lived admin tabs accurate. */
  refetchOnReconnect: true,
  refetchOnFocus: false,

  endpoints: () => ({}),
});
