import { useLayoutEffect } from 'react';

/** Nesting counter: a drawer opened from a modal must not unlock prematurely. */
let lockCount = 0;
let previousOverflow = '';

/**
 * Prevents the page behind a modal or drawer from scrolling.
 *
 * `scrollbar-gutter: stable` in the base stylesheet reserves the scrollbar
 * width, so locking does not shift the layout.
 */
export function useLockBodyScroll(isLocked: boolean): void {
  useLayoutEffect(() => {
    if (!isLocked) return;

    if (lockCount === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0) document.body.style.overflow = previousOverflow;
    };
  }, [isLocked]);
}
