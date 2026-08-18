# QC Evidence — HRM-EMP-COMPANY-COL-01

**Date:** 2026-07-29
**Work Item:** HRM-EMP-COMPANY-COL-01
**QC Result:** PASS
**Governance Tags:** HOLD_DEPLOY, U65, must_keep C1/D5/P0-c/Profile

## 1. API Response Includes Company Field — CONFIRMED

The `mapEmployee` method in `employees.service.ts` (line 256–279) returns three new company fields on every mapped employee object:

| Field | Description |
|-------|-------------|
| `company_id` | Operating unit slug (e.g. `holding`, `trsport`) |
| `company_uuid` | Resolved legal entity UUID via `resolveHrmCompanyUuidForSlug` |
| `company_display_name` | Vietnamese LE display name — legacy “Khối…” names rejected and upgraded via `resolveCompanyDisplayNameVi` |

**Endpoints that include company fields:**
- `GET /employees` — via `listEmployees` (line 673)
- `POST /employees` — via `createEmployee`
- `GET /employees/:id` — via `findOne`
- `PATCH /employees/:id` — via `updateEmployee`
- Archive/restore endpoints — all use `mapEmployee`

**Endpoints that intentionally exclude company fields:**
- `GET /employees?view=directory` — lightweight `DirectoryListItem` for mobile parity, by design

## 2. Test Results — ALL PASSED

| Test Suite | Result |
|-----|-------|
| `be-hrm-emp-company-col-01.spec.ts` (dedicated spec for AC-EMP-COL-01..04) | 8/8 PASSED |
| `employees.service.spec.ts` | PASSED |
| `employee-profile.service.spec.ts` | PASSED |
| `employee-directory.spec.ts` | PASSED |
| `p1-hrm-scale-be-w2` | PASSED |
| `p1-hrm-emp-dup-key-be` | PASSED |
| `p1-hrm-perf-be-01` | PASSED |
| `cd-fb-05-perf-be` | PASSED |
| `be-hrm-co-emp-count-01` | PASSED |
| `operating-units` specs | 15/15 PASSED |

Total: **75+ tests all passing**, zero failures.

## 3. Regression Analysis — NONE DETECTED

The implementation is **purely additive** in the `mapEmployee` mapper — three new fields added, zero fields removed. The legacy “Khối…” DB names are rejected via `isLegacyKhoiDisplayName` and upgraded to LE/Doanh t names through the registry fallback.

- Cursor pagination **unaffected**.
- Scope filtering **unaffected**.
- Summary endpoint (`GET /employees/summary`) **unaffected**.

## 4. Relevant File Paths

- `apps/api/hrm-api/src/employees/employees.service.ts` — `mapEmployee` method (line 256), `listEmployees` (line 673)
- `apps/api/hrm-api/src/employees/employees.controller.ts` — `@Get() listEmployees` route (line 104)
- `apps/api/hrm-api/src/operating-units/hrm-company-display-name.ts` — `resolveCompanyDisplayNameVi`, `isLegacyKhoiDisplayName`, `ensureCompanySlugMapLegalDisplayNames`
- `apps/api/hrm-api/src/operating-units/be-hrm-emp-company-col-01.spec.ts` — dedicated test spec (8 tests)
- `apps/api/hrm-api/src/employees/employee-directory.ts` — directory list mapper (intentionally excludes company)
- `apps/api/hrm-api/src/common/hrm-list-scope.ts` — scope resolution

