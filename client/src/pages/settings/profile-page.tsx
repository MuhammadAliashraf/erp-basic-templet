import { z } from 'zod';

import { useAppDispatch } from '@/app/store';
import { FormActions, FormError, TextField, useZodForm } from '@/components/form';
import { Avatar, Badge, Button, Card, CardBody, CardHeader } from '@/components/ui';
import { useAuth, userUpdated } from '@/features/auth';
import { useToast } from '@/features/notifications';
import { useDocumentTitle } from '@/hooks';
import { emailSchema, requiredString } from '@/lib/validation';

/**
 * Profile settings.
 *
 * A worked example of the form stack end to end: Zod schema -> `useZodForm` ->
 * bound field components -> optimistic store update -> toast confirmation.
 */

const profileSchema = z.object({
  name: requiredString('Full name', 120),
  email: emailSchema,
  title: z.string().trim().max(120).optional(),
});

export default function ProfilePage() {
  useDocumentTitle('Profile settings');

  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useZodForm({
    schema: profileSchema,
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      title: user?.title ?? '',
    },
  });

  const onSubmit = handleSubmit((values) => {
    // A real product would call a mutation here and dispatch on success.
    dispatch(userUpdated(values));
    reset(values);
    toast.success({ title: 'Profile updated' });
  });

  if (!user) return null;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader
          title="Personal information"
          description="This information appears throughout the console."
        />

        <form onSubmit={onSubmit} noValidate>
          <CardBody className="flex flex-col gap-4">
            <FormError errors={errors} />

            <div className="flex items-center gap-4">
              <Avatar name={user.name} src={user.avatarUrl} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-fg">{user.name}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {user.roles.map((role) => (
                    <Badge key={role} size="sm">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField control={control} name="name" label="Full name" isRequired />
              <TextField
                control={control}
                name="email"
                label="Email address"
                type="email"
                isRequired
              />
            </div>

            <TextField
              control={control}
              name="title"
              label="Job title"
              isOptional
              hint="Shown in the account menu and audit records."
            />
          </CardBody>

          <div className="border-t border-border bg-surface-sunken px-4 py-3">
            <FormActions className="pt-0">
              <Button onClick={() => reset()} disabled={!isDirty || isSubmitting}>
                Discard
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={!isDirty}>
                Save changes
              </Button>
            </FormActions>
          </div>
        </form>
      </Card>
    </div>
  );
}
