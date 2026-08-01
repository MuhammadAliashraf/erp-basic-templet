import { useEffect } from 'react';

import {
  CheckboxField,
  FormError,
  TextareaField,
  TextField,
  useZodForm,
} from '@/components/form';
import { Button, Modal } from '@/components/ui';
import { useToast } from '@/features/notifications';
import { useFormErrorHandler } from '@/hooks';
import { slugify } from '@/lib/utils';

import { useCreateRoleMutation, useUpdateRoleMutation } from '../api/rbac.api';
import { roleFormSchema, type RoleFormValues } from '../model/rbac.schemas';
import type { Role } from '../model/rbac.types';

export interface RoleFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Omit to create. Supply a role to edit it. */
  role?: Role;
  /** Called with the saved role, e.g. to navigate to its detail screen. */
  onSaved?: (role: Role) => void;
}

const EMPTY_VALUES: RoleFormValues = {
  key: '',
  name: '',
  description: undefined,
  isDefault: false,
  permissions: [],
  deniedPermissions: [],
};

/**
 * Create or edit a role's identity.
 *
 * Grants are deliberately *not* edited here: assigning permissions needs the
 * full catalogue and room to think, which is the role detail screen's job. A
 * dialog that tries to do both ends up with a scrolling matrix squeezed into
 * 400px, and roles get over-granted because nobody scrolled.
 */
export function RoleFormDialog({ isOpen, onClose, role, onSaved }: RoleFormDialogProps) {
  const toast = useToast();
  const applyServerErrors = useFormErrorHandler<RoleFormValues>();

  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();

  const isEditing = Boolean(role);
  const isSaving = isCreating || isUpdating;

  const form = useZodForm({ schema: roleFormSchema, defaultValues: EMPTY_VALUES });
  const { control, handleSubmit, reset, setError, setValue, watch, formState } = form;

  // Reset on open rather than on mount: the dialog stays mounted between uses,
  // so without this the previous role's values would linger.
  useEffect(() => {
    if (!isOpen) return;

    reset(
      role
        ? {
            key: role.key,
            name: role.name,
            description: role.description,
            isDefault: role.isDefault,
            permissions: role.permissions,
            deniedPermissions: role.deniedPermissions,
          }
        : EMPTY_VALUES,
    );
  }, [isOpen, reset, role]);

  const name = watch('name');

  // Derive the key from the name while creating, so operators are not asked to
  // invent a slug — but never touch it afterwards: the key is a stable
  // identifier that other systems may already reference.
  useEffect(() => {
    if (isEditing || !name) return;
    setValue('key', slugify(name), { shouldValidate: false });
  }, [isEditing, name, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const saved = role
        ? await updateRole({
            id: role.id,
            changes: {
              name: values.name,
              description: values.description,
              isDefault: values.isDefault,
            },
          }).unwrap()
        : await createRole({
            key: values.key,
            name: values.name,
            description: values.description,
            isDefault: values.isDefault,
            permissions: [],
          }).unwrap();

      toast.success({
        title: isEditing ? 'Role updated' : 'Role created',
        description: isEditing ? undefined : 'Assign permissions from the role’s detail screen.',
      });

      onSaved?.(saved);
      onClose();
    } catch (error) {
      applyServerErrors(error, setError);
    }
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit ${role?.name}` : 'New role'}
      description={
        isEditing
          ? 'The role key cannot change once other systems reference it.'
          : 'Create the role first, then assign its permissions.'
      }
      isDismissable={!isSaving}
      footer={
        <>
          <Button onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => void onSubmit()} isLoading={isSaving}>
            {isEditing ? 'Save changes' : 'Create role'}
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

        <TextField
          name="name"
          control={control}
          label="Role name"
          placeholder="Operations manager"
          isRequired
          autoFocus
        />

        <TextField
          name="key"
          control={control}
          label="Role key"
          hint={
            isEditing
              ? 'Fixed for the lifetime of the role.'
              : 'Used by the API and by integrations. Derived from the name.'
          }
          disabled={isEditing || role?.isSystem}
          isRequired
        />

        <TextareaField
          name="description"
          control={control}
          label="Description"
          placeholder="What this role is for, and who should hold it."
          rows={3}
          isOptional
        />

        <CheckboxField
          name="isDefault"
          control={control}
          label="Assign to new users automatically"
          description="Exactly one role should carry this. It decides what a brand-new account can reach."
        />
      </form>
    </Modal>
  );
}
