# HRM embed contracts — Dev-FE evidence

**work_item_id:** `HRM-EMBED-CONTRACTS-01`  
**parent:** `HRM-EMBED-D1` (employees PASS)  
**date:** 2026-05-22  
**owner:** dev-fe  
**ack_status:** `READY_FOR_QA`

## Summary

Fixed portal iframe `/command-center/hrm/contracts` so contract list and settings-catalogs use Nest HRM API with portal JWT scope (`companyId=main`), matching the employees embed pattern. Supabase `127.0.0.1:54321/rest/v1/contracts` is no longer required on contracts load in portal/API mode.

## Root causes addressed

| ID | Issue | Fix |
|----|--------|-----|
| P0 | `Contracts.tsx` queried Supabase `contracts` → `ERR_CONNECTION_REFUSED` on `:54321` | `useContracts` + `shouldSkipSupabaseDataFetches()` → `listEmployeeContracts` + `listEmployees` |
| P0 | `settings-catalogs` **409** — scope `companyId` ≠ portal JWT | `resolveHrmSpreadsheetScope()` prefers JWT `companyId` (`main`) over iframe/query `xevn` |
| P1 | Employee dropdown on create still hit Supabase | `employees-list` query uses `listEmployees` when portal mode |
| UX | Empty table masked API/scope errors | `fetchError` banner + retry on contracts page |

## Changed files

- `apps/web/hrm/src/lib/hrmSpreadsheetScope.ts` (+ test)
- `apps/web/hrm/src/hooks/useContracts.ts` (new)
- `apps/web/hrm/src/pages/Contracts.tsx`
- `apps/web/hrm/src/integrations/hrmApi.ts` (`inferRuntimeScope` → shared resolver)
- `apps/web/hrm/src/components/settings/SettingsCatalogsTab.tsx`
- `apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx`

## Build / test evidence

```text
cd apps/web/hrm && pnpm test   → PASS (11 tests, incl. hrmSpreadsheetScope)
cd apps/web/hrm && pnpm build  → PASS (2026-05-22)
cd apps/web/web-portal && pnpm build → PASS (2026-05-22)
```

## QA re-test matrix

**Pre:** Login portal `ceo@xe.vn` / `Xevn@2026` → `http://localhost:5175/command-center/hrm/contracts`

| # | Check | Expected |
|---|--------|----------|
| C1 | HRM API Sync banner | CONNECTED or idle — not ERROR from scope mismatch |
| C2 | `GET /api/hrm/contracts-insurance/contracts?company_id=main` | **200** (rows or empty `data: []`) |
| C3 | `GET /api/hrm/settings-catalogs` | **200** (not **409** `SCOPE_CONTEXT_MISMATCH`) |
| C4 | Contracts table | Data rows or valid empty state — not stuck loading after failed Supabase |
| C5 | Console | No required `127.0.0.1:54321/rest/v1/contracts` on initial load |
| C6 | iframe query | `companyId=main` when JWT `companyId=main` (D1 handoff) |

**API smoke (optional):**

```bash
# After portal login, copy JWT from sessionStorage xevn.portal.accessToken
curl -s -H "Authorization: Bearer $TOKEN" \
  -H "x-tenant-id: xevn" -H "x-company-id: main" \
  "http://127.0.0.1:5175/api/hrm/contracts-insurance/contracts?company_id=main"

curl -s -H "Authorization: Bearer $TOKEN" \
  -H "x-tenant-id: xevn" -H "x-company-id: main" \
  "http://127.0.0.1:5175/api/hrm/settings-catalogs"
```

## Residual risk

- Legacy Supabase `contracts` table rows are not merged in API mode (Nest path uses `employee_contracts` only).
- File upload on create/edit disabled in API mode until storage bridge exists.
- Dashboard `expiring-contracts` and `EmployeeContracts` still use Supabase — out of this slice.

---

## QA retest — 2026-05-22T17:05Z

**work_item_id:** `HRM-EMBED-CONTRACTS-01`  
**qa_owner:** qa  
**matrix_ref:** `docs/qa/evidence/qc-hrm-embed-regression-20260522.md`  
**environment:** HRM `:28001` (HRM-HEALTH-200), XBOS `:28002` (XBOS-HEALTH-200), portal `:5175`  
**account:** `ceo@xe.vn` / `Xevn@2026`  
**verdict:** **PASS** → `PASS_TO_PM` + `PASS_TO_QC`

### QC matrix (mandatory)

| Route | Checks | Result |
|-------|--------|--------|
| `/command-center/hrm/employees` | U1–U4 regression | **PASS** |
| `/command-center/hrm/contracts` | No 54321; Nest list/settings **200**; valid empty | **PASS** |
| settings-catalogs on contracts load | No **409** with JWT `companyId=main` | **PASS** |

### Contracts matrix C1–C6

| # | Check | Result | Evidence |
|---|--------|--------|----------|
| C1 | HRM API Sync banner ≠ ERROR | **PASS** | iframe: `CONNECTED` |
| C2 | `contracts-insurance/contracts?company_id=main` → **200** | **PASS** | API `HRM-CON-200`, `rows: 0` |
| C3 | `settings-catalogs` → **200** (not 409) | **PASS** | API `HRM-SET-200`; mismatch probe `x-company-id: xevn` → **409** (expected negative) |
| C4 | Table empty state with backing **200** | **PASS** | UI «Không có dữ liệu», 0 rows; not loading spinner stuck |
| C5 | No required `54321/rest/v1/contracts` on load | **PASS** | iframe `performance` resources: `bad: []` |
| C6 | iframe `companyId=main` | **PASS** | `src=/hr/contracts?portal=1&tenantId=xevn&companyId=main` |

### Employees regression U1–U4

| # | Check | Result | Evidence |
|---|--------|--------|----------|
| U1 | Sync banner ≠ ERROR | **PASS** | `CONNECTED` |
| U2 | `employees?page_size=100` → **200** | **PASS** | `HRM-EMP-200`, `total=10` |
| U3 | Employee rows visible | **PASS** | iframe 10 table rows |
| U4 | iframe `companyId=main` | **PASS** | `src=/hr/employees?portal=1&tenantId=xevn&companyId=main` |

### API smoke (automated, portal proxy)

```text
POST /api/xbos/auth/login ceo@xe.vn → 200, expiresInSec=86400, JWT companyId=main
GET /api/hrm/employees?company_id=main&page_size=100 → 200 (HRM-EMP-200)
GET /api/hrm/employees?company_id=main&page_size=200 → 400 (HRM-VAL-001)
GET /api/hrm/contracts-insurance/contracts?company_id=main → 200 (HRM-CON-200, 0 rows)
GET /api/hrm/settings-catalogs (x-company-id main) → 200 (HRM-SET-200)
GET /api/hrm/catalog-sync → 200 (HRM-SYNC-202)
```

### Browser UAT (Cursor MCP, session inject — zero user steps)

**Contracts:** `http://localhost:5175/command-center/hrm/contracts`  
- Nest calls on load: `catalog-sync`, `contracts-insurance/contracts`, `settings-catalogs`, `employees` (dropdown seed) — no `54321`.

**Employees:** `http://localhost:5175/command-center/hrm/employees`  
- Prior D1 FAIL (iframe `companyId=xevn`) **not reproduced**.

### Defect closure (QC NO-GO items)

| ID | Status |
|----|--------|
| HRM-EMBED-D3 | **CLOSED** |
| HRM-EMBED-D4 | **CLOSED** |

### Handoff

- **qa → PM:** `PASS_TO_PM` — full QC embed matrix green for employees + contracts + settings-catalogs probe.
- **qa → QC:** `PASS_TO_QC` — re-gate `QC-HRM-EMBED-REGRESSION-01`; evidence this file + employees baseline `hrm-embed-employees-fix-20260522.md` § QA final retest D1.
- **Residual (non-blocking):** dev-fe noted Supabase on dashboard/expiring-contracts/EmployeeContracts — out of slice; HRM-EMBED-D5 insurance route not exercised this cycle.
