import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';

import { useAppDispatch, useAppSelector } from '@/app/store';
import {
  mobileSidebarSet,
  selectIsMobileSidebarOpen,
  selectIsSidebarCollapsed,
  sidebarToggled,
} from '@/features/ui';
import { useResponsive } from '@/hooks';

import { PageLoader } from '../feedback/page-loader';
import { Drawer } from '../ui/drawer';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

/**
 * The authenticated application frame.
 *
 * Layout uses a full-height flex column with an independently scrolling main
 * region, so the top bar and sidebar stay fixed while content scrolls — the
 * behaviour every desktop console has and the reason the layout is not simply
 * `document`-scrolled.
 *
 * Responsive contract:
 *   >= lg   persistent sidebar, collapsible to an icon rail
 *   <  lg   sidebar becomes an overlay drawer, dismissed on navigation
 */
export function AppShell() {
  const dispatch = useAppDispatch();
  const isCollapsed = useAppSelector(selectIsSidebarCollapsed);
  const isMobileSidebarOpen = useAppSelector(selectIsMobileSidebarOpen);
  const { isCompactLayout } = useResponsive();
  const { pathname } = useLocation();

  // Closing on navigation is essential: leaving the drawer open over the new
  // page is one of the most common mobile navigation bugs.
  useEffect(() => {
    dispatch(mobileSidebarSet(false));
  }, [pathname, dispatch]);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-canvas">
      {!isCompactLayout ? (
        <Sidebar isCollapsed={isCollapsed} onToggleCollapse={() => dispatch(sidebarToggled())} />
      ) : (
        <Drawer
          isOpen={isMobileSidebarOpen}
          onClose={() => dispatch(mobileSidebarSet(false))}
          side="left"
          size="sm"
          hasHeader={false}
          aria-label="Main navigation"
        >
          <Sidebar
            isCollapsed={false}
            onToggleCollapse={() => dispatch(sidebarToggled())}
            isInDrawer
            onNavigate={() => dispatch(mobileSidebarSet(false))}
          />
        </Drawer>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMobileSidebar={() => dispatch(mobileSidebarSet(true))} />

        {/* `id` is the target of the skip link in AppProviders. */}
        <main id="main-content" tabIndex={-1} className="min-h-0 flex-1 overflow-y-auto">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
