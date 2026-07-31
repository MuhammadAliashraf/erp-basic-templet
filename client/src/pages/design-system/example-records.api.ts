import { API_TAGS, apiSlice, providesList } from '@/lib/api';
import type { ListQueryParams, PaginatedResponse } from '@/types/api';

/**
 * Endpoint used by the data-table reference page.
 *
 * This is the shape every list endpoint in a product should have: query params
 * in, `PaginatedResponse` out, tagged so a mutation elsewhere can invalidate
 * the list without knowing who is rendering it.
 *
 * Delete alongside the reference page when forking the template.
 */

export interface ExampleRecord {
  id: string;
  name: string;
  email: string;
  department: string;
  status: 'active' | 'pending' | 'suspended' | 'archived';
  updatedAt: string;
}

export const exampleRecordsApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getExampleRecords: build.query<PaginatedResponse<ExampleRecord>, ListQueryParams>({
      query: (params) => ({
        url: '/example-records',
        params,
      }),
      providesTags: (result) => providesList(result?.data, API_TAGS.Entity),
      // Keeps the previous page on screen while the next one loads, instead of
      // flashing an empty table on every page change.
      keepUnusedDataFor: 120,
    }),
  }),
  overrideExisting: false,
});

export const { useGetExampleRecordsQuery } = exampleRecordsApi;
