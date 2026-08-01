import type { ReactNode } from 'react';

import type { FieldAccess } from '../hooks/use-field-access';
import { useFieldAccess } from '../hooks/use-field-access';

export interface FieldGuardProps {
  /** The record type the field belongs to, e.g. `employees`. */
  resource: string;
  field: string;
  /**
   * The field's normal rendering. Given the resolved access so a control can
   * disable itself: `{(access) => <TextField disabled={!access.canWrite} />}`.
   */
  children: ReactNode | ((access: FieldAccess) => ReactNode);
  /** Rendered instead when the field is hidden. Defaults to nothing at all. */
  fallback?: ReactNode;
  /** Rendered when the field is readable but not writable. */
  readOnly?: ReactNode;
}

/**
 * Field-level guard.
 *
 * Hidden fields are removed from the DOM rather than masked: a `••••` placeholder
 * still discloses that the value exists, and its length, and — in a table — its
 * position. If the user may not see it, it should not be rendered.
 *
 * ```tsx
 * <FieldGuard resource="employees" field="salary">
 *   {(access) => <TextField name="salary" control={control} disabled={!access.canWrite} />}
 * </FieldGuard>
 * ```
 */
export function FieldGuard({ resource, field, children, fallback, readOnly }: FieldGuardProps) {
  const access = useFieldAccess(resource, field);

  if (access.isHidden) return <>{fallback ?? null}</>;
  if (access.isReadOnly && readOnly !== undefined) return <>{readOnly}</>;

  return <>{typeof children === 'function' ? children(access) : children}</>;
}
