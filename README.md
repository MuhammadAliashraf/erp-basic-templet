# Enterprise Admin Template (ERP Basic Template)

A production-shaped **React 19 + TypeScript + Vite** admin starter, built to be cloned for any
internal portal or ERP-style product. Everything that is *infrastructure* — shell, auth, RBAC,
HTTP layer, state, design system — is already built and wired. Everything that is *business logic*
is deliberately absent, so a new product starts by adding modules rather than by deleting scaffolding.

The repository is a two-app workspace:

| Folder    | Stack                                | Status |
| --------- | ------------------------------------ | ------ |
| `client/` | React 19 · Vite 8 · TS 5.9 · Tailwind 4 · Redux Toolkit · RTK Query | **Complete** — this is the template |
| `server/` | NestJS 11                            | **Untouched CLI scaffold** (hello-world `AppController` only) |
| `docs/`   | —                                    | `original-brief.md` — the build brief this template was generated from |

> The client runs **standalone** with an in-browser mock API, so you can clone and explore it
> without any backend at all.

---

## Table of contents

1. [Quick start](#quick-start)
2. [What you get](#what-you-get)
3. [Architecture](#architecture)
4. [Folder structure](#folder-structure)
5. [The access-control (RBAC) system](#the-access-control-rbac-system)
6. [The design system](#the-design-system)
7. [HTTP & data layer](#http--data-layer)
8. [State management](#state-management)
9. [Component catalogue](#component-catalogue)
10. [Hooks catalogue](#hooks-catalogue)
11. [Configuration](#configuration)
12. [Backend API contract](#backend-api-contract)
13. [How to extend the template](#how-to-extend-the-template)
14. [Conventions enforced by tooling](#conventions-enforced-by-tooling)
15. [Known gaps & TODOs](#known-gaps--todos)

---

## Quick start

Requires **Node ≥ 20.19**.

```bash
cd client
npm install
cp .env.example .env.local     # optional — a committed .env already works
npm run dev                    # http://localhost:5173
```

**Demo credentials** (mock API, seeded in `src/mocks/fixtures.ts`):

```
email:    admin@example.com
password: password
```

The demo user holds the `*` wildcard grant, so every navigation item and every guarded button
is visible. Drop grants in the fixtures to watch the UI shrink.

### Scripts (`client/`)

| Script | What it does |
| ------ | ------------ |
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc -b` then production build into `dist/` |
| `npm run preview` | Serve the production build on :4173 |
| `npm run typecheck` | Project-references type check |
| `npm run lint` / `lint:fix` | ESLint 10 flat config, zero-warning policy |
| `npm run format` / `format:check` | Prettier + Tailwind class sorting |
| `npm run validate` | typecheck → lint → format check (use this in CI) |

### Running against a real backend

```dotenv
# client/.env.local
VITE_ENABLE_MOCK_API=false
VITE_DEV_PROXY_TARGET="http://localhost:3000"   # Vite proxies /api -> your server
```

The proxy keeps the browser same-origin in development, so cookie-based auth behaves exactly
as it will in production behind a reverse proxy.

### The NestJS server

```bash
cd server
pnpm install
pnpm start:dev        # http://localhost:3000 -> "Hello World!"
```

It is a bare `nest new` scaffold — no auth, no RBAC, no persistence. See
[Backend API contract](#backend-api-contract) for the endpoints the client expects you to build.

---

## What you get

**Application shell**
Responsive sidebar (expanded → collapsed icon rail → mobile overlay drawer), nested collapsible
menu groups, permission-filtered navigation, sticky topbar with breadcrumbs, search placeholder,
theme toggle and profile dropdown, `PageHeader` / `PageContainer` primitives, skip-link, root
error boundary, and dedicated 403 / 404 / route-error screens.

**Authentication**
Login, forgot-password, logout, "remember me", session bootstrap on reload, JWT **or** cookie
strategy (one env var), silent refresh with concurrent-401 queueing, auto-logout on refresh
failure, protected routes and guest-only routes.

**Enterprise RBAC**
A complete, *zero-hardcoded-permission* authorisation system covering menus, routes, API
endpoints, components, buttons and individual fields — plus an admin UI for roles and
permissions and a "preview as role" mode. See [the RBAC section](#the-access-control-rbac-system).

**Design system**
Two-layer token architecture (primitives → semantic aliases) on Tailwind 4, light/dark theming
via a single `data-theme` attribute, a dense 14px information-first type scale, and ~25 headless
UI primitives that all support dark mode, disabled and loading states.

**Data layer**
One Axios instance with request/response interceptors, correlation IDs, normalised `HttpError`,
RTK Query mounted on top of that instance (so cache, dedupe, invalidation and cancellation all
inherit the interceptor chain), typed pagination/sort/filter contracts, and an in-browser mock
backend installed as an Axios *adapter* rather than a bypass.

**Developer experience**
`@/` path alias, strict TS, import sorting, feature-barrel boundary enforced by ESLint,
runtime-validated env (Zod), stable vendor chunking for long-term caching, and per-route code
splitting.

---

## Architecture

Three rules explain most of the file layout.

**1. Feature-first, with a shared core.**
`src/features/<name>/` owns its own `api/`, `model/`, `hooks/`, `components/`, `guards/`, and
exports a single `index.ts` barrel. Everything outside the feature imports from that barrel only —
ESLint's `no-restricted-imports` rejects `@/features/rbac/hooks/use-can`. Internals stay
refactorable.

**2. Authorisation logic is pure and framework-free.**
`src/lib/access/` knows *how* a decision is made and nothing about React, Redux or your backend.
`src/features/rbac/` wires that engine to the store and the tree. This is what stops a second,
subtly different permission check from growing inside a page component.

**3. Declare requirements, never grants.**
`src/config/access.ts` says "the roles screen needs `roles:read`". It never says who holds
`roles:read` — that arrives at runtime from `/rbac/me/policy`. Adding a customer, retitling a role
or tightening a screen therefore needs no frontend release.

```
                        +-----------------------------+
  main.tsx --> env -->  |  AppProviders               |
                        |   Redux store               |
                        |   AppBootstrap (session)    |
                        |   PermissionProvider  <----- /rbac/me/policy
                        |   Toaster                   |
                        +--------------+--------------+
                                       |
                         RouterProvider (createBrowserRouter)
                                       |
             +-------------------------+-------------------------+
       PublicOnlyRoute                                     ProtectedRoute
             |                                                   |
        AuthLayout                                            AppShell
     login · forgot-password                 dashboard · design-system · settings
                                                                 |
                                                            RouteGuard
                                                /access/roles · /access/permissions
```

---

## Folder structure

```
client/src/
├── app/                        Composition root — wiring, no UI
│   ├── App.tsx
│   ├── providers/              app-providers · app-bootstrap
│   ├── router/                 routes.tsx · guards/(protected, public-only)
│   └── store/                  store · root-reducer · hooks · listener-middleware
│
├── components/                 Cross-feature, business-agnostic UI
│   ├── ui/                     25 headless primitives (button, modal, tabs, …)
│   ├── layout/                 app-shell · sidebar · topbar · page-header · …
│   ├── form/                   RHF + Zod field wrappers, useZodForm
│   ├── data/                   table primitives · DataTable
│   ├── feedback/               page-loader · empty-state · error-state · confirm-dialog
│   └── common/                 error-boundary · skip-link
│
├── config/                     Single source of truth for tunables
│   ├── env.ts                  Zod-validated import.meta.env
│   ├── app.config.ts           Names, timeouts, breakpoints, page sizes
│   ├── routes.ts               ROUTES registry + buildPath()
│   ├── navigation.ts           Sidebar tree
│   └── access.ts               Default requirements per route/menu/endpoint
│
├── features/
│   ├── auth/                   Identity: who you are
│   ├── rbac/                   Authorisation: what you may do
│   ├── notifications/          Toast slice + Toaster
│   └── ui/                     Theme, sidebar state, UI listeners
│
├── lib/                        Framework-agnostic building blocks
│   ├── access/                 Permission matcher + access evaluator (pure)
│   ├── api/                    apiSlice · axiosBaseQuery · cache tags
│   ├── http/                   httpClient · HttpError · tokenStore
│   ├── storage/                Namespaced, SSR-safe storage wrapper
│   ├── utils/                  cn · format · string · object · async
│   └── validation/             Shared Zod schemas
│
├── hooks/                      13 generic React hooks
├── pages/                      Route components (all lazily loaded)
│   └── auth/ dashboard/ access/ settings/ design-system/ system/
├── mocks/                      In-browser API + seed fixtures
├── styles/index.css            The entire design-token layer
└── types/                      api.ts (envelopes, pagination) · common.ts
```

---

## The access-control (RBAC) system

This is the centrepiece of the template. **No permission is compiled into the bundle.**

### The evaluation pipeline

```
session claims (JWT)  --+
                        +-->  AccessSubject  -->  isRequirementSatisfied(req)  --> boolean
/rbac/me/policy       --+     grants · denials · roles
role preview (admin)  --+     (indexed Sets, O(1))
```

`PermissionProvider` resolves these three layers, narrowest last, and publishes one evaluated
subject to the tree. The claims layer means the shell renders instantly on reload; the policy
layer is the authority; the preview layer lets an admin see the UI exactly as a given role will.

### Requirement syntax

Anywhere a requirement is accepted you can pass a string, an array (any-of), or the full object:

```ts
'roles:read'                                    // one key
['roles:read', 'roles:update']                  // any-of
{ anyOf: [...], allOf: [...], noneOf: [...],    // clauses AND together
  roles: ['auditor'], isPublic: false }
```

Permission keys are colon-separated (`billing:invoices:export`) and support wildcards:
`*` is the superuser grant, `roles:*` matches every action on `roles`. **A denial always beats a
grant**, including `*`.

### Permission scopes

| Scope | Enforced by | Example |
| ----- | ----------- | ------- |
| `menu` | `useAuthorizedNavigation` → sidebar hides the item | `reports:read` |
| `route` | `<RouteGuard>` → redirects to `/403` | `roles:read` |
| `page` | `<RouteGuard>` / `useRouteAccess` | `audit:read` |
| `api` | `useApiAccess` → check before firing a mutation | `users:export` |
| `component` | `<PermissionGuard>` / `<Can>` | `users:assign-roles` |
| `button` | `<PermissionButton>` → hides or disables | `roles:create` |
| `field` | `<FieldGuard>` / `useFieldAccess` → hidden \| read \| write | `reports:field:cost` |

### The toolkit

```tsx
import {
  Can, PermissionGuard, RouteGuard, FieldGuard, PermissionButton,
  useCan, useAccess, useFieldAccess, useApiAccess,
  useRouteAccess, useAuthorizedNavigation, useRolePreview,
} from '@/features/rbac';

// Conditional rendering — also takes anyOf / allOf / noneOf / roles,
// a `fallback`, mode="disable", or a render prop: {(allowed) => …}
<Can permission="users:create"><InviteButton /></Can>

// A button that owns its authorisation. Making `permission` a required prop
// moves "I forgot to guard this action" from runtime to compile time.
// whenDenied="disable" keeps it inert in place instead of removing it.
<PermissionButton permission="roles:delete" variant="danger">Delete</PermissionButton>

// Field-level masking — hidden | read | write
<FieldGuard resource="reports" field="cost"><CostColumn /></FieldGuard>

// Imperative check
const canExport = useCan(['reports:export']);
```

Route guarding needs **no arguments** — `<RouteGuard />` looks its requirement up from the
runtime policy, falling back to `config/access.ts`. A branch guard covers every child path:

```tsx
{ element: <RouteGuard />, children: [ /* all /access/* routes */ ] }
```

### Admin surfaces

`/access/roles`, `/access/roles/:id` and `/access/permissions` ship as working screens: role CRUD,
a permission matrix, permission CRUD with scope/group metadata, system-role protection, and
"preview as role" with a persistent banner.

---

## The design system

`src/styles/index.css` is the whole thing — no `tailwind.config.js` needed (Tailwind 4).

**Two token layers.** Primitives (`--color-brand-600`, `--color-neutral-200`) hold raw values.
Semantic aliases (`--color-surface`, `--color-fg-muted`, `--color-accent`, `--color-critical`)
are resolved through `@theme inline`, which emits utilities pointing at a `var()` rather than a
copied value — that indirection is what makes runtime theme switching work with zero duplicated CSS.

> **Rule:** components consume semantic tokens (`bg-surface`, `text-fg-muted`). Reaching for a
> primitive inside a component is a design-system violation. Changing `--app-accent` in one place
> re-brands the entire application.

**Theming.** `[data-theme='dark']` on `<html>`, with `@custom-variant dark` bound to that
attribute so an explicit user choice always beats the OS media query. Theme lives in the UI slice
and is persisted by a listener.

**Scales.** Dense, information-first type (body at **14px**, table meta at 11px — the SAP
Fiori / Fluent / Atlassian convention, not the 16px marketing default). Small radii (2–8px),
tight neutral shadows, `--ease-standard` motion, and shell metrics (`--spacing-sidebar: 15rem`,
`--spacing-sidebar-collapsed: 3.5rem`, `--spacing-topbar: 3rem`) exposed as tokens and mirrored in
`app.config.ts` so TS and CSS cannot drift.

**Baked-in accessibility.** One always-visible `:focus-visible` ring, `prefers-reduced-motion`
honoured globally, `scrollbar-gutter: stable` to stop modal-open layout shift, tabular numerals,
and a `.sr-only-focusable` utility.

Browse it live at **`/design-system`** and **`/design-system/data-table`**.

---

## HTTP & data layer

```
 RTK Query endpoint
       |  axiosBaseQuery()
       v
 httpClient (single Axios instance)
       |  request  -> bearer/cookie auth · X-Request-Id correlation id
       |  response -> 401 -> queued silent refresh -> retry -> else notifyUnauthorized()
       v             error -> normalizeError() -> HttpError -> serialisable payload
 network   (or the mock adapter, installed below the interceptor chain)
```

- **One instance, one refresh.** A page firing six parallel requests triggers **one** refresh;
  the rest await the same promise. `_retried` guards against refresh loops.
- **Two strategies, one env var.** `VITE_AUTH_STRATEGY=bearer` uses `Authorization` +
  `/auth/refresh`; `cookie` turns on `withCredentials` and lets httpOnly cookies do the work.
- **Errors stay serialisable.** `HttpError` is normalised into `ApiErrorPayload` before it enters
  Redux, so time-travel debugging and state persistence keep working.
- **Cancellation is free.** `api.signal` is forwarded, so unmounting a component aborts its request.
- **Typed envelopes.** `types/api.ts` defines `PaginatedResponse`, `ApiErrorPayload`, sort and
  filter contracts; `lib/api/tags.ts` centralises cache tags.
- **Imperative escape hatch.** `http.get/post/put/patch/delete` unwrap `response.data` for
  non-cacheable work such as file downloads. Prefer RTK Query for server state.

**The mock backend** (`VITE_ENABLE_MOCK_API=true`) replaces `httpClient.defaults.adapter`, so
requests are intercepted *below* the interceptors — auth headers, refresh and error normalisation
all still execute. 350ms of simulated latency keeps loading states visible. The module is only
imported when the flag is on, so it tree-shakes out of production builds.

---

## State management

`configureStore` with a deliberate middleware order: the listener middleware is **prepended**
(it must observe actions before reducers), RTK Query's middleware is **appended**.

| Slice | Owns |
| ----- | ---- |
| `auth` | Session status, current user, claims, auth errors |
| `rbac` | Resolved access policy, resolution status, role preview |
| `ui` | Theme, sidebar collapsed/open state |
| `notifications` | Toast queue (capped at `toastLimit`) |
| `api` | RTK Query cache (all server state) |

Notes worth knowing:

- **Server state is never duplicated into a slice.** Lists, roles and permissions live in the
  RTK Query cache only.
- `immutableCheck` runs in development only — deep-scanning every action is expensive on large tables.
- `setupListeners` is wired, so `refetchOnFocus` / `refetchOnReconnect` work.
- Listeners are registered at module scope (`registerUiListeners()`), not in a component — they
  belong to the store's lifetime and would otherwise double-register under StrictMode.
- Typed `useAppDispatch` / `useAppSelector` are the only accessors you should import.

---

## Component catalogue

### `components/ui/` — primitives
`Alert` · `Avatar` · `Badge` · `Breadcrumbs` · `Button` (+`buttonStyles`) · `Card` · `Checkbox` ·
`Drawer` · `DropdownMenu` · `IconButton` · `Input` · `Label` · `LinkButton` · `Modal` ·
`Pagination` · `Progress` · `Radio` · `Select` · `Separator` · `Skeleton` · `Spinner` · `Switch` ·
`Tabs` · `Textarea` · `Tooltip`

### `components/layout/`
`AppShell` · `AuthLayout` · `Sidebar` · `SidebarNav` · `NavTooltip` · `Topbar` · `UserMenu` ·
`ThemeToggle` · `PageHeader` · `PageContainer`

### `components/form/` — React Hook Form + Zod
`useZodForm` · `FormField` · `TextField` · `PasswordField` · `TextareaField` · `SelectField` ·
`CheckboxField` · `FormActions` · `FormError`

```tsx
const form = useZodForm({ schema: loginSchema, defaultValues: { email: '', password: '' } });
<TextField control={form.control} name="email" label="Email" />
```

### `components/data/`
`Table` primitives (`TableContainer`, `TableHead`, `TableRow`, `TableCell`, …) and **`DataTable`** —
a *controlled* listing table: sorting, selection and pagination state live with the caller (usually
in the URL), which is what makes a filtered view shareable. Supports loading skeletons, error +
retry, empty state, sticky columns, `hideOnMobile`, comfortable/compact density, and row selection.
Responsive strategy is horizontal scroll, not card transformation — operators comparing rows need
the tabular structure.

### `components/feedback/` and `common/`
`PageLoader` · `EmptyState` · `ErrorState` · `ConfirmDialog` · `ErrorBoundary` · `SkipLink`.
Toasts live in `features/notifications` (`useToast()` + `<Toaster />`).

---

## Hooks catalogue

| Hook | Purpose |
| ---- | ------- |
| `useDisclosure` | open/close/toggle state for modals and drawers |
| `useDebouncedValue` / `useDebouncedCallback` | search inputs, defaults to `searchDebounceMs` |
| `useMediaQuery` / `useBreakpoint` / `useResponsive` | breakpoints shared with `app.config.ts` |
| `useClickOutside` | dismiss popovers and menus |
| `useFocusTrap` | modal and drawer focus containment |
| `useLockBodyScroll` | scroll lock without layout shift |
| `useEventListener` / `useKeyDown` | typed listener attachment |
| `useLocalStorage` | SSR-safe persisted state |
| `usePagination` | page/pageSize state machine |
| `useDocumentTitle` | applies the `titleSuffix` from config |
| `useCopyToClipboard` | copy with a timed "copied" flag |
| `useFormErrorHandler` | maps API field errors onto RHF fields |

Feature hooks: `useAuth`, `useSessionBootstrap`, `useToast`, `useTheme`, and the RBAC set listed
[above](#the-toolkit).

---

## Configuration

### Environment (`client/.env.example`)

| Variable | Default | Purpose |
| -------- | ------- | ------- |
| `VITE_APP_NAME` | `Enterprise Admin` | Shell header, document title, login screen |
| `VITE_API_BASE_URL` | `/api` | Relative (proxy) or absolute origin |
| `VITE_API_TIMEOUT` | `30000` | Request timeout, ms |
| `VITE_AUTH_STRATEGY` | `bearer` | `bearer` or `cookie` |
| `VITE_ENABLE_MOCK_API` | `true` | Serve everything in-browser |
| `VITE_DEV_SERVER_PORT` | `5173` | Vite dev port |
| `VITE_DEV_PROXY_TARGET` | — | Proxy `/api` to a running backend |

Only `VITE_`-prefixed variables reach the bundle, and **everything in that file is public once
built** — never put secrets there. `src/config/env.ts` validates the whole set with Zod at startup,
so a misconfigured deployment fails loudly with an actionable message instead of silently at the
first network call.

### The four config files you will actually edit

| File | Edit it to… |
| ---- | ----------- |
| `config/app.config.ts` | Re-brand, re-tune timeouts, breakpoints, page sizes, toast limits |
| `config/routes.ts` | Register a URL once, then link via `ROUTES.x` (TypeScript-verified) |
| `config/navigation.ts` | Add a sidebar section or item |
| `config/access.ts` | Declare which permission a route / menu / endpoint requires |

### Build configuration

Vite injects `__APP_VERSION__` and `__BUILD_TIME__`, aliases `@` → `src`, targets `es2022`, and
splits vendors into `vendor-react`, `vendor-state` and `vendor-forms` — grouped by release cadence,
not size, so an application change does not invalidate the React bundle a user already has.

---

## Backend API contract

What the client calls. Implement these in `server/` (or any backend) to go live.

### Auth

| Method | Path | Notes |
| ------ | ---- | ----- |
| `POST` | `/auth/login` | `{ email, password, rememberMe }` → `{ user, accessToken, refreshToken? }` |
| `POST` | `/auth/logout` | |
| `GET`  | `/auth/me` | Session bootstrap on reload |
| `POST` | `/auth/refresh` | Called by the interceptor; may rotate the refresh token |
| `POST` | `/auth/forgot-password` | |
| `POST` | `/auth/reset-password` | `{ token, password }` |

### RBAC

| Method | Path | Notes |
| ------ | ---- | ----- |
| `GET` | `/rbac/me/policy` | **The important one.** Grants, denials, roles, and the menu/route/endpoint/field classification maps |
| `GET` / `POST` | `/rbac/roles` | Paginated list · create |
| `GET` / `PATCH` / `DELETE` | `/rbac/roles/:id` | |
| `PUT` | `/rbac/roles/:id/permissions` | Replace a role's grants, denials and field rules |
| `GET` / `POST` | `/rbac/permissions` | Catalogue list · create |
| `PATCH` / `DELETE` | `/rbac/permissions/:id` | |

`AccessPolicy` shape (see `features/rbac/model/rbac.types.ts`, seeded in `mocks/rbac-fixtures.ts`):

```ts
{
  roles: string[]; permissions: string[]; denied: string[];
  menus:     Record<string, AccessRequirement>;   // nav item id     -> requirement
  routes:    Record<string, AccessRequirement>;   // route path      -> requirement
  endpoints: Record<string, AccessRequirement>;   // "GET /path"     -> requirement
  fields:    Record<string, FieldAccessLevel>;    // "resource.field"-> hidden|read|write
  version: string; issuedAt: string;
}
```

Because those maps come from the server, a deployment can re-classify any menu, route, endpoint or
field **without a frontend release**.

> Enforce every one of these rules on the server too. The client-side checks are a UX layer —
> they decide what to *show*, never what is *allowed*.

---

## How to extend the template

### Add a page

1. Add the path to `config/routes.ts`.
2. Add a `lazy()` import and a route object in `app/router/routes.tsx`.
3. Declare its requirement in `config/access.ts` if it is restricted.
4. Add a nav entry in `config/navigation.ts` if it belongs in the sidebar.

Nothing in the shell changes — permission filtering, active state, the collapsed rail and the
mobile drawer all read from those config files.

### Add a feature module

```
src/features/inventory/
├── api/inventory.api.ts        injectEndpoints on apiSlice, tagged for invalidation
├── model/inventory.types.ts
├── model/inventory.schemas.ts  Zod
├── model/inventory.slice.ts    only if you need client state
├── hooks/  components/
└── index.ts                    the public barrel — the only import path allowed
```

Then register the reducer in `app/store/root-reducer.ts` (slices only; RTK Query needs no wiring)
and add any `register*Listeners()` call to `app/store/index.ts`.

### Add permissions

Define the keys on the server, expose them through `/rbac/permissions`, and reference them from
`config/access.ts` and your `<Can>` / `<PermissionButton>` props. Nothing else needs to change —
and nothing needs redeploying when a role's grants change.

### Fork it for a real product

- Delete the `reference` section from `config/navigation.ts`.
- Delete `pages/design-system/`, its routes and `example-records.api.ts`.
- Replace `src/mocks/` fixtures (or turn the mock off entirely).
- Re-brand in `config/app.config.ts` and swap `--color-brand-*` in `styles/index.css`.

---

## Conventions enforced by tooling

ESLint (flat config, `--max-warnings 0`) enforces more than style:

- **Feature boundaries** — `@/features/*/*` imports are rejected; use the barrel.
- **No deep relative paths** — `../../*` is rejected; use `@/`.
- **No `any`**, no `debugger`, no bare `console` (`warn`/`error` allowed), strict `eqeqeq`,
  `prefer-const`, object shorthand.
- **`import type`** required for type-only imports, inline fix style.
- **Deterministic import order** via `simple-import-sort`, so diffs stay small.
- Prettier with `prettier-plugin-tailwindcss` sorts utility classes.

Naming: files are `kebab-case`, components `PascalCase`, hooks `use-*.ts`, slices `*.slice.ts`,
API modules `*.api.ts`, schemas `*.schemas.ts`, types `*.types.ts`.

---

## Security notes for a public fork

This repository is safe to publish as-is: it contains no keys, tokens or credentials, and none
have ever been committed. A few things are worth understanding before you add your own.

**Nothing prefixed `VITE_` is secret.** Vite inlines those values into the JavaScript bundle at
build time, so anyone who loads the app can read them. `client/.env` is therefore committed on
purpose — it holds only public configuration, and tracking it is what lets a fresh clone run the
demo with no setup. Never add an API key, token, password or connection string to it. Local
overrides belong in `.env.local` (git-ignored); real secrets belong to the server's environment.

**The demo credentials are fixtures, not accounts.** `admin@example.com` / `password` exists only
inside `src/mocks/fixtures.ts` and is checked by an in-browser mock. There is no account, no
database and no network call behind it. Delete `src/mocks/` when you wire a real backend.

**Client-side permission checks are a UX layer.** Every guard in `features/rbac` decides what to
*render*. Any user can edit the bundle in their browser. Re-enforce every rule on the server.

**The token store.** `lib/http/token-store.ts` keeps the access token in memory by default. If you
switch it to `localStorage`, understand that you are trading XSS resistance for convenience —
prefer `VITE_AUTH_STRATEGY=cookie` with httpOnly cookies for anything holding real data.

**Before you push:** `git log --all -p | grep -iE 'api[_-]?key|secret|token'` is a cheap sanity
check, and enabling GitHub secret scanning plus push protection on the repository is free.

---

## License

No license file is included yet. Without one, default copyright applies and nobody may legally
reuse the template — add a `LICENSE` (MIT is the conventional choice for a starter) before
promoting it.

---

## Known gaps & TODOs

Being explicit about what is *not* done, so nobody discovers it the hard way.

**The mock API does not cover RBAC.** `mock-adapter.ts` only handles `/auth/*` and
`/example-records`. `/rbac/me/policy` and `/rbac/roles|permissions` return 404 from the mock, so the
Roles and Permissions screens show an error state in standalone mode, and the access policy falls
back to the session claims (`*`, hence a fully visible UI). `MOCK_ROLES` and `MOCK_ACCESS_POLICY`
are written but **not yet wired into the adapter** — doing so is the fastest way to make the
template fully self-contained.

**The server is a scaffold.** `server/src` is the stock NestJS hello-world. Every endpoint in the
[API contract](#backend-api-contract) still needs building.

**Not yet implemented from [the original brief](docs/original-brief.md):**

- **User management module** — list, CRUD, activate/deactivate, role assignment, audit fields.
  (The `users:*` permission keys already exist in the catalogue, waiting for it.)
- **Reset password / change password screens** — the API endpoint and schema exist; the UI does not.
- **UI primitives**: multi-select, date picker, time picker, popover, accordion, search bar,
  filter panel, file upload, image upload.
- **API helpers**: request-retry wiring (`retryCount` is configured but unused) and file
  upload/download helpers.
- **Tests** — no test runner is configured on the client.
