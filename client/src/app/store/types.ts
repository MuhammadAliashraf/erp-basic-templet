import type { Store, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';

import type { RootState } from './root-reducer';

/**
 * Store types declared independently of the store *instance*.
 *
 * Deriving `AppDispatch` from `typeof store` would create an import cycle
 * (store -> middleware -> store). Declaring the types structurally here lets
 * middleware, listeners and hooks stay fully typed without importing the store.
 */
export type { RootState };

export type AppDispatch = ThunkDispatch<RootState, unknown, UnknownAction>;

export type AppStore = Omit<Store<RootState, UnknownAction>, 'dispatch'> & {
  dispatch: AppDispatch;
};

/** Signature of a thunk written against this store. */
export type AppThunk<TReturn = void> = (
  dispatch: AppDispatch,
  getState: () => RootState,
) => TReturn;
