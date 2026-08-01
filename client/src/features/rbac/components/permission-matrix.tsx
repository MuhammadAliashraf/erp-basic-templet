import { useMemo, useState } from 'react';
import { LuSearch } from 'react-icons/lu';

import { EmptyState } from '@/components/feedback';
import { Badge, Checkbox, Input } from '@/components/ui';
import { cn } from '@/lib/utils';

import type { PermissionDefinition, PermissionKey, PermissionScope } from '../model/rbac.types';

export interface PermissionMatrixProps {
  /** The full catalogue, exactly as the server returned it. */
  permissions: readonly PermissionDefinition[];
  /** Currently granted keys. */
  value: readonly PermissionKey[];
  onChange: (permissions: PermissionKey[]) => void;
  /** Renders the matrix as a read-only summary. */
  isReadOnly?: boolean;
  className?: string;
}

const SCOPE_LABELS: Record<PermissionScope, string> = {
  menu: 'Menu',
  route: 'Route',
  page: 'Page',
  component: 'Component',
  button: 'Button',
  field: 'Field',
  api: 'API',
  data: 'Data',
};

/** Scope tints, so the layer a permission governs is legible at a glance. */
const SCOPE_INTENT: Record<PermissionScope, 'neutral' | 'accent' | 'positive' | 'caution'> = {
  menu: 'neutral',
  route: 'neutral',
  page: 'neutral',
  component: 'accent',
  button: 'accent',
  field: 'caution',
  api: 'positive',
  data: 'caution',
};

interface PermissionGroup {
  name: string;
  permissions: PermissionDefinition[];
}

function groupPermissions(permissions: readonly PermissionDefinition[]): PermissionGroup[] {
  const groups = new Map<string, PermissionDefinition[]>();

  for (const permission of permissions) {
    const bucket = groups.get(permission.group);
    if (bucket) bucket.push(permission);
    else groups.set(permission.group, [permission]);
  }

  return [...groups.entries()]
    .map(([name, entries]) => ({
      name,
      permissions: [...entries].sort((left, right) => left.key.localeCompare(right.key)),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

/**
 * Role ↔ permission assignment grid.
 *
 * Grouped by the catalogue's own `group` field rather than by anything the
 * client decides, so a new module's permissions appear here — correctly
 * grouped — the moment the backend publishes them.
 *
 * Selection is per group as well as per row: real roles are assigned a module
 * at a time, and ticking eleven boxes to grant "everything in Billing" is how
 * mistakes get made.
 */
export function PermissionMatrix({
  permissions,
  value,
  onChange,
  isReadOnly = false,
  className,
}: PermissionMatrixProps) {
  const [search, setSearch] = useState('');

  const selected = useMemo(() => new Set(value), [value]);

  const groups = useMemo(() => {
    const term = search.trim().toLowerCase();

    const filtered = term
      ? permissions.filter(
          (permission) =>
            permission.key.toLowerCase().includes(term) ||
            permission.name.toLowerCase().includes(term) ||
            permission.group.toLowerCase().includes(term),
        )
      : permissions;

    return groupPermissions(filtered);
  }, [permissions, search]);

  const toggle = (key: PermissionKey) => {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange([...next]);
  };

  const toggleGroup = (group: PermissionGroup, shouldSelect: boolean) => {
    const next = new Set(selected);
    for (const permission of group.permissions) {
      if (shouldSelect) next.add(permission.key);
      else next.delete(permission.key);
    }
    onChange([...next]);
  };

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex flex-col gap-2 border-b border-border p-3 sm:flex-row sm:items-center">
        <Input
          type="search"
          size="sm"
          placeholder="Filter permissions…"
          aria-label="Filter permissions"
          prefix={<LuSearch />}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="sm:max-w-80"
        />
        <div className="flex-1" />
        <span className="text-xs text-fg-muted" aria-live="polite">
          {selected.size} of {permissions.length} granted
        </span>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          size="sm"
          title="No permissions match"
          description="Try a different term, or clear the filter to see the whole catalogue."
        />
      ) : (
        <div className="divide-y divide-border">
          {groups.map((group) => {
            const groupKeys = group.permissions.map((permission) => permission.key);
            const selectedCount = groupKeys.filter((key) => selected.has(key)).length;
            const areAllSelected = selectedCount === groupKeys.length;

            return (
              <section key={group.name}>
                <header className="flex items-center gap-2.5 bg-surface-sunken px-3 py-2">
                  <Checkbox
                    checked={areAllSelected}
                    indeterminate={selectedCount > 0 && !areAllSelected}
                    disabled={isReadOnly}
                    onChange={() => toggleGroup(group, !areAllSelected)}
                    aria-label={`${areAllSelected ? 'Revoke' : 'Grant'} every permission in ${group.name}`}
                  />
                  <h3 className="flex-1 text-xs font-semibold text-fg">{group.name}</h3>
                  <span className="text-2xs text-fg-subtle">
                    {selectedCount}/{groupKeys.length}
                  </span>
                </header>

                <ul>
                  {group.permissions.map((permission) => {
                    const isSelected = selected.has(permission.key);

                    return (
                      <li key={permission.id}>
                        <label
                          className={cn(
                            'flex cursor-pointer items-start gap-2.5 px-3 py-2 transition-colors',
                            'hover:bg-surface-hover',
                            isReadOnly && 'cursor-default hover:bg-transparent',
                          )}
                        >
                          <span className="flex h-5 items-center">
                            <Checkbox
                              checked={isSelected}
                              disabled={isReadOnly}
                              onChange={() => toggle(permission.key)}
                            />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-sm text-fg">{permission.name}</span>
                              <Badge size="sm" intent={SCOPE_INTENT[permission.scope]}>
                                {SCOPE_LABELS[permission.scope]}
                              </Badge>
                              {permission.isSystem ? (
                                <Badge size="sm" variant="outline">
                                  System
                                </Badge>
                              ) : null}
                            </span>

                            <code className="mt-0.5 block truncate font-mono text-2xs text-fg-subtle">
                              {permission.key}
                            </code>

                            {permission.description ? (
                              <span className="mt-0.5 block text-xs text-fg-muted">
                                {permission.description}
                              </span>
                            ) : null}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
