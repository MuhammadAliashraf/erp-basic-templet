import { API_TAGS, apiSlice } from '@/lib/api';

import type { AuthUser, LoginRequest, LoginResponse } from '../model/auth.types';

/**
 * Authentication endpoints, injected into the root API slice.
 *
 * Only the transport lives here. Token persistence and store updates are the
 * responsibility of `useAuth`, keeping this module a pure description of the
 * backend contract.
 */
export const authApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: [API_TAGS.Session],
    }),

    logout: build.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      invalidatesTags: [API_TAGS.Session],
    }),

    /** Session bootstrap: resolves the principal from the cookie or bearer token. */
    getCurrentUser: build.query<AuthUser, void>({
      query: () => ({ url: '/auth/me' }),
      providesTags: [API_TAGS.Session],
    }),

    forgotPassword: build.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),

    resetPassword: build.mutation<{ message: string }, { token: string; password: string }>({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),
  }),

  // Keeps HMR from throwing when this module is re-evaluated in development.
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
