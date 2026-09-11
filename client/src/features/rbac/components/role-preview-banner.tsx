import { LuEye, LuX } from 'react-icons/lu';

import { Button } from '@/components/ui';

import { useRolePreview } from '../hooks/use-role-preview';

/**
 * Persistent reminder that the interface is being viewed through another role.
 *
 * Deliberately loud and always present: an administrator who forgets they are
 * previewing will file a bug about missing menus, and the fix is a banner they
 * cannot miss rather than a subtle badge in a corner.
 */
export function RolePreviewBanner() {
  const { isPreviewing, previewRoleKey, endPreview } = useRolePreview();

  if (!isPreviewing) return null;

  return (
    <div
      role="status"
      className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-caution/30 bg-caution-subtle px-4 py-2"
    >
      <LuEye aria-hidden="true" className="size-4 shrink-0 text-caution" />

      <p className="min-w-0 flex-1 text-xs text-fg">
        Previewing the interface as <span className="font-semibold">{previewRoleKey}</span>. Menus
        and actions reflect that role — your own access is unchanged.
      </p>

      <Button size="sm" leadingIcon={<LuX />} onClick={endPreview}>
        Exit preview
      </Button>
    </div>
  );
}
