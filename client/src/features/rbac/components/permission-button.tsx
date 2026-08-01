import { Button, type ButtonProps, IconButton, type IconButtonProps } from '@/components/ui';
import type { AccessRequirementInput } from '@/lib/access';

import { usePermissionContext } from '../context/permission-context';

export interface PermissionButtonProps extends ButtonProps {
  /** A key, a list (any-of), or a full requirement. */
  permission: AccessRequirementInput;
  /**
   * `hide` (default) removes the button entirely — the behaviour an action the
   * user will never hold should have.
   *
   * `disable` keeps it in place, which is right when the button anchors a
   * familiar layout and its disappearance would be more confusing than its
   * being inert.
   */
  whenDenied?: 'hide' | 'disable';
  /** Tooltip text applied in `disable` mode. */
  deniedReason?: string;
}

const DEFAULT_DENIED_REASON = 'You do not have permission to perform this action.';

/**
 * A button that owns its own authorisation.
 *
 * The alternative — wrapping every action in `<Can>` at each call site — works,
 * but it is easy to forget, and a forgotten wrapper is an action the user can
 * click and watch fail. Making the permission a required prop moves that
 * mistake from runtime to compile time.
 */
export function PermissionButton({
  permission,
  whenDenied = 'hide',
  deniedReason = DEFAULT_DENIED_REASON,
  ...buttonProps
}: PermissionButtonProps) {
  const { can, isReady } = usePermissionContext();

  // Rendering before the policy resolves would show, then remove, the control.
  if (!isReady) return null;

  if (!can(permission)) {
    if (whenDenied === 'hide') return null;
    return <Button {...buttonProps} disabled aria-disabled title={deniedReason} />;
  }

  return <Button {...buttonProps} />;
}

export interface PermissionIconButtonProps extends IconButtonProps {
  permission: AccessRequirementInput;
  whenDenied?: 'hide' | 'disable';
  deniedReason?: string;
}

/** The icon-only equivalent, for table rows and toolbars. */
export function PermissionIconButton({
  permission,
  whenDenied = 'hide',
  deniedReason = DEFAULT_DENIED_REASON,
  ...buttonProps
}: PermissionIconButtonProps) {
  const { can, isReady } = usePermissionContext();

  if (!isReady) return null;

  if (!can(permission)) {
    if (whenDenied === 'hide') return null;
    return <IconButton {...buttonProps} disabled aria-disabled title={deniedReason} />;
  }

  return <IconButton {...buttonProps} />;
}
