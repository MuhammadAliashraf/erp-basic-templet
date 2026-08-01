import { useMemo } from 'react';

import { canReadField, canWriteField, type FieldAccessLevel } from '@/lib/access';

import { usePermissionContext } from '../context/permission-context';

export interface FieldAccess {
  level: FieldAccessLevel;
  /** The field may be displayed. */
  canRead: boolean;
  /** The field may be edited. */
  canWrite: boolean;
  /** Convenience for `!canRead` — the common branch at a call site. */
  isHidden: boolean;
  /** Readable but not editable: render the value, disable the control. */
  isReadOnly: boolean;
}

/**
 * Field-level authorisation.
 *
 * ```tsx
 * const salary = useFieldAccess('employees', 'salary');
 * {salary.canRead ? <TextField disabled={!salary.canWrite} … /> : null}
 * ```
 *
 * Three levels rather than a boolean, because "may not edit" and "may not see"
 * are genuinely different answers: a read-only field still gives the user the
 * context they need, while a hidden one must not appear in the DOM at all.
 */
export function useFieldAccess(resource: string, field: string): FieldAccess {
  const { fieldAccess } = usePermissionContext();
  const level = fieldAccess(resource, field);

  return useMemo(
    () => ({
      level,
      canRead: canReadField(level),
      canWrite: canWriteField(level),
      isHidden: !canReadField(level),
      isReadOnly: canReadField(level) && !canWriteField(level),
    }),
    [level],
  );
}

/**
 * Resolves a whole record's fields in one pass.
 *
 * Use this for forms and detail panels: one hook call instead of one per field
 * keeps the component's hook order stable when the field list is dynamic.
 */
export function useFieldAccessMap<TField extends string>(
  resource: string,
  fields: readonly TField[],
): Record<TField, FieldAccess> {
  const { fieldAccess } = usePermissionContext();

  return useMemo(() => {
    const result = {} as Record<TField, FieldAccess>;

    for (const field of fields) {
      const level = fieldAccess(resource, field);
      result[field] = {
        level,
        canRead: canReadField(level),
        canWrite: canWriteField(level),
        isHidden: !canReadField(level),
        isReadOnly: canReadField(level) && !canWriteField(level),
      };
    }

    return result;
  }, [fieldAccess, fields, resource]);
}

/** Strips fields the user may not read from a payload before it is displayed. */
export function useVisibleFields<TRecord extends Record<string, unknown>>(
  resource: string,
  record: TRecord | undefined,
): Partial<TRecord> {
  const { fieldAccess } = usePermissionContext();

  return useMemo(() => {
    if (!record) return {};

    return Object.fromEntries(
      Object.entries(record).filter(([field]) => canReadField(fieldAccess(resource, field))),
    ) as Partial<TRecord>;
  }, [fieldAccess, record, resource]);
}
