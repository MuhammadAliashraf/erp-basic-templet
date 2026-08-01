import type { ReactNode } from 'react';

import { PageLoader } from '@/components/feedback';
import { type AccessRequirementInput, describeRequirement } from '@/lib/access';

import { AccessDenied } from '../components/access-denied';
import { usePermissionContext } from '../context/permission-context';

export interface PermissionGuardProps {
  requirement: AccessRequirementInput;
  children: ReactNode;
  /** Replaces the default denial panel. */
  fallback?: ReactNode;
  /** Shown while the policy resolves. */
  loading?: ReactNode;
  /** Panel copy, when the default is too generic for the region. */
  title?: string;
  description?: string;
  size?: 'sm' | 'md';
}

/**
 * Region guard that explains itself.
 *
 * `<Can>` silently removes a subtree, which is right for a button. For a whole
 * panel, silence is worse than a refusal: the user sees a gap and cannot tell
 * whether the feature is missing, broken or withheld. This renders a labelled
 * denial instead, naming the permission that would unlock it.
 */
export function PermissionGuard({
  requirement,
  children,
  fallback,
  loading,
  title,
  description,
  size = 'md',
}: PermissionGuardProps) {
  const { can, isReady } = usePermissionContext();

  if (!isReady) {
    return <>{loading ?? <PageLoader label="Checking permissions" />}</>;
  }

  if (!can(requirement)) {
    if (fallback !== undefined) return <>{fallback}</>;

    return (
      <AccessDenied
        title={title}
        description={description}
        requiredPermissions={describeRequirement(requirement)}
        size={size}
      />
    );
  }

  return <>{children}</>;
}
