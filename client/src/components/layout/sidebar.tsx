import { LuPanelLeftClose, LuPanelLeftOpen } from 'react-icons/lu';
import { Link } from 'react-router';

import { appConfig } from '@/config/app.config';
import { NAVIGATION } from '@/config/navigation';
import { ROUTES } from '@/config/routes';
import { cn } from '@/lib/utils';

import { IconButton } from '../ui/icon-button';
import { SidebarNav } from './sidebar-nav';

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  /** Hides the collapse control inside the mobile drawer, where it is meaningless. */
  isInDrawer?: boolean;
  onNavigate?: () => void;
}

/**
 * Primary navigation rail.
 *
 * Two desktop states — 240px labelled, or a 56px icon rail. Collapsing is a
 * deliberate feature of dense consoles: it buys back horizontal space for wide
 * tables without giving up navigation.
 */
export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  isInDrawer = false,
  onNavigate,
}: SidebarProps) {
  return (
    <div
      className={cn(
        'flex h-full flex-col border-r border-border bg-surface',
        // Width is animated so collapsing does not read as a layout glitch.
        'transition-[width] duration-200 ease-out',
        isInDrawer ? 'w-full' : isCollapsed ? 'w-sidebar-collapsed' : 'w-sidebar',
      )}
    >
      <div
        className={cn(
          'flex h-topbar shrink-0 items-center gap-2 border-b border-border px-3',
          isCollapsed && !isInDrawer && 'justify-center px-0',
        )}
      >
        <Link
          to={ROUTES.dashboard}
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-2 rounded-sm"
          aria-label={`${appConfig.name} home`}
        >
          <span
            aria-hidden="true"
            className="grid size-6 shrink-0 place-items-center rounded-sm bg-accent text-2xs font-bold text-fg-on-accent"
          >
            {appConfig.shortName}
          </span>
          {!isCollapsed || isInDrawer ? (
            <span className="truncate text-sm font-semibold text-fg">{appConfig.name}</span>
          ) : null}
        </Link>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <SidebarNav
          sections={NAVIGATION}
          isCollapsed={isCollapsed && !isInDrawer}
          onNavigate={onNavigate}
        />
      </div>

      {!isInDrawer ? (
        <div
          className={cn(
            'flex shrink-0 items-center border-t border-border p-2',
            isCollapsed ? 'justify-center' : 'justify-between',
          )}
        >
          {!isCollapsed ? (
            <span className="px-1 text-2xs text-fg-subtle">v{appConfig.version}</span>
          ) : null}

          <IconButton
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!isCollapsed}
            icon={isCollapsed ? <LuPanelLeftOpen /> : <LuPanelLeftClose />}
            size="sm"
            onClick={onToggleCollapse}
          />
        </div>
      ) : null}
    </div>
  );
}
