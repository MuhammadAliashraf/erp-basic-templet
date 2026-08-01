import { lazy } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router';

import { AppShell, AuthLayout } from '@/components/layout';
import { ROUTES } from '@/config/routes';
import { RouteGuard } from '@/features/rbac';

import { ProtectedRoute, PublicOnlyRoute } from './guards';

/**
 * Route table.
 *
 * Every page is code-split. The shell, guards and layouts stay in the initial
 * bundle — they are needed on first paint — while each screen arrives on
 * navigation. `<Suspense>` boundaries live in the layouts, so a route change
 * shows the page loader inside the frame rather than blanking the whole app.
 *
 * Two guards, two concerns: `<ProtectedRoute>` asks whether anyone is signed
 * in, `<RouteGuard>` asks whether *this* principal may be here. The second
 * needs no arguments — it looks the requirement up from the access policy,
 * falling back to `config/access.ts` — so a route's classification can be
 * changed server-side without touching this file.
 *
 * Adding a screen:
 *   1. add its path to `config/routes.ts`;
 *   2. add a `lazy()` import and a route object here;
 *   3. declare its requirement in `config/access.ts` if it is restricted;
 *   4. add a nav entry in `config/navigation.ts` if it belongs in the sidebar.
 */

/* Public */
const LoginPage = lazy(() => import('@/pages/auth/login-page'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/forgot-password-page'));

/* Authenticated */
const DashboardPage = lazy(() => import('@/pages/dashboard/dashboard-page'));
const DesignSystemPage = lazy(() => import('@/pages/design-system/design-system-page'));
const DataTablePage = lazy(() => import('@/pages/design-system/data-table-page'));
const SettingsLayout = lazy(() => import('@/pages/settings/settings-layout'));
const ProfilePage = lazy(() => import('@/pages/settings/profile-page'));
const AppearancePage = lazy(() => import('@/pages/settings/appearance-page'));

/* Access control */
const RolesPage = lazy(() => import('@/pages/access/roles-page'));
const RoleDetailPage = lazy(() => import('@/pages/access/role-detail-page'));
const PermissionsPage = lazy(() => import('@/pages/access/permissions-page'));

/* System */
const ForbiddenPage = lazy(() => import('@/pages/system/forbidden-page'));
const NotFoundPage = lazy(() => import('@/pages/system/not-found-page'));
const RouteErrorPage = lazy(() => import('@/pages/system/route-error-page'));

export const routes: RouteObject[] = [
  {
    // A single error element at the root catches failures from every branch,
    // including a lazy chunk that fails to load after a deployment.
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <PublicOnlyRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: ROUTES.login, element: <LoginPage /> },
              { path: ROUTES.forgotPassword, element: <ForgotPasswordPage /> },
            ],
          },
        ],
      },

      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppShell />,
            children: [
              { index: true, element: <Navigate to={ROUTES.dashboard} replace /> },

              { path: ROUTES.dashboard, element: <DashboardPage /> },

              { path: ROUTES.designSystem, element: <DesignSystemPage /> },
              { path: ROUTES.designSystemDataTable, element: <DataTablePage /> },

              {
                // One guard for the whole branch: the requirement declared for
                // `/access` covers every child path unless a child declares a
                // narrower one of its own.
                element: <RouteGuard />,
                children: [
                  {
                    path: ROUTES.accessControl,
                    element: <Navigate to={ROUTES.roles} replace />,
                  },
                  { path: ROUTES.roles, element: <RolesPage /> },
                  { path: ROUTES.roleDetail, element: <RoleDetailPage /> },
                  { path: ROUTES.permissions, element: <PermissionsPage /> },
                ],
              },

              {
                path: ROUTES.settings,
                element: <SettingsLayout />,
                children: [
                  { index: true, element: <Navigate to={ROUTES.settingsProfile} replace /> },
                  { path: ROUTES.settingsProfile, element: <ProfilePage /> },
                  { path: ROUTES.settingsAppearance, element: <AppearancePage /> },
                ],
              },

              { path: ROUTES.forbidden, element: <ForbiddenPage /> },
              // Unknown paths inside the app keep the shell, so the user can
              // navigate away without a reload.
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
