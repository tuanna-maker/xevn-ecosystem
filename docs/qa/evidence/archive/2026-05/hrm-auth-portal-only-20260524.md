# HRM auth portal-only — manual evidence (HRM-AUTH-PORTAL-ONLY-01)

**Date:** 2026-05-24  
**Owner:** Dev-FE  
**Verdict:** PASS (automated unit tests) + manual steps below for QA L2

## Change summary

- HRM `/login`, `/register`, `/forgot-password`, `/reset-password` → redirect to X-BOS Portal `/login?redirect=...`
- Unauthenticated protected routes on standalone `:8080` → portal login (not Supabase UI)
- `portal=1` iframe embed unchanged (`ProtectedRoute` skips external redirect)
- Portal sidebar no longer links to `localhost:8080` for legacy `/hr` paths

## Manual steps

### 1. Standalone HRM login deprecated

1. Start portal: `pnpm run dev:web-only` (or full dev stack) on **5175**
2. Start HRM: `pnpm run dev` in `apps/web/hrm` on **8080** (optional)
3. Open `http://localhost:8080/hr/login` (or `http://127.0.0.1:8080/hr/login`)
4. **Expect:** brief “Đăng nhập qua X-BOS Portal” then browser navigates to  
   `http://127.0.0.1:5175/login?redirect=%2Fcommand-center%2Fhr%2Fdashboard` (or configured `VITE_PORTAL_PUBLIC_ORIGIN`)

### 2. Portal login → Command Center HRM

1. On portal login, use `ceo@xe.vn` / `Xevn@2026`
2. **Expect:** land on `/command-center/hrm/dashboard` (or `redirect` target from step 1)
3. HRM iframe loads with `?portal=1&tenantId=…&companyId=…`
4. Employee list loads via `/api/hrm` (no Supabase `54321` required when `VITE_HRM_USE_API=true`)

### 3. Protected route without session (standalone)

1. Open `http://localhost:8080/hr/employees` logged out
2. **Expect:** redirect to portal login with `redirect=/command-center/hrm/employees`

### 4. Command Center SSO (no second login)

1. Log in once on portal (`/login`) as CEO with Command Center access
2. Open **Command Center → HRM** (any menu item)
3. **Expect:** iframe loads immediately; **no** nested login form inside the HRM panel; **no** navigation to `/login` in the iframe
4. `sessionStorage` key `xevn.portal.accessToken` present on portal origin (shared with proxied `/hr`)

### 5. Embed regression (`portal=1`)

1. While still logged in, open `http://127.0.0.1:5175/command-center/hrm/employees`
2. **Expect:** iframe loads; no redirect loop; data visible for scoped tenant/company

### 6. HRM-only account (no Command Center)

1. Account without CC membership opens `http://localhost:8080/hr/employees` logged out
2. **Expect:** redirect to portal `/login?redirect=…` (standalone handoff — not Supabase login UI)

### 7. Console check

- **FAIL if:** `ERR_CONNECTION_REFUSED` to `127.0.0.1:54321` on pilot paths with API mode on
- Supabase may still load for non-migrated features; login must not depend on `54321`

## Automated evidence

```bash
cd apps/web/hrm && pnpm test
pnpm --filter web-portal exec vitest run src/modules/hrm/paths.test.ts
pnpm --filter web-portal run build
```

Record exit codes in QA handoff.

## Files (primary)

- `apps/web/hrm/src/lib/portalLogin.ts`
- `apps/web/hrm/src/components/auth/PortalLoginRedirect.tsx`
- `apps/web/hrm/src/components/auth/ProtectedRoute.tsx`
- `apps/web/web-portal/src/pages/auth/LoginPage.tsx`
- `apps/web/web-portal/src/components/layout/Sidebar.tsx`
