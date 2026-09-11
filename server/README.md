# Server

NestJS 11 backend for the Enterprise Admin Template.

> **Status: scaffold.** This is currently the stock `nest new` output — a single
> hello-world controller. None of the endpoints the client expects exist yet.

## Running

```bash
pnpm install
pnpm start:dev        # http://localhost:3000
```

| Script | Purpose |
| ------ | ------- |
| `pnpm start:dev` | Watch mode |
| `pnpm build` | Compile to `dist/` |
| `pnpm start:prod` | Run the compiled build |
| `pnpm lint` | ESLint with `--fix` |
| `pnpm test` / `test:e2e` / `test:cov` | Jest |

## What needs building

The client is already written against a specific contract. See
**[Backend API contract](../README.md#backend-api-contract)** in the root README
for the full list — in short:

- `POST /auth/login` · `/auth/logout` · `/auth/refresh` · `/auth/forgot-password` ·
  `/auth/reset-password`, and `GET /auth/me`
- `GET /rbac/me/policy` — the effective access policy for the signed-in user
  (grants, denials, roles, and the menu/route/endpoint/field classification maps)
- CRUD for `/rbac/roles` and `/rbac/permissions`

### Two rules to hold to

1. **Enforce every permission on the server.** The client's guards decide what to
   *show*; they are a UX layer and prove nothing about what is *allowed*.
2. **Keep secrets out of the client.** Anything prefixed `VITE_` is public. JWT
   signing keys, database URLs and third-party credentials belong here, loaded
   from an environment that is never committed (`.env` is git-ignored in this app).

## Connecting the client

Point the frontend at this server:

```dotenv
# client/.env.local
VITE_ENABLE_MOCK_API=false
VITE_DEV_PROXY_TARGET="http://localhost:3000"
```

Vite then proxies `/api` here, keeping the browser same-origin so cookie-based
auth behaves exactly as it will in production.
