import { useCallback, useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '@/app/store';

import { rolePreviewEnded, rolePreviewStarted, selectPreviewRoleKey } from '../model/rbac.slice';

/**
 * "Preview as role" — narrows the interface to what a chosen role would see.
 *
 * Client-side and cosmetic: the server still answers to the real session, so
 * this grants nothing and hides nothing that matters. Its value is verification.
 * The question "what will this role actually see?" is otherwise answered by
 * creating a test user, assigning the role, and signing in as them — which is
 * slow enough that people skip it and ship over-granted roles instead.
 */
export function useRolePreview() {
  const dispatch = useAppDispatch();
  const previewRoleKey = useAppSelector(selectPreviewRoleKey);

  const startPreview = useCallback(
    (roleKey: string) => dispatch(rolePreviewStarted(roleKey)),
    [dispatch],
  );

  const endPreview = useCallback(() => dispatch(rolePreviewEnded()), [dispatch]);

  return useMemo(
    () => ({
      previewRoleKey,
      isPreviewing: previewRoleKey !== null,
      startPreview,
      endPreview,
    }),
    [endPreview, previewRoleKey, startPreview],
  );
}
