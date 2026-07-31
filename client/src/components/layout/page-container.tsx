import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * `default` caps line length for readability;
   * `wide` suits dense tables and dashboards;
   * `full` removes the cap entirely.
   */
  width?: 'default' | 'wide' | 'full';
}

const WIDTH_STYLES: Record<NonNullable<PageContainerProps['width']>, string> = {
  default: 'max-w-5xl',
  wide: 'max-w-[1600px]',
  full: 'max-w-none',
};

/**
 * Content well beneath the page header.
 *
 * Padding steps up with the viewport (16 -> 24px) so mobile keeps its usable
 * width while desktop gets breathing room.
 */
export function PageContainer({
  width = 'wide',
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div className={cn('px-4 py-4 sm:px-6 sm:py-6', className)} {...props}>
      <div className={cn('mx-auto w-full', WIDTH_STYLES[width])}>{children}</div>
    </div>
  );
}
