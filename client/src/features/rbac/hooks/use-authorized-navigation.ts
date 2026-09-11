import { useMemo } from 'react';

import type { NavItem, NavSection } from '@/config/navigation';

import { usePermissionContext } from '../context/permission-context';

export interface AuthorizedNavigation {
  /** The tree with everything the user cannot reach removed. */
  sections: NavSection[];
  /** True while the policy is still resolving — render a skeleton, not an empty rail. */
  isLoading: boolean;
}

/**
 * Filters the navigation tree against the effective policy.
 *
 * Two sources decide an item's fate, policy first:
 *   - `policy.menus[item.id]`, so an operator can hide a destination for a role
 *     without a frontend release;
 *   - the item's own `access` declaration, which is the client's default.
 *
 * Inaccessible items are *removed*, not disabled. A greyed-out link to a
 * feature someone will never be granted is noise; worse, it leaks the shape of
 * the system to users who should not see it.
 *
 * A group whose children have all been filtered away is dropped too — it would
 * expand to nothing, which reads as a broken menu rather than a hidden one.
 */
export function useAuthorizedNavigation(sections: readonly NavSection[]): AuthorizedNavigation {
  const { can, requirementFor, isReady } = usePermissionContext();

  const authorizedSections = useMemo(() => {
    const isVisible = (item: NavItem): boolean =>
      can(requirementFor('menu', item.id) ?? item.access);

    const filterItem = (item: NavItem): NavItem | null => {
      if (!isVisible(item)) return null;

      if (!item.children?.length) return item;

      const children = item.children
        .map(filterItem)
        .filter((child): child is NavItem => child !== null);

      // A parent that is also a destination survives losing its children.
      if (children.length === 0 && !item.to) return null;

      return { ...item, children };
    };

    return sections
      .map((section) => ({
        ...section,
        items: section.items.map(filterItem).filter((item): item is NavItem => item !== null),
      }))
      .filter((section) => section.items.length > 0);
  }, [can, requirementFor, sections]);

  return { sections: authorizedSections, isLoading: !isReady };
}
