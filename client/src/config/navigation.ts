import type { IconType } from 'react-icons';
import { LuComponent, LuLayoutDashboard, LuSettings, LuTable } from 'react-icons/lu';

import type { Permission } from '@/features/auth';

import { ROUTES } from './routes';

export interface NavItem {
  id: string;
  label: string;
  to?: string;
  icon?: IconType;
  /** Hidden unless the user holds at least one of these permissions. */
  requiredPermissions?: Permission[];
  /** Trailing count or status text. */
  badge?: string;
  /** Nested items render as a collapsible group. */
  children?: NavItem[];
}

export interface NavSection {
  id: string;
  /** Omit on the first section to avoid a redundant heading. */
  label?: string;
  items: NavItem[];
}

/**
 * Sidebar navigation.
 *
 * The template ships infrastructure destinations only — no business modules.
 * A product adds its sections to this array and nothing else in the shell
 * changes: permission filtering, active state, the collapsed icon rail and the
 * mobile drawer all read from here.
 *
 * Ordering convention: daily-use destinations first, configuration last.
 */
export const NAVIGATION: NavSection[] = [
  {
    id: 'overview',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        to: ROUTES.dashboard,
        icon: LuLayoutDashboard,
      },
    ],
  },
  {
    // Reference material. Delete this section when forking for a real product.
    id: 'reference',
    label: 'Reference',
    items: [
      {
        id: 'design-system',
        label: 'Design system',
        to: ROUTES.designSystem,
        icon: LuComponent,
      },
      {
        id: 'data-table',
        label: 'Data table',
        to: ROUTES.designSystemDataTable,
        icon: LuTable,
      },
    ],
  },
  {
    id: 'platform',
    label: 'Platform',
    items: [
      {
        id: 'settings',
        label: 'Settings',
        icon: LuSettings,
        children: [
          { id: 'settings-profile', label: 'Profile', to: ROUTES.settingsProfile },
          { id: 'settings-appearance', label: 'Appearance', to: ROUTES.settingsAppearance },
        ],
      },
    ],
  },
];
