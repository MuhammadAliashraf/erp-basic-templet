import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '@/app/store';
import { env } from '@/config/env';
import { isHttpError, tokenStore } from '@/lib/http';

import { useLoginMutation, useLogoutMutation } from '../api/auth.api';
import {
  authenticationFailed,
  authenticationStarted,
  errorCleared,
  selectAuthError,
  selectAuthStatus,
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAuthInitialized,
  sessionEnded,
  sessionEstablished,
} from '../model/auth.slice';
import type { LoginRequest } from '../model/auth.types';

/**
 * The single entry point for authentication in the UI.
 *
 * Components never dispatch auth actions or call the auth API directly; they
 * call `login`/`logout` here. That keeps the token side effects and the store
 * updates in one auditable place.
 */
export function useAuth() {
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectCurrentUser);
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsAuthInitialized);

  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

  const login = useCallback(
    async (credentials: LoginRequest) => {
      dispatch(authenticationStarted());

      try {
        const response = await loginMutation(credentials).unwrap();

        // The bearer strategy owns its tokens; with cookies the browser has
        // already stored the session and there is nothing to persist.
        if (env.authStrategy === 'bearer') {
          tokenStore.set({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken ?? null,
          });
        }

        dispatch(sessionEstablished(response.user));
        return { success: true as const, user: response.user };
      } catch (caught) {
        const message = isHttpError(caught)
          ? caught.message
          : ((caught as { message?: string })?.message ?? 'Unable to sign in. Please try again.');

        dispatch(authenticationFailed(message));
        return { success: false as const, error: message };
      }
    },
    [dispatch, loginMutation],
  );

  const logout = useCallback(async () => {
    try {
      // Best effort: a failed revoke must never trap a user in the app.
      await logoutMutation().unwrap();
    } catch {
      /* intentionally ignored */
    } finally {
      tokenStore.clear();
      dispatch(sessionEnded());
    }
  }, [dispatch, logoutMutation]);

  const clearError = useCallback(() => {
    dispatch(errorCleared());
  }, [dispatch]);

  return {
    user,
    status,
    error,
    isAuthenticated,
    isInitialized,
    isLoggingIn,
    isLoggingOut,
    login,
    logout,
    clearError,
  };
}
