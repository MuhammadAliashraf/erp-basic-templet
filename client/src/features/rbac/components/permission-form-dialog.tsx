import { useEffect, useMemo } from 'react';

import { FormError, SelectField, TextareaField, TextField, useZodForm } from '@/components/form';
import { Alert, Button, Modal } from '@/components/ui';
import { useToast } from '@/features/notifications';
import { useFormErrorHandler } from '@/hooks';
import { humanize } from '@/lib/utils';
import type { SelectOption } from '@/types/common';

import { useCreatePermissionMutation, useUpdatePermissionMutation } from '../api/rbac.api';
import { permissionFormSchema, type PermissionFormValues } from '../model/rbac.schemas';
import { type PermissionDefinition, PERMISSION_SCOPES } from '../model/rbac.types';

export interface PermissionFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Omit to create a permission, supply one to edit it. */
  permission?: PermissionDefinition;
}

const EMPTY_VALUES: PermissionFormValues = {
  key: '',
  name: '',
  description: undefined,
  scope: 'page',
  group: '',
};

/**
 * Adds a capability to the catalogue.
 *
 * This is the mechanism that makes the system extensible without a release: a
 * new module publishes its permissions, roles are granted them here, and every
 * guard in the application starts honouring them on the next policy refresh.
 */
export function PermissionFormDialog({ isOpen, onClose, permission }: PermissionFormDialogProps) {
  const toast = useToast();
  const applyServerErrors = useFormErrorHandler<PermissionFormValues>();

  const [createPermission, { isLoading: isCreating }] = useCreatePermissionMutation();
  const [updatePermission, { isLoading: isUpdating }] = useUpdatePermissionMutation();

  const isEditing = Boolean(permission);
  const isSaving = isCreating || isUpdating;

  const form = useZodForm({ schema: permissionFormSchema, defaultValues: EMPTY_VALUES });
  const { control, handleSubmit, reset, setError, formState } = form;

  useEffect(() => {
    if (!isOpen) return;

    reset(
      permission
        ? {
            key: permission.key,
            name: permission.name,
            description: permission.description,
            scope: permission.scope,
            group: permission.group,
          }
        : EMPTY_VALUES,
    );
  }, [isOpen, permission, reset]);

  const scopeOptions = useMemo<SelectOption[]>(
    () => PERMISSION_SCOPES.map((scope) => ({ value: scope, label: humanize(scope) })),
    [],
  );

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (permission) {
        await updatePermission({
          id: permission.id,
          changes: {
            name: values.name,
            description: values.description,
            scope: values.scope,
            group: values.group,
          },
        }).unwrap();
      } else {
        await createPermission(values).unwrap();
      }

      toast.success({ title: isEditing ? 'Permission updated' : 'Permission created' });
      onClose();
    } catch (error) {
      applyServerErrors(error, setError);
    }
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit ${permission?.name}` : 'New permission'}
      description="Permissions are checked by key. The key is what guards, menus and the API agree on."
      isDismissable={!isSaving}
      footer={
        <>
          <Button onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => void onSubmit()} isLoading={isSaving}>
            {isEditing ? 'Save changes' : 'Create permission'}
          </Button>
        </>
      }
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit();
        }}
        className="flex flex-col gap-4"
        noValidate
      >
        <FormError errors={formState.errors} />

        {isEditing && permission?.isSystem ? (
          <Alert intent="caution" title="System permission">
            The platform references this key directly. Renaming or re-scoping it is safe; deleting
            it is not.
          </Alert>
        ) : null}

        <TextField
          name="key"
          control={control}
          label="Permission key"
          placeholder="invoices:approve"
          hint="Lowercase segments separated by colons. A trailing :* grants every action on the resource."
          disabled={isEditing}
          isRequired
          autoFocus={!isEditing}
        />

        <TextField
          name="name"
          control={control}
          label="Display name"
          placeholder="Approve invoices"
          isRequired
          autoFocus={isEditing}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            name="scope"
            control={control}
            label="Scope"
            options={scopeOptions}
            hint="Which layer this governs."
            isRequired
          />

          <TextField
            name="group"
            control={control}
            label="Group"
            placeholder="Billing"
            hint="How it is grouped when assigning roles."
            isRequired
          />
        </div>

        <TextareaField
          name="description"
          control={control}
          label="Description"
          placeholder="What holding this permission allows someone to do."
          rows={3}
          isOptional
        />
      </form>
    </Modal>
  );
}
