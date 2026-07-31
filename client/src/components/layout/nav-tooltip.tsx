import type { ReactElement, ReactNode } from 'react';

import { Tooltip } from '../ui/tooltip';

export interface NavTooltipProps {
  label: ReactNode;
  isEnabled: boolean;
  children: ReactElement<{ 'aria-describedby'?: string }>;
}

/**
 * Wraps a nav item in a tooltip only while the sidebar is collapsed.
 *
 * In the icon rail the label is the only thing identifying the destination, so
 * the tooltip appears immediately rather than after the usual hover delay.
 */
export function NavTooltip({ label, isEnabled, children }: NavTooltipProps) {
  if (!isEnabled) return children;

  return (
    <Tooltip content={label} side="right" delayMs={120}>
      {children}
    </Tooltip>
  );
}
