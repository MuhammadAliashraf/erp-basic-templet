import { useCallback, useMemo, useState } from 'react';

export interface UseDisclosureReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setOpen: (value: boolean) => void;
}

/**
 * Open/closed state for modals, drawers, menus and popovers.
 *
 * The callbacks are stable, so passing them to memoised children does not
 * defeat memoisation.
 */
export function useDisclosure(initialState = false): UseDisclosureReturn {
  const [isOpen, setOpen] = useState(initialState);

  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((current) => !current), []);

  return useMemo(() => ({ isOpen, open, close, toggle, setOpen }), [isOpen, open, close, toggle]);
}
