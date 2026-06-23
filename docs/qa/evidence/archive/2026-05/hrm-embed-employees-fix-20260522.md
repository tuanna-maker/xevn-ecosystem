# HRM embed employees — Dev-FE evidence

**work_item_id:** `HRM-EMBED-EMPLOYEES-FIX-01`  
**date:** 2026-05-22  
**owner:** dev-fe  
**ack_status:** `READY_FOR_QA`

## Summary

Fixed portal iframe `/command-center/hrm/employees` → `/hr/employees?portal=1` so Nest HRM API calls use portal JWT, `page_size` ≤ 100, and Supabase `54321` is skipped for employees/departments/subscription probes in API/portal mode.

## Root causes addressed

| ID | Issue | Fix |
|----|--------|-----|
| P0 | `useEmployees` sent `page_size: 200` → 400 `HRM-VAL-001` | `HRM_API_MAX_PAGE_SIZE` (100) in hook + `buildListSearchParams` clamps all Nest list calls in `hrmApi.ts` |
| P1 | iframe HRM API used Supabase session, not portal JWT | `portalAuthBridge.ts` reads `xevn.portal.accessToken`; `hrmApi.ts` headers prefer portal token |
| P2 | `Employees.tsx` + `AuthContext` still hit `127.0.0.1:54321` | `shouldSkipSupabaseDataFetches()` when `VITE_HRM_USE_API` (default true) + portal session |
| UX | Validation error showed empty table as “no data” | `fetchError` state + error panel with retry |
| UX | Epoch `01/01/1970` on invalid dates | `formatHrmDateVi` + safer `joinDate` in `HrmWorkspacePanel` |

## Changed files

- `apps/web/hrm/src/lib/portalAuthBridge.ts` (+ test)
- `apps/web/hrm/src/lib/hrmDataMode.ts` (+ test)
- `apps/web/hrm/src/lib/formatHrmDate.ts`
- `apps/web/hrm/src/integrations/hrmApi.ts`
- `apps/web/hrm/src/hooks/useEmployees.ts`
- `apps/web/hrm/src/pages/Employees.tsx`
- `apps/web/hrm/src/contexts/AuthContext.tsx`
- `apps/web/hrm/src/components/layout/HrmApiSyncBanner.tsx`
- `apps/web/hrm/src/hooks/useCompanySubscription.ts`
- `apps/web/hrm/.env.example`, `apps/web/hrm/src/vite-env.d.ts`
- `apps/web/web-portal/src/modules/hrm/hrmApiClient.ts` (`page_size: 100` on `listHrmEmployees`)
- `apps/web/web-portal/src/modules/hrm/HrmWorkspacePanel.tsx`, `formatJoinDate.ts` (join date display)

## Build / test evidence

```text
pnpm --filter vite_react_shadcn_ts run build  → PASS (2026-05-22)
pnpm --filter web-portal run build            → PASS (2026-05-22)
cd apps/web/hrm && pnpm test                  → PASS (9 tests, incl. portalAuthBridge + hrmDataMode)
```

## QA re-test matrix

**Pre:** Login portal `ceo@xe.vn` / `Xevn@2026` → `http://localhost:5175/command-center/hrm/employees`

| # | Check | Expected |
|---|--------|----------|
| U1 | HRM API Sync banner | Not ERROR when portal logged in; catalog-sync **200** or idle (not 401) |
| U2 | Network `GET /api/hrm/employees?...` | **200**, `page_size=100` (not 200) |
| U3 | Employee table | Rows visible (seed ~10 for `company_id=main`) |
| U4 | Console | No required `127.0.0.1:54321/rest/v1/departments` or `employees` on load |
| U5 | Empty state | Only when API returns `data: []` without error |
| U6 | Toast | No “Dữ liệu gửi lên chưa hợp lệ” on initial load |

**API smoke (optional):**

```bash
# After portal login, copy JWT from sessionStorage xevn.portal.accessToken
curl -s -H "Authorization: Bearer $TOKEN" "http://127.0.0.1:5175/api/hrm/employees?company_id=main&page_size=100"
```

## Residual risk

- Other HRM screens still use Supabase for non-employee domains (payroll, attendance legacy) — out of slice.
- `useTasks` / `useReportsData` still pass `page_size` > 100 on other routes; not exercised on employees embed.

---

## QA retest (after dev-fe READY_FOR_QA) — 2026-05-22

**work_item_id:** `HRM-EMBED-EMPLOYEES-FIX-01`  
**qa_owner:** qa  
**environment:** local — HRM `28001`, XBOS `28002`, portal `5175` (`qc-dev-stack.mjs` PASS)  
**account:** `ceo@xe.vn` / `Xevn@2026`  
**verdict:** **FAIL** → `dev-fe` (no `PASS_TO_QC`)

### Matrix

| # | Check | Result | Evidence |
|---|--------|--------|----------|
| 1 | Portal login `ceo@xe.vn` @ `:5175` | **PASS** | XBOS login HTTP 200, `expiresInSec=86400`; session inject + `/command-center/hrm/employees` loads |
| 2 | `GET /api/hrm/employees?page_size=100` → 200 | **PASS** | Portal proxy `company_id=main`, 10 rows (`HRM-EMP-200`) |
| 3 | `page_size=200` → 400 | **PASS** | `HRM-VAL-001` via portal proxy |
| 4 | `/command-center/hrm/employees` — no HRM API Sync **ERROR** | **FAIL** | Iframe `companyId=xevn`; banner **ERROR** + `SCOPE_CONTEXT_MISMATCH`; 0 employees |
| 4b | (control) `/hr/employees?portal=1&companyId=main` | **PASS** | Banner **CONNECTED**; 10 rows; `page_size=100` in network |
| 5 | Supabase `54321` skip on employees load | **PARTIAL** | No `54321/.../employees`; still `subscription_plans` + `departments` (P2) |

### API smoke (automated)

```text
portalLogin ceo@xe.vn → 200, expiresInSec=86400
JWT claim companyId=main (not holding)
GET :5175/api/hrm/employees?company_id=main&page_size=100 → 200 (10 rows)
GET :5175/api/hrm/employees?company_id=main&page_size=200 → 400 HRM-VAL-001
GET :5175/api/hrm/employees?company_id=xevn&page_size=100 → 409 SCOPE_CONTEXT_MISMATCH
GET :5175/api/hrm/catalog-sync (x-company-id holding|xevn) → 409
GET :5175/api/hrm/catalog-sync (x-company-id main) → 200
```

### Browser UAT (Cursor MCP, zero user steps)

**Command Center (user path):** `http://localhost:5175/command-center/hrm/employees`

- iframe src: `/hr/employees?portal=1&tenantId=xevn&companyId=xevn`
- HRM API Sync: **ERROR** — «Phạm vi tenant/công ty không khớp với token.»
- Employees: **0**; request `company_id=xevn` (409 scope)
- Network: `page_size=100` present (P0 page_size fix **confirmed**)

**Control (aligned scope):** `?companyId=main` — CONNECTED, 10 employees, `GET ...employees?company_id=main&page_size=100` **200**

### Defects (open)

| ID | Sev | Summary | Owner |
|----|-----|---------|-------|
| HRM-EMBED-D1 | P0 | `HrmWorkspaceRoute` / `resolveIdentityScope` sets iframe `companyId=xevn` while portal JWT `companyId=main` → embed 409, ERROR banner, empty table | dev-fe (+ portal scope handoff) |
| HRM-EMBED-D2 | P2 | Embed load still calls `127.0.0.1:54321` for `subscription_plans` and `departments` | dev-fe |

### Closed vs prior QA FAIL

| Prior | Retest |
|-------|--------|
| `page_size: 200` → 400 | **Fixed** — clamp 100; proxy + iframe use `page_size=100` |
| iframe 401 / no portal JWT | **Fixed** — portal token on HRM API |
| catalog-sync 401 | **Improved** — fails with **409 scope** when header company ≠ JWT `main` |

### Handoff

- **qa → PM:** `FAIL` — partial API slice PASS; Command Center embed still blocked on D1.
- **qa → dev-fe:** Fix D1 (pass `companyId=main` or JWT-aligned company in iframe + `inferRuntimeScope`); optional D2; then `READY_FOR_QA`.

---

## Dev-FE fix D1/D2 — 2026-05-22

**work_item_id:** `HRM-EMBED-D1` (parent `HRM-EMBED-EMPLOYEES-FIX-01`)  
**ack_status:** `READY_FOR_QA`

### D1 (P0) — iframe companyId aligned with portal JWT

| Change | Detail |
|--------|--------|
| `identityScope.ts` | Read portal `xevn.portal.accessToken` first; master tenant prefers JWT `companyId` (e.g. `main`) over tenant id / `xevn` |
| `HrmWorkspaceRoute.tsx` | `resolveIdentityScope(selectedTenant.tenantId, null)` — không truyền `selectedCompany.id` làm tenant hint |
| `GlobalFilterContext.tsx` | `setActiveTenantScope` + `useTenantScope` dùng JWT company cho master |

**Expected iframe:** `/hr/employees?portal=1&tenantId=xevn&companyId=main` (khi JWT `companyId=main`)

### D2 (P2) — skip Supabase on embed

- `useDepartments.ts`, `useSubscriptionPlans.ts` — `enabled`/early return khi `shouldSkipSupabaseDataFetches()`

### Build

```text
pnpm --filter web-portal run build  → PASS
cd apps/web/hrm && pnpm build && pnpm test → PASS (9 tests)
```

---

## QA final retest D1

**work_item_id:** `HRM-EMBED-D1`  
**qa_owner:** qa  
**date:** 2026-05-22T13:45Z  
**environment:** HRM `:28001` (started PID 26288), XBOS `:28002` (PID 27580), portal `:5175` (already up)  
**account:** `ceo@xe.vn` / `Xevn@2026` (XBOS login + sessionStorage inject)  
**verdict:** **PASS** → `PASS_TO_PM`

### Matrix U1–U4 (`/command-center/hrm/employees`)

| # | Check | Result | Evidence |
|---|--------|--------|----------|
| U1 | HRM API Sync banner — not ERROR | **PASS** | iframe: `HRM API SyncCONNECTED`; `hasErrorBanner=false` |
| U2 | `GET /api/hrm/employees?...page_size=100` → 200 | **PASS** | Portal proxy `company_id=main` → **200**, `page_size=100`, `total=10` |
| U3 | Employee table — rows visible | **PASS** | iframe: «Danh sách nhân viên trong công ty - **10**»; 10 data rows (DL-001..DL-010) |
| U4 | iframe query `companyId=main` (not `xevn`) | **PASS** | iframe `src=/hr/employees?portal=1&tenantId=xevn&companyId=main` |

### API smoke (automated)

```text
GET /api/hrm → HRM-HEALTH-200
GET /api/xbos → XBOS-HEALTH-200
POST /api/xbos/auth/login ceo@xe.vn → 200, expiresInSec=86400, JWT companyId=main
GET :5175/api/hrm/employees?company_id=main&page_size=100 → 200 (10 rows, HRM-EMP-200)
```

### Browser UAT (Cursor MCP, session inject)

- URL: `http://localhost:5175/command-center/hrm/employees`
- Prior FAIL (iframe `companyId=xevn`, ERROR, 0 rows) **not reproduced** after dev-fe D1 fix.

### Defect HRM-EMBED-D1

| ID | Status |
|----|--------|
| HRM-EMBED-D1 | **CLOSED** (retest PASS) |

### Handoff

- **qa → PM:** `PASS_TO_PM` — Command Center embed employees path green for U1–U4.
- **Residual:** HRM-EMBED-D2 (54321 subscription/departments on embed) out of U1–U4 slice; defer unless PM reopens.
