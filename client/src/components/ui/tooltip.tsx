import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useId,
  useRef,
  useState,
} from 'react';

import { cn } from '@/lib/utils';

export interface TooltipProps {
  content: ReactNode;
  children: ReactElement<{ 'aria-describedby'?: string }>;
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Delay before showing, in ms. Prevents flicker when sweeping a toolbar. */
  delayMs?: number;
  isDisabled?: boolean;
}

const SIDE_STYLES = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
  left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
  right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
} as const;

/**
 * Tooltip.
 *
 * Shows on hover *and* keyboard focus — a tooltip that only responds to a mouse
 * is invisible to keyboard users. Content must be supplementary: never put
 * information here that the user cannot complete the task without.
 */
export function Tooltip({
  content,
  children,
  side = 'top',
  delayMs = 400,
  isDisabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId();

  const show = () => {
    if (isDisabled) return;
    timerRef.current = setTimeout(() => setIsVisible(true), delayMs);
  };

  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsVisible(false);
  };

  if (!isValidElement(children)) return children;

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocusCapture={show}
      onBlurCapture={hide}
      // Escape must dismiss a tooltip, per WAI-ARIA practices.
      onKeyDown={(event) => event.key === 'Escape' && hide()}
    >
      {cloneElement(children, { 'aria-describedby': isVisible ? tooltipId : undefined })}

      {isVisible && !isDisabled ? (
        <span
          id={tooltipId}
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-50 max-w-64 rounded-md px-2 py-1 text-xs font-medium',
            'animate-fade-in bg-inverse text-inverse-fg shadow-md',
            'w-max whitespace-normal',
            SIDE_STYLES[side],
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
