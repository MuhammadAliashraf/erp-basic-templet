import { useEffect, useMemo, useState } from 'react';
import { LuArrowLeft, LuEye, LuPencil, LuRotateCcw, LuSave } from 'react-icons/lu';
import { useParams } from 'react-router';

import { ErrorState, PageLoader } from '@/components/feedback';
import { PageContainer, PageHeader } from '@/components/layout';
import { Alert, Badge, Button, Card, CardHeader, LinkButton } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { useToast } from '@/features/notifications';
import {
  PermissionButton,
  PermissionMatrix,
  RoleFormDialog,
  useAccess,
  useGetPermissionsQuery,
  useGetRoleQuery,
  useRolePreview,
  useUpdateRolePermissionsMutation,
} from '@/features/rbac';
import { useDisclosure, useDocumentTitle } from '@/hooks';
import { formatDateTime } from '@/lib/utils';

/**
 * Role detail: identity above, the permission matrix below.
 *
 * The matrix is edited as a draft and saved explicitly. Live-saving each
 * checkbox would be twenty writes to an audit log for one intended change, and
 * it removes the one moment where someone can look at the whole grant and think
 * again before committing it.
 */
export default function RoleDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const toast = useToast();
  const { can } = useAccess();
  const { startPreview } = useRolePreview();
  const editDialog = useDisclosure();

  const {
    data: role,
    isLoading: isLoadingRole,
    error: roleError,
    refetch,
  } = useGetRoleQuery(id, { skip: !id });

  const { data: permissions = [], isLoading: isLoadingPermissions } = useGetPermissionsQuery();

  const [savePermissions, { isLoading: isSaving }] = useUpdateRolePermissionsMutation();

  const [draft, setDraft] = useState<string[] | null>(null);

  useDocumentTitle(role ? `${role.name} · Roles` : 'Role');

  // The draft mirrors the server value until the user edits it; resetting on a
  // new id keeps a stale draft from leaking across roles.
  useEffect(() => {
    setDraft(null);
  }, [id]);

  const assigned = draft ?? role?.permissions ?? [];

  const isDirty = useMemo(() => {
    if (draft === null || !role) return false;
    if (draft.length !== role.permissions.length) return true;

    const original = new Set(role.permissions);
    return draft.some((key) => !original.has(key));
  }, [draft, role]);

  const canEdit = can({ anyOf: ['roles:assign', 'roles:update'] });

  const handleSave = async () => {
    if (!role || draft === null) return;

    try {
      await savePermissions({ id: role.id, permissions: draft }).unwrap();
      setDraft(null);
      toast.success({
        title: 'Permissions saved',
        description: 'Anyone holding this role sees the change on their next policy refresh.',
      });
    } catch (caught) {
      toast.fromError(caught, 'The permissions could not be saved');
    }
  };

  if (isLoadingRole) return <PageLoader label="Loading role" />;

  if (roleError || !role) {
    return (
      <PageContainer>
        <ErrorState
          error={roleError}
          title="This role could not be loaded"
          onRetry={() => void refetch()}
        />
      </PageContainer>
    );
  }

  const grantsEverything = role.permissions.includes('*');

  return (
    <>
      <PageHeader
        title={role.name}
        description={role.description ?? 'No description provided.'}
        breadcrumbs={[
          { label: 'Home', to: ROUTES.dashboard },
          { label: 'Roles', to: ROUTES.roles },
          { label: role.name },
        ]}
        actions={
          <>
            <LinkButton to={ROUTES.roles} leadingIcon={<LuArrowLeft />}>
              All roles
            </LinkButton>

            <Button leadingIcon={<LuEye />} onClick={() => startPreview(role.key)}>
              Preview as this role
            </Button>

            <PermissionButton
              permission="roles:update"
              leadingIcon={<LuPencil />}
              onClick={editDialog.open}
            >
              Edit details
            </PermissionButton>
          </>
        }
      />

      <PageContainer>
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader
              title="Summary"
              actions={
                <div className="flex flex-wrap items-center gap-2">
                  {role.isSystem ? <Badge variant="outline">System role</Badge> : null}
                  {role.isDefault ? <Badge intent="accent">Default for new users</Badge> : null}
                </div>
              }
            />

            <dl className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryItem label="Role key" value={<code className="font-mono">{role.key}</code>} />
              <SummaryItem label="Users holding it" value={role.userCount} />
              <SummaryItem
                label="Permissions granted"
                value={grantsEverything ? 'All (superuser)' : role.permissions.length}
              />
              <SummaryItem
                label="Last updated"
                value={
                  <>
                    {formatDateTime(role.updatedAt)}
                    {role.updatedBy ? (
                      <span className="block text-2xs text-fg-subtle">by {role.updatedBy}</span>
                    ) : null}
                  </>
                }
              />
            </dl>
          </Card>

          {grantsEverything ? (
            <Alert intent="caution" title="This role grants every permission">
              The <code className="font-mono">*</code> grant satisfies every check in the
              application, including permissions that do not exist yet. Keep it for break-glass
              access and platform owners.
            </Alert>
          ) : null}

          {role.deniedPermissions.length > 0 ? (
            <Alert intent="critical" title="Explicit denials are in force">
              {role.deniedPermissions.join(', ')} — these override any grant, including a wildcard.
            </Alert>
          ) : null}

          <Card>
            <CardHeader
              title="Permissions"
              description={
                canEdit
                  ? 'Tick what this role may do. Nothing is applied until you save.'
                  : 'You have read-only access to this assignment.'
              }
              actions={
                canEdit ? (
                  <>
                    <Button
                      size="sm"
                      leadingIcon={<LuRotateCcw />}
                      disabled={!isDirty || isSaving}
                      onClick={() => setDraft(null)}
                    >
                      Discard
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      leadingIcon={<LuSave />}
                      disabled={!isDirty}
                      isLoading={isSaving}
                      onClick={() => void handleSave()}
                    >
                      Save changes
                    </Button>
                  </>
                ) : null
              }
            />

            {isLoadingPermissions ? (
              <PageLoader label="Loading the permission catalogue" />
            ) : (
              <PermissionMatrix
                permissions={permissions}
                value={assigned}
                onChange={setDraft}
                isReadOnly={!canEdit}
              />
            )}
          </Card>
        </div>
      </PageContainer>

      <RoleFormDialog isOpen={editDialog.isOpen} onClose={editDialog.close} role={role} />
    </>
  );
}

function SummaryItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-2xs font-medium tracking-wide text-fg-subtle uppercase">{label}</dt>
      <dd className="mt-1 truncate text-sm text-fg">{value}</dd>
    </div>
  );
}
