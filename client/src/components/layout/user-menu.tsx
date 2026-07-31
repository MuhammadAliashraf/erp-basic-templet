import { LuChevronDown, LuLogOut, LuSettings, LuUser } from 'react-icons/lu';

import { ROUTES } from '@/config/routes';
import { useAuth } from '@/features/auth';
import { cn } from '@/lib/utils';

import { Avatar } from '../ui/avatar';
import {
  DropdownContent,
  DropdownItem,
  DropdownMenu,
  DropdownSeparator,
  DropdownTrigger,
} from '../ui/dropdown-menu';

/**
 * Account menu in the top bar.
 *
 * The identity block at the top of the menu is not decoration: in consoles
 * where staff hold several accounts, confirming *which* account is active
 * before performing an action prevents real mistakes.
 */
export function UserMenu() {
  const { user, logout, isLoggingOut } = useAuth();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownTrigger>
        {({ isOpen, toggle, menuId }) => (
          <button
            type="button"
            onClick={toggle}
            aria-expanded={isOpen}
            aria-haspopup="menu"
            aria-controls={isOpen ? menuId : undefined}
            className={cn(
              'flex h-8 items-center gap-2 rounded-md pl-1 pr-1.5 transition-colors',
              'hover:bg-surface-hover',
              isOpen && 'bg-surface-hover',
            )}
          >
            <Avatar name={user.name} src={user.avatarUrl} size="sm" />
            {/* The name is hidden on mobile; the avatar remains the target. */}
            <span className="hidden max-w-32 truncate text-sm text-fg md:block">{user.name}</span>
            <LuChevronDown aria-hidden="true" className="size-3.5 shrink-0 text-fg-subtle" />
          </button>
        )}
      </DropdownTrigger>

      <DropdownContent align="end" className="min-w-56">
        <div className="border-b border-border px-3 py-2.5">
          <p className="truncate text-sm font-medium text-fg">{user.name}</p>
          <p className="truncate text-xs text-fg-muted">{user.email}</p>
          {user.title ? <p className="mt-0.5 truncate text-2xs text-fg-subtle">{user.title}</p> : null}
        </div>

        <div className="py-1">
          <DropdownItem to={ROUTES.settingsProfile} icon={<LuUser />}>
            Profile
          </DropdownItem>
          <DropdownItem to={ROUTES.settingsAppearance} icon={<LuSettings />}>
            Preferences
          </DropdownItem>
        </div>

        <DropdownSeparator />

        <DropdownItem
          icon={<LuLogOut />}
          intent="critical"
          isDisabled={isLoggingOut}
          onSelect={() => void logout()}
        >
          Sign out
        </DropdownItem>
      </DropdownContent>
    </DropdownMenu>
  );
}
