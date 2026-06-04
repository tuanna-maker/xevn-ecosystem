# HRM embed — employee detail (`useEmployee` API mode)

**work_item_id:** `HRM-EMBED-D7`  
**qa_owner:** qa  
**date:** 2026-05-23T00:10Z  
**environment:** local — HRM `28001`, XBOS `28002`, portal `5175`  
**account:** `ceo@xe.vn` / `Xevn@2026`  
**verdict:** **PASS** → `PASS_TO_PM`

## Scope

Dev-FE handoff: `useEmployee` / `loadEmployee` uses Nest HRM API in portal embed (`shouldSkipSupabaseDataFetches`), not Supabase `54321` for employee row load.

## L0 — `pnpm run qc:dev-stack`

| Check | Result |
|-------|--------|
| xbos-api `http://127.0.0.1:28002/api/xbos` | **PASS** HTTP 200 |
| web-portal `http://127.0.0.1:5175` | **PASS** HTTP 200 |
| HRM API `http://127.0.0.1:28001/api/hrm` | **PASS** HTTP 200 |

## L1 — Unit tests (`apps/web/hrm`)

```text
pnpm test (vitest run) → PASS
  Test Files  5 passed (5)
  Tests       15 passed (15)
  useEmployee.test.ts — 4 tests (API mode, not-found, Supabase legacy path)
```

## L2 — API smoke (portal proxy)

```text
POST /api/xbos/auth/login ceo@xe.vn → 201, expiresInSec=86400, JWT companyId=main
GET :5175/api/hrm/employees?company_id=main&page_size=100 → 200 (10 rows)
GET scan page 1 → found id 8d846eb9-fcf7-4fe3-8987-24c503d80ce3 (DL-010, Đặng Thị Mai)
GET :5175/api/hrm/employees?company_id=xevn&page_size=100 → 409 SCOPE_CONTEXT_MISMATCH (control)
```

`getEmployeeById` has no dedicated GET-by-id on Nest; client scans `listEmployees` with `page_size=100` — confirmed 200 + row match.

## L3 — Browser UAT (embed-equivalent path)

**Session:** `sessionStorage.xevn.portal.accessToken` after XBOS login (same as Command Center).

### Employee detail (primary)

**URL:** `http://127.0.0.1:5175/hr/employees/8d846eb9-fcf7-4fe3-8987-24c503d80ce3?portal=1&tenantId=xevn&companyId=main`

| # | Check | Result | Evidence |
|---|--------|--------|----------|
| D1 | HRM API Sync — not ERROR | **PASS** | Banner `CONNECTED` |
| D2 | Profile loads (name, code) | **PASS** | «Đặng Thị Mai», badge `DL-010` |
| D3 | Nest employees API used | **PASS** | Network: `GET /api/hrm/employees?company_id=main&include_archived=true&page=1&page_size=100` (and list variant) |
| D4 | No Supabase `rest/v1/employees` on load | **PASS** | `supabaseEmployees: []` in resource log |
| D5 | No `01/01/1970` on hire date | **PASS** | «Ngày vào làm» **01/06/2024** |
| D6 | No 409 scope on employee fetch | **PASS** | `company_id=main` aligned with JWT |

### Command Center embed (list + iframe scope)

**URL:** `http://127.0.0.1:5175/command-center/hrm/employees`

| # | Check | Result |
|---|--------|--------|
| E1 | iframe `companyId=main` (not `xevn`) | **PASS** — `src=/hr/employees?portal=1&tenantId=xevn&companyId=main` |

Detail navigation from iframe row click not automated (iframe isolation); detail path validated via same `/hr/...?portal=1&companyId=main` proxy as iframe child navigation.

## Residual (non-blocking for D7)

| Item | Sev | Note |
|------|-----|------|
| `employee_work_history` | P3 | Toast «Không thể tải lịch sử công tác» — still `127.0.0.1:54321/rest/v1/employee_work_history`; **out of** `useEmployee` slice |
| catalog-sync count 0 | info | Banner text «0 danh mục đã sync» — not ERROR |

## Handoff

- **qa → PM:** `PASS_TO_PM` — employee detail in portal/API mode loads via HRM Nest list scan; no Supabase employees REST on primary path.
- **qc:** Optional L2 matrix row if PM adds `P-CC-03b` employee detail to `PILOT_BUSINESS_FLOW_MATRIX.md`.
