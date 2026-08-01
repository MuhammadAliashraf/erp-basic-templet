import type { IconType } from 'react-icons';
import { LuComponent, LuKeyRound, LuLayoutDashboard, LuSettings, LuShieldCheck, LuTable, LuUsers } from 'react-icons/lu';

import type { AccessRequirementInput } from '@/lib/access';

import { ROUTES } from './routes';

export interface NavItem {
  /**
   * Stable identifier. Also the key the access policy uses to override this
   * item's requirement, so a destination can be hidden per role from the
   * backend without touching this file.
   */
  id: string;
  label: string;
  to?: string;
  icon?: IconType;
  /**
   * Default requirement: a permission key, a list (any-of), or a full rule.
   * Omit it for destinations every authenticated user may reach.
   */
  access?: AccessRequirementInput;
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
 * The tree describes *structure*. Whether a given user sees an item is decided
 * at runtime by `useAuthorizedNavigation`, which consults the access policy
 * first and the `access` declaration below only as a fallback — so no grant is
 * ever compiled into the bundle.
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
    id: 'administration',
    label: 'Administration',
    items: [
      {
        id: 'access-control',
        label: 'Access control',
        icon: LuShieldCheck,
        access: { anyOf: ['roles:read', 'permissions:read'] },
        children: [
          {
            id: 'access-roles',
            label: 'Roles',
            to: ROUTES.roles,
            icon: LuUsers,
            access: 'roles:read',
          },
          {
            id: 'access-permissions',
            label: 'Permissions',
            to: ROUTES.permissions,
            icon: LuKeyRound,
            access: 'permissions:read',
          },
        ],
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
