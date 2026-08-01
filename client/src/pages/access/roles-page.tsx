import { useCallback, useMemo, useState } from 'react';
import {
  LuEllipsisVertical,
  LuEye,
  LuPencil,
  LuPlus,
  LuSearch,
  LuShieldCheck,
  LuTrash2,
} from 'react-icons/lu';
import { useNavigate, useSearchParams } from 'react-router';

import { DataTable, type DataTableColumn } from '@/components/data';
import { ConfirmDialog, EmptyState } from '@/components/feedback';
import { PageContainer, PageHeader } from '@/components/layout';
import {
  Badge,
  Card,
  DropdownContent,
  DropdownItem,
  DropdownMenu,
  DropdownSeparator,
  DropdownTrigger,
  IconButton,
  Input,
  Pagination,
} from '@/components/ui';
import { buildPath, ROUTES } from '@/config/routes';
import { useToast } from '@/features/notifications';
import {
  PermissionButton,
  type Role,
  RoleFormDialog,
  useAccess,
  useDeleteRoleMutation,
  useGetRolesQuery,
  useRolePreview,
} from '@/features/rbac';
import { useDebouncedValue, useDisclosure, useDocumentTitle, usePagination } from '@/hooks';
import { formatDateTime } from '@/lib/utils';
import type { SortState } from '@/types/common';

/**
 * Role administration.
 *
 * Every action on this screen is gated by the same engine that gates the rest
 * of the application: an operator with `roles:read` but not `roles:update` sees
 * the list and no edit controls at all — not disabled ones.
 */
export default function RolesPage() {
  useDocumentTitle('Roles');

  const toast = useToast();
  const navigate = useNavigate();
  const { can } = useAccess();
  const { startPreview } = useRolePreview();

  const [searchParams, setSearchParams] = useSearchParams();
  const [editingRole, setEditingRole] = useState<Role | undefined>();
  const [roleToDelete, setRoleToDelete] = useState<Role | undefined>();

  const formDialog = useDisclosure();
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

  const search = searchParams.get('q') ?? '';
  const debouncedSearch = useDebouncedValue(search);

  const sort = useMemo<SortState>(
    () => ({
      field: searchParams.get('sortBy') ?? 'name',
      direction: searchParams.get('sortDir') === 'desc' ? 'desc' : 'asc',
    }),
    [searchParams],
  );

  const { page, pageSize, setPage, setPageSize } = usePagination();

  const { data, isFetching, error, refetch } = useGetRolesQuery({
    page,
    pageSize,
    search: debouncedSearch,
    sortBy: sort.field,
    sortDirection: sort.direction,
  });

  const updateParam = (key: string, value: string | null) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value === null || value === '') next.delete(key);
        else next.set(key, value);
        next.delete('page');
        return next;
      },
      { replace: true },
    );
  };

  const openCreate = useCallback(() => {
    setEditingRole(undefined);
    formDialog.open();
  }, [formDialog]);

  const openEdit = useCallback(
    (role: Role) => {
      setEditingRole(role);
      formDialog.open();
    },
    [formDialog],
  );

  const confirmDelete = async () => {
    if (!roleToDelete) return;

    try {
      await deleteRole(roleToDelete.id).unwrap();
      toast.success({ title: `Deleted ${roleToDelete.name}` });
      setRoleToDelete(undefined);
    } catch (caught) {
      toast.fromError(caught, 'The role could not be deleted');
    }
  };

  const columns = useMemo<DataTableColumn<Role>[]>(
    () => [
      {
        id: 'name',
        header: 'Role',
        isSortable: true,
        cell: (role) => (
          <div className="min-w-0">
            <p className="flex items-center gap-2 truncate font-medium text-fg">
              {role.name}
              {role.isSystem ? (
                <Badge size="sm" variant="outline">
                  System
                </Badge>
              ) : null}
              {role.isDefault ? (
                <Badge size="sm" intent="accent">
                  Default
                </Badge>
              ) : null}
            </p>
            <code className="block truncate font-mono text-2xs text-fg-subtle">{role.key}</code>
          </div>
        ),
      },
      {
        id: 'permissions',
        header: 'Permissions',
        width: '9rem',
        cell: (role) => (
          <span className="text-sm text-fg-muted">
            {role.permissions.includes('*') ? 'All' : role.permissions.length}
            {role.deniedPermissions.length > 0 ? (
              <span className="text-critical-fg"> · {role.deniedPermissions.length} denied</span>
            ) : null}
          </span>
        ),
      },
      {
        id: 'userCount',
        header: 'Users',
        isSortable: true,
        width: '7rem',
        hideOnMobile: true,
        cell: (role) => <span className="text-sm text-fg-muted">{role.userCount}</span>,
      },
      {
        id: 'updatedAt',
        header: 'Last updated',
        isSortable: true,
        hideOnMobile: true,
        width: '13rem',
        cell: (role) => (
          <div className="whitespace-nowrap">
            <p className="text-xs text-fg-muted">{formatDateTime(role.updatedAt)}</p>
            {role.updatedBy ? (
              <p className="text-2xs text-fg-subtle">by {role.updatedBy}</p>
            ) : null}
          </div>
        ),
      },
      {
        id: 'actions',
        header: <span className="sr-only">Actions</span>,
        align: 'right',
        width: '4rem',
        cell: (role) => (
          <DropdownMenu>
            <DropdownTriggerButton label={`Actions for ${role.name}`} />
            <DropdownContent align="end">
              <DropdownItem
                icon={<LuShieldCheck />}
                to={buildPath(ROUTES.roleDetail, { id: role.id })}
              >
                View permissions
              </DropdownItem>

              <DropdownItem
                icon={<LuEye />}
                onSelect={() => {
                  startPreview(role.key);
                  toast.info({
                    title: `Previewing as ${role.name}`,
                    description: 'Navigation and actions now reflect this role.',
                  });
                }}
              >
                Preview as this role
              </DropdownItem>

              {can('roles:update') ? (
                <DropdownItem icon={<LuPencil />} onSelect={() => openEdit(role)}>
                  Edit details
                </DropdownItem>
              ) : null}

              {can('roles:delete') && !role.isSystem ? (
                <>
                  <DropdownSeparator />
                  <DropdownItem
                    intent="critical"
                    icon={<LuTrash2 />}
                    onSelect={() => setRoleToDelete(role)}
                  >
                    Delete role
                  </DropdownItem>
                </>
              ) : null}
            </DropdownContent>
          </DropdownMenu>
        ),
      },
    ],
    [can, openEdit, startPreview, toast],
  );

  return (
    <>
      <PageHeader
        title="Roles"
        description="A role is a named bundle of permissions. Users hold roles; roles hold capabilities."
        breadcrumbs={[{ label: 'Home', to: ROUTES.dashboard }, { label: 'Roles' }]}
        actions={
          <PermissionButton
            permission="roles:create"
            variant="primary"
            leadingIcon={<LuPlus />}
            onClick={openCreate}
          >
            New role
          </PermissionButton>
        }
      />

      <PageContainer>
        <Card>
          <div className="flex flex-col gap-2 border-b border-border p-3 sm:flex-row sm:items-center">
            <Input
              type="search"
              size="sm"
              placeholder="Search roles…"
              aria-label="Search roles"
              prefix={<LuSearch />}
              value={search}
              onChange={(event) => updateParam('q', event.target.value)}
              className="sm:max-w-80"
            />
            <div className="flex-1" />
            <span className="text-xs text-fg-subtle" aria-live="polite">
              {isFetching ? 'Loading…' : `${data?.meta.totalItems ?? 0} roles`}
            </span>
          </div>

          <DataTable
            caption="Roles with their permission counts and assignment totals"
            columns={columns}
            rows={data?.data ?? []}
            getRowId={(role) => role.id}
            isLoading={isFetching && !data}
            error={error}
            onRetry={() => void refetch()}
            sort={sort}
            onSortChange={(next) => {
              updateParam('sortBy', next.field);
              updateParam('sortDir', next.direction);
            }}
            onRowClick={(role) => void navigate(buildPath(ROUTES.roleDetail, { id: role.id }))}
            emptyState={
              <EmptyState
                size="sm"
                icon={<LuShieldCheck />}
                title={search ? 'No roles match your search' : 'No roles yet'}
                description={
                  search
                    ? 'Try a different term, or clear the search to see every role.'
                    : 'Create the first role, then assign it the permissions it needs.'
                }
                action={
                  search ? null : (
                    <PermissionButton
                      permission="roles:create"
                      variant="primary"
                      size="sm"
                      leadingIcon={<LuPlus />}
                      onClick={openCreate}
                    >
                      New role
                    </PermissionButton>
                  )
                }
              />
            }
          />

          {data && data.meta.totalItems > 0 ? (
            <Pagination
              page={data.meta.page}
              pageSize={data.meta.pageSize}
              totalItems={data.meta.totalItems}
              totalPages={data.meta.totalPages}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          ) : null}
        </Card>
      </PageContainer>

      <RoleFormDialog
        isOpen={formDialog.isOpen}
        onClose={formDialog.close}
        role={editingRole}
        onSaved={(role) => {
          if (!editingRole) void navigate(buildPath(ROUTES.roleDetail, { id: role.id }));
        }}
      />

      <ConfirmDialog
        isOpen={roleToDelete !== undefined}
        onClose={() => setRoleToDelete(undefined)}
        onConfirm={confirmDelete}
        intent="danger"
        title={`Delete ${roleToDelete?.name}?`}
        description={
          roleToDelete?.userCount
            ? `${roleToDelete.userCount} user(s) currently hold this role and will lose everything it grants.`
            : 'This cannot be undone. Users holding the role will lose everything it grants.'
        }
        confirmLabel="Delete role"
        isLoading={isDeleting}
      />
    </>
  );
}

/** Extracted so the dropdown's render prop does not bloat the column list. */
function DropdownTriggerButton({ label }: { label: string }) {
  return (
    <DropdownTrigger>
      {({ isOpen, toggle }) => (
        <IconButton
          aria-label={label}
          aria-expanded={isOpen}
          icon={<LuEllipsisVertical />}
          size="sm"
          onClick={(event) => {
            // The row navigates on click; the menu must not trigger it.
            event.stopPropagation();
            toggle();
          }}
        />
      )}
    </DropdownTrigger>
  );
}
