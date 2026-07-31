import { useEffect, useRef } from 'react';

import { useAppDispatch, useAppSelector } from '@/app/store';
import { env } from '@/config/env';
import { tokenStore } from '@/lib/http';

import { useLazyGetCurrentUserQuery } from '../api/auth.api';
import {
  authenticationFailed,
  authenticationStarted,
  selectIsAuthInitialized,
  sessionEnded,
  sessionEstablished,
} from '../model/auth.slice';

/**
 * Resolves the session once, before the router renders anything protected.
 *
 * Returns `isReady`, which gates the first paint. Rendering routes before the
 * session is known causes the classic flash of the login screen for users who
 * are, in fact, signed in.
 */
export function useSessionBootstrap(): { isReady: boolean } {
  const dispatch = useAppDispatch();
  const [fetchCurrentUser] = useLazyGetCurrentUserQuery();
  // The slice — not the query — owns readiness, because one bootstrap path
  // (bearer with no token) resolves without issuing a request at all.
  const isReady = useAppSelector(selectIsAuthInitialized);
  const hasRun = useRef(false);

  // Lets the HTTP layer end the session when a refresh ultimately fails,
  // without lib/ needing to know the store exists.
  useEffect(() => {
    tokenStore.setUnauthorizedHandler(() => {
      dispatch(sessionEnded());
    });
    return () => tokenStore.setUnauthorizedHandler(null);
  }, [dispatch]);

  useEffect(() => {
    // StrictMode double-invokes effects in development; the session check must
    // still happen exactly once.
    if (hasRun.current) return;
    hasRun.current = true;

    // With bearer auth and no token there is nothing to verify — skip the
    // round trip and go straight to the login screen.
    if (env.authStrategy === 'bearer' && !tokenStore.getAccessToken()) {
      dispatch(authenticationFailed(null));
      return;
    }

    dispatch(authenticationStarted());

    void fetchCurrentUser()
      .unwrap()
      .then((user) => dispatch(sessionEstablished(user)))
      .catch(() => {
        tokenStore.clear();
        dispatch(authenticationFailed(null));
      });
  }, [dispatch, fetchCurrentUser]);

  return { isReady };
}
