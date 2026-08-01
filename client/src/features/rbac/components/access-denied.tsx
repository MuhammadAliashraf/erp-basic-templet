import { LuLock } from 'react-icons/lu';

import { EmptyState } from '@/components/feedback';
import { cn } from '@/lib/utils';
import type { PermissionKey } from '@/lib/access';

export interface AccessDeniedProps {
  title?: string;
  description?: string;
  /**
   * The permissions that would have granted access.
   *
   * Naming them turns "you can't do this" into a request an administrator can
   * action, which is the difference between a dead end and a support path.
   */
  requiredPermissions?: readonly PermissionKey[];
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * The in-place denial panel.
 *
 * Used wherever a region is withheld but its surroundings remain usable — a
 * restricted tab, a panel on an otherwise permitted page. A whole page that is
 * denied redirects to `/403` instead, so the URL reflects the outcome.
 */
export function AccessDenied({
  title = 'You do not have access',
  description = 'This section is restricted. Contact your administrator if you need access.',
  requiredPermissions,
  size = 'md',
  className,
}: AccessDeniedProps) {
  return (
    <div className={cn('w-full', className)}>
      <EmptyState size={size} icon={<LuLock />} title={title} description={description} />

      {requiredPermissions?.length ? (
        <p className="-mt-2 pb-6 text-center text-2xs text-fg-subtle">
          Requires{' '}
          {requiredPermissions.map((permission, index) => (
            <span key={permission}>
              {index > 0 ? ' or ' : null}
              <code className="rounded-xs bg-surface-sunken px-1 py-0.5 font-mono">
                {permission}
              </code>
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}
