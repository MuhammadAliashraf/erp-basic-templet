import { useDispatch, useSelector, useStore } from 'react-redux';

import type { AppDispatch, AppStore, RootState } from './types';

/**
 * Pre-typed Redux hooks.
 *
 * Application code must use these — never the raw `useDispatch`/`useSelector` —
 * so thunks and selectors are fully inferred without per-call generics.
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
