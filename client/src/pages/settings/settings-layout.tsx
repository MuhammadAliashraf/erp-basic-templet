import { NavLink, Outlet } from 'react-router';

import { PageContainer, PageHeader } from '@/components/layout';
import { ROUTES } from '@/config/routes';
import { cn } from '@/lib/utils';

const SETTINGS_NAV = [
  { to: ROUTES.settingsProfile, label: 'Profile', description: 'Your name and contact details' },
  { to: ROUTES.settingsAppearance, label: 'Appearance', description: 'Theme and display density' },
];

/**
 * Two-pane settings layout.
 *
 * A vertical sub-nav on desktop, collapsing to a horizontal scroller on mobile.
 * The pattern generalises: add a section by appending to `SETTINGS_NAV` and
 * registering a child route.
 */
export default function SettingsLayout() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account and workspace preferences."
        breadcrumbs={[{ label: 'Home', to: ROUTES.dashboard }, { label: 'Settings' }]}
      />

      <PageContainer width="default">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <nav aria-label="Settings sections" className="shrink-0 lg:w-56">
            <ul className="flex scrollbar-none gap-1 overflow-x-auto border-b border-border lg:flex-col lg:border-b-0">
              {SETTINGS_NAV.map((item) => (
                <li key={item.to} className="shrink-0 lg:w-full">
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'block rounded-md px-3 py-2 text-sm whitespace-nowrap transition-colors',
                        // Underline on mobile (a tab bar), filled pill on desktop.
                        isActive
                          ? 'font-medium text-accent-fg lg:bg-surface-selected'
                          : 'text-fg-muted hover:bg-surface-hover hover:text-fg',
                      )
                    }
                  >
                    <span className="block">{item.label}</span>
                    <span className="mt-0.5 hidden text-xs font-normal text-fg-subtle lg:block">
                      {item.description}
                    </span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0 flex-1">
            <Outlet />
          </div>
        </div>
      </PageContainer>
    </>
  );
}
