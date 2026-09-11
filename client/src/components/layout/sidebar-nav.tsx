import { useState } from 'react';
import { LuChevronDown } from 'react-icons/lu';
import { NavLink, useLocation } from 'react-router';

import type { NavItem, NavSection } from '@/config/navigation';
import { useAuthorizedNavigation } from '@/features/rbac';
import { cn } from '@/lib/utils';

import { Skeleton } from '../ui/skeleton';
import { NavTooltip } from './nav-tooltip';

export interface SidebarNavProps {
  sections: readonly NavSection[];
  /** Icon-rail mode: labels are hidden and surfaced as tooltips instead. */
  isCollapsed?: boolean;
  /** Called after navigating — closes the mobile drawer. */
  onNavigate?: () => void;
}

/** True when the item, or any descendant, matches the current URL. */
function isItemActive(item: NavItem, pathname: string): boolean {
  if (item.to && (pathname === item.to || pathname.startsWith(`${item.to}/`))) return true;
  return item.children?.some((child) => isItemActive(child, pathname)) ?? false;
}

const ITEM_BASE =
  'group relative flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors';

const ITEM_ACTIVE =
  'bg-surface-selected font-medium text-accent-fg ' +
  // A left rail marker so the active item is not signalled by colour alone.
  'before:absolute before:left-0 before:top-1/2 before:h-4/6 before:w-0.5 before:-translate-y-1/2 before:rounded-r before:bg-accent';

const ITEM_IDLE = 'text-fg-muted hover:bg-surface-hover hover:text-fg';

function NavLeaf({
  item,
  isCollapsed,
  onNavigate,
  depth = 0,
}: {
  item: NavItem;
  isCollapsed: boolean;
  onNavigate?: () => void;
  depth?: number;
}) {
  const Icon = item.icon;

  return (
    <li>
      <NavTooltip label={item.label} isEnabled={isCollapsed}>
        <NavLink
          to={item.to ?? '#'}
          onClick={onNavigate}
          end={item.to === '/'}
          className={({ isActive }) =>
            cn(
              ITEM_BASE,
              isActive ? ITEM_ACTIVE : ITEM_IDLE,
              isCollapsed && 'justify-center px-0',
              !isCollapsed && depth > 0 && 'pl-9',
            )
          }
        >
          {Icon ? <Icon aria-hidden="true" className="size-4 shrink-0" /> : null}

          {!isCollapsed ? (
            <>
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge ? (
                <span className="rounded-sm bg-surface-sunken px-1.5 py-0.5 text-2xs font-medium text-fg-muted">
                  {item.badge}
                </span>
              ) : null}
            </>
          ) : null}
        </NavLink>
      </NavTooltip>
    </li>
  );
}

function NavGroup({
  item,
  isCollapsed,
  onNavigate,
}: {
  item: NavItem;
  isCollapsed: boolean;
  onNavigate?: () => void;
}) {
  const { pathname } = useLocation();
  const Icon = item.icon;

  // Groups containing the current route start open, so a refresh does not hide
  // where the user is.
  const [isExpanded, setIsExpanded] = useState(() => isItemActive(item, pathname));
  const hasActiveChild = isItemActive(item, pathname);

  // In the icon rail there is no room to expand; the group collapses to its
  // icon and its active state is inherited from its children.
  if (isCollapsed) {
    return (
      <li>
        <NavTooltip label={item.label} isEnabled>
          <NavLink
            to={item.children?.[0]?.to ?? '#'}
            onClick={onNavigate}
            className={cn(
              ITEM_BASE,
              'justify-center px-0',
              hasActiveChild ? ITEM_ACTIVE : ITEM_IDLE,
            )}
          >
            {Icon ? <Icon aria-hidden="true" className="size-4 shrink-0" /> : null}
          </NavLink>
        </NavTooltip>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => setIsExpanded((current) => !current)}
        aria-expanded={isExpanded}
        className={cn(ITEM_BASE, hasActiveChild && !isExpanded ? ITEM_ACTIVE : ITEM_IDLE)}
      >
        {Icon ? <Icon aria-hidden="true" className="size-4 shrink-0" /> : null}
        <span className="flex-1 truncate text-left">{item.label}</span>
        <LuChevronDown
          aria-hidden="true"
          className={cn('size-3.5 shrink-0 transition-transform', isExpanded && 'rotate-180')}
        />
      </button>

      {isExpanded ? (
        <ul className="mt-0.5 space-y-0.5">
          {item.children?.map((child) => (
            <NavLeaf
              key={child.id}
              item={child}
              isCollapsed={false}
              onNavigate={onNavigate}
              depth={1}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/** Placeholder rail shown while the access policy resolves. */
function NavSkeleton({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div className="flex flex-col gap-1 px-2 py-3" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn('h-7 rounded-md', isCollapsed ? 'w-8 self-center' : 'w-full')}
        />
      ))}
    </div>
  );
}

/**
 * Sidebar navigation tree.
 *
 * Items the user cannot access are filtered out entirely rather than disabled:
 * showing a locked door to a feature someone will never have is noise, not
 * information.
 *
 * The filtering itself is `useAuthorizedNavigation`'s job — it consults the
 * server-issued policy first — so this component stays presentational and the
 * rule lives in exactly one place.
 */
export function SidebarNav({ sections, isCollapsed = false, onNavigate }: SidebarNavProps) {
  const { sections: authorizedSections, isLoading } = useAuthorizedNavigation(sections);

  // A skeleton rather than an empty rail: navigation appearing item by item
  // reads as a broken menu, and an empty one reads as lost access.
  if (isLoading) return <NavSkeleton isCollapsed={isCollapsed} />;

  return (
    <nav aria-label="Main" className="flex flex-col gap-4 px-2 py-3">
      {authorizedSections.map((section) => {
        const items = section.items;

        return (
          <div key={section.id}>
            {section.label && !isCollapsed ? (
              <h2 className="mb-1 px-2 text-2xs font-semibold tracking-wider text-fg-subtle uppercase">
                {section.label}
              </h2>
            ) : null}

            {/* A hairline stands in for the heading in the icon rail. */}
            {section.label && isCollapsed ? <div className="mx-2 mb-2 h-px bg-border" /> : null}

            <ul className="space-y-0.5">
              {items.map((item) =>
                item.children?.length ? (
                  <NavGroup
                    key={item.id}
                    item={item}
                    isCollapsed={isCollapsed}
                    onNavigate={onNavigate}
                  />
                ) : (
                  <NavLeaf
                    key={item.id}
                    item={item}
                    isCollapsed={isCollapsed}
                    onNavigate={onNavigate}
                  />
                ),
              )}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
