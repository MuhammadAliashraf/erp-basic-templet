import { LuBell, LuCircleHelp, LuMenu, LuSearch } from 'react-icons/lu';

import { cn } from '@/lib/utils';

import { IconButton } from '../ui/icon-button';
import { Input } from '../ui/input';
import { Tooltip } from '../ui/tooltip';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from './user-menu';

export interface TopbarProps {
  onOpenMobileSidebar: () => void;
  className?: string;
}

/**
 * Application top bar.
 *
 * Fixed 48px height, matching the sidebar header so the two align across the
 * fold. Contents are ordered by frequency of use: navigation and search on the
 * left, account controls on the right.
 *
 * On mobile the search field collapses to an icon — a full-width search box
 * would leave no room for the menu button and account controls.
 */
export function Topbar({ onOpenMobileSidebar, className }: TopbarProps) {
  return (
    <header
      className={cn(
        'flex h-topbar shrink-0 items-center gap-2 border-b border-border bg-surface px-3',
        className,
      )}
    >
      <IconButton
        aria-label="Open navigation menu"
        icon={<LuMenu />}
        onClick={onOpenMobileSidebar}
        className="lg:hidden"
      />

      <div className="hidden min-w-0 flex-1 md:block">
        <Input
          type="search"
          placeholder="Search…"
          aria-label="Search"
          size="sm"
          prefix={<LuSearch />}
          className="max-w-80"
        />
      </div>

      {/* Pushes the right-hand cluster over when search is hidden. */}
      <div className="flex-1 md:hidden" />

      <div className="flex shrink-0 items-center gap-0.5">
        <IconButton aria-label="Search" icon={<LuSearch />} className="md:hidden" />

        <Tooltip content="Notifications">
          <IconButton aria-label="Notifications" icon={<LuBell />} />
        </Tooltip>

        <Tooltip content="Help and documentation">
          <IconButton
            aria-label="Help and documentation"
            icon={<LuCircleHelp />}
            className="hidden sm:inline-grid"
          />
        </Tooltip>

        <ThemeToggle />

        <div className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

        <UserMenu />
      </div>
    </header>
  );
}
