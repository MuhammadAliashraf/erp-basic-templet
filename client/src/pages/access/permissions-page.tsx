import { useMemo, useState } from 'react';
import { LuKeyRound, LuPencil, LuPlus, LuSearch, LuTrash2 } from 'react-icons/lu';
import { useSearchParams } from 'react-router';

import { DataTable, type DataTableColumn } from '@/components/data';
import { ConfirmDialog, EmptyState } from '@/components/feedback';
import { PageContainer, PageHeader } from '@/components/layout';
import { Badge, Card, Input, Select, Tabs } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { useToast } from '@/features/notifications';
import {
  type PermissionDefinition,
  PermissionFormDialog,
  PermissionButton,
  PermissionIconButton,
  type PermissionScope,
  useDeletePermissionMutation,
  useGetPermissionsQuery,
} from '@/features/rbac';
import { useDebouncedValue, useDisclosure, useDocumentTitle } from '@/hooks';
import { fuzzyIncludes, humanize } from '@/lib/utils';
import type { SelectOption } from '@/types/common';

/**
 * The permission catalogue.
 *
 * This is the vocabulary the whole application is written against: a guard
 * anywhere in the product refers to a key defined here. Publishing a new key
 * makes it immediately assignable — no frontend change, which is the property
 * that lets a module ship its own permissions.
 */

const ALL_SCOPES = 'all' as const;
type ScopeFilter = PermissionScope | typeof ALL_SCOPES;

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

export default function PermissionsPage() {
  useDocumentTitle('Permissions');

  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [editing, setEditing] = useState<PermissionDefinition | undefined>();
  const [toDelete, setToDelete] = useState<PermissionDefinition | undefined>();
  const formDialog = useDisclosure();

  const [deletePermission, { isLoading: isDeleting }] = useDeletePermissionMutation();
  const { data: permissions = [], isFetching, error, refetch } = useGetPermissionsQuery();

  const search = searchParams.get('q') ?? '';
  const debouncedSearch = useDebouncedValue(search);
  const scope = (searchParams.get('scope') ?? ALL_SCOPES) as ScopeFilter;
  const group = searchParams.get('group') ?? '';

  const updateParam = (key: string, value: string | null) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value === null || value === '' || value === ALL_SCOPES) next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true },
    );
  };

  const groupOptions = useMemo<SelectOption[]>(() => {
    const groups = [...new Set(permissions.map((permission) => permission.group))].sort();
    return [
      { value: '', label: 'All groups' },
      ...groups.map((name) => ({ value: name, label: name })),
    ];
  }, [permissions]);

  /**
   * Tab counts come from the unfiltered catalogue on purpose: a count that
   * shrinks as you type tells you nothing about how much is in each scope.
   */
  const scopeTabs = useMemo(() => {
    const counts = new Map<string, number>();
    for (const permission of permissions) {
      counts.set(permission.scope, (counts.get(permission.scope) ?? 0) + 1);
    }

    return [
      { value: ALL_SCOPES, label: 'All', badge: permissions.length },
      ...[...counts.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([value, count]) => ({ value, label: humanize(value), badge: count })),
    ];
  }, [permissions]);

  const rows = useMemo(() => {
    return permissions.filter((permission) => {
      if (scope !== ALL_SCOPES && permission.scope !== scope) return false;
      if (group && permission.group !== group) return false;
      if (!debouncedSearch) return true;

      return (
        fuzzyIncludes(permission.key, debouncedSearch) ||
        fuzzyIncludes(permission.name, debouncedSearch) ||
        fuzzyIncludes(permission.group, debouncedSearch)
      );
    });
  }, [debouncedSearch, group, permissions, scope]);

  const confirmDelete = async () => {
    if (!toDelete) return;

    try {
      await deletePermission(toDelete.id).unwrap();
      toast.success({ title: `Deleted ${toDelete.key}` });
      setToDelete(undefined);
    } catch (caught) {
      toast.fromError(caught, 'The permission could not be deleted');
    }
  };

  const columns = useMemo<DataTableColumn<PermissionDefinition>[]>(
    () => [
      {
        id: 'key',
        header: 'Permission',
        cell: (permission) => (
          <div className="min-w-0">
            <p className="flex items-center gap-2 truncate font-medium text-fg">
              {permission.name}
              {permission.isSystem ? (
                <Badge size="sm" variant="outline">
                  System
                </Badge>
              ) : null}
            </p>
            <code className="block truncate font-mono text-2xs text-fg-subtle">
              {permission.key}
            </code>
          </div>
        ),
      },
      {
        id: 'scope',
        header: 'Scope',
        width: '8rem',
        cell: (permission) => (
          <Badge size="sm" intent={SCOPE_INTENT[permission.scope]}>
            {humanize(permission.scope)}
          </Badge>
        ),
      },
      {
        id: 'group',
        header: 'Group',
        width: '11rem',
        hideOnMobile: true,
        cell: (permission) => <span className="text-sm text-fg-muted">{permission.group}</span>,
      },
      {
        id: 'description',
        header: 'Description',
        hideOnMobile: true,
        cell: (permission) => (
          <span className="text-xs text-fg-muted">{permission.description ?? '—'}</span>
        ),
      },
      {
        id: 'actions',
        header: <span className="sr-only">Actions</span>,
        align: 'right',
        width: '6rem',
        cell: (permission) => (
          <div className="flex items-center justify-end gap-0.5">
            <PermissionIconButton
              permission="permissions:update"
              aria-label={`Edit ${permission.key}`}
              icon={<LuPencil />}
              size="sm"
              onClick={() => {
                setEditing(permission);
                formDialog.open();
              }}
            />

            {/* System keys are referenced by the platform itself; deleting one
                would break guards that name it. */}
            {permission.isSystem ? null : (
              <PermissionIconButton
                permission="permissions:delete"
                aria-label={`Delete ${permission.key}`}
                icon={<LuTrash2 />}
                size="sm"
                onClick={() => setToDelete(permission)}
              />
            )}
          </div>
        ),
      },
    ],
    [formDialog],
  );

  return (
    <>
      <PageHeader
        title="Permissions"
        description="Every capability the application can check, and the layer each one governs."
        breadcrumbs={[{ label: 'Home', to: ROUTES.dashboard }, { label: 'Permissions' }]}
        actions={
          <PermissionButton
            permission="permissions:create"
            variant="primary"
            leadingIcon={<LuPlus />}
            onClick={() => {
              setEditing(undefined);
              formDialog.open();
            }}
          >
            New permission
          </PermissionButton>
        }
      >
        <Tabs
          aria-label="Filter by scope"
          items={scopeTabs}
          value={scope}
          onChange={(next) => updateParam('scope', next)}
        />
      </PageHeader>

      <PageContainer>
        <Card>
          <div className="flex flex-col gap-2 border-b border-border p-3 sm:flex-row sm:items-center">
            <Input
              type="search"
              size="sm"
              placeholder="Search by key, name or group…"
              aria-label="Search permissions"
              prefix={<LuSearch />}
              value={search}
              onChange={(event) => updateParam('q', event.target.value)}
              className="sm:max-w-80"
            />

            <Select
              size="sm"
              aria-label="Filter by group"
              options={groupOptions}
              value={group}
              onChange={(event) => updateParam('group', event.target.value)}
              className="sm:max-w-52"
            />

            <div className="flex-1" />
            <span className="text-xs text-fg-subtle" aria-live="polite">
              {isFetching ? 'Loading…' : `${rows.length} of ${permissions.length}`}
            </span>
          </div>

          <DataTable
            caption="The permission catalogue, filterable by scope and group"
            columns={columns}
            rows={rows}
            getRowId={(permission) => permission.id}
            isLoading={isFetching && permissions.length === 0}
            error={error}
            onRetry={() => void refetch()}
            emptyState={
              <EmptyState
                size="sm"
                icon={<LuKeyRound />}
                title="No permissions match"
                description="Adjust the search, scope or group filter to widen the results."
              />
            }
          />
        </Card>
      </PageContainer>

      <PermissionFormDialog
        isOpen={formDialog.isOpen}
        onClose={formDialog.close}
        permission={editing}
      />

      <ConfirmDialog
        isOpen={toDelete !== undefined}
        onClose={() => setToDelete(undefined)}
        onConfirm={confirmDelete}
        intent="danger"
        title={`Delete ${toDelete?.key}?`}
        description="Any role holding this permission loses it, and any guard naming it will deny everyone."
        confirmLabel="Delete permission"
        isLoading={isDeleting}
      />
    </>
  );
}
