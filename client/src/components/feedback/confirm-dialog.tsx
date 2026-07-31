import type { ReactNode } from 'react';

import { Button } from '../ui/button';
import { Modal } from '../ui/modal';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Use `danger` for anything irreversible. */
  intent?: 'primary' | 'danger';
  isLoading?: boolean;
}

/**
 * Confirmation prompt for consequential actions.
 *
 * The confirm label should name the action ("Delete environment"), never "OK":
 * users routinely dismiss dialogs without reading the body, and the button is
 * the last thing they see.
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  intent = 'primary',
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      // Blocked while the action is running so a stray Escape cannot leave the
      // user unsure whether it completed.
      isDismissable={!isLoading}
      footer={
        <>
          <Button onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={intent === 'danger' ? 'danger' : 'primary'}
            onClick={() => void onConfirm()}
            isLoading={isLoading}
            data-autofocus
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-fg-muted">{description}</p>
    </Modal>
  );
}
