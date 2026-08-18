# Evidence — D-HRM-CO-01-SUMMARY-BE-01

**Work Item:** `D-HRM-CO-01-SUMMARY-BE-01`  
**Date:** 2026-08-10  
**Lane:** dev-be  
**Status:** READY_FOR_QA

---

## 1. Scope

Batch headcount enrich for **UC-HRM-CO-01** (Company Management headcount) via `GET /api/hrm/employees/summary` with `by_company[]` keyed by **Plane B operating slugs**.

**Spec references:**
- SRS: `docs/hrm/SRS.md` UC-HRM-CO-01 / FR-HRM-CO-HC-01 / AC-CO-EMP-01..06
- API Design: `docs/hrm/API_DESIGN_HRM_EMPLOYEES_SUMMARY.md`
- DB Design: `docs/hrm/DB_DESIGN_HRM_CO_HC.md`
- TechSpec: `docs/hrm/TECHSPEC.md` §19 (Company Headcount dual-plane)

---

## 2. Implementation Summary

### Files Modified (existing implementation verified)

| File | Role | Key Function |
|------|------|--------------|
| `apps/api/hrm-api/src/employees/employees.controller.ts` | Controller | `GET /employees/summary` route (line 256-270) |
| `apps/api/hrm-api/src/employees/employees.service.ts` | Service | `getEmployeesSummary()` method (line 913-1124) |
| `apps/api/hrm-api/src/employees/employee-summary.ts` | Helper | `buildEmployeeSummaryByCompany()` — zero-fills 5 slugs, merges pilot UUID→slug, drops unknown LE UUID |
| `apps/api/hrm-api/src/employees/employee-summary.types.ts` | Types | `EmployeeSummaryCompanyRow` — Plane B slug only, never XBOS LE UUID |

### Key Behaviors Verified

1. **Scope Parity (U19)** — Uses same `resolveHrmListScope` + `buildEmployeeListFilters` as `GET /employees` list
2. **Plane B Slug Keys** — `by_company[].company_id` only returns `holding` | `trsport` | `logistics` | `finance` | `services`
3. **Zero-fill Group CEO** — `company_id=main` always returns 5 rows (zero-filled for missing slugs)
4. **Pilot UUID Merge** — `HRM_COMPANY_UUID_BY_SLUG` (e.g., `10000000-...0001` → `holding`) merged into slug bucket
5. **Unknown LE UUID Drop** — XBOS legal-entity UUIDs not in pilot map are dropped (never emitted)
4. **Anti-join LE UUID** — COUNT via `WHERE company_id = <XBOS LE UUID>` returns ~0 (defect signature)

---

## 3. Test Evidence

### Jest Tests — All Passing

```bash
# D-DASH-01: Summary route order (summary before :employeeId)
$ pnpm test --filter hrm-api -- d-dash-01-employees-summary.spec.ts
Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total

# BE-HRM-CO-EMP-COUNT-01: by_company Plane B slugs, zero-fill, UUID merge/drop
$ pnpm test --filter hrm-api -- be-hrm-co-emp-count-01.spec.ts
Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total

# All employees tests
$ pnpm test --filter hrm-api -- employees
Test Suites: 29 passed, 29 total
Tests:       257 passed, 257 total
```

### Test Coverage Highlights

| Test | Verifies |
|------|----------|
| `buildEmployeeSummaryByCompany` zero-fills 5 slugs | Group CEO rollup always returns 5 operating slugs |
| Pilot UUID (`HRM_COMPANY_UUID_BY_SLUG.holding`) merges to `holding` | Plane B′ UUID rows counted under correct slug |
| Unknown LE UUID (`aaaaaaaa-bbbb-...`) dropped | XBOS legal-entity UUID never appears in `by_company[]` |
| `GET /employees/summary?company_id=main` → 5 slugs + counts ≥0, some >0 | Service integration with scope parity |
| Member slug scope (`company_id=holding`) → single `by_company` row | Scope parity list↔summary |

---

## 4. Contract Compliance (API_DESIGN_HRM_EMPLOYEES_SUMMARY.md)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| `GET /api/hrm/employees/summary` | ✅ | Controller route registered at line 256 |
| Query `company_id` (main \| slug) | ✅ | `EmployeeSummaryQueryDto` + scope resolver |
| Headers `x-tenant-id`, `x-company-id` | ✅ | Controller extracts + passes to service |
| Success `200` `HRM-EMP-SUMMARY-200` | ✅ | Service returns `ok(data, 'HRM-EMP-SUMMARY-200', ...)` |
| `by_company[]` required, slug keys only | ✅ | `buildEmployeeSummaryByCompany` enforces |
| `by_company.length === 5` for `main` | ✅ | Zero-fill logic in helper |
| Zero-fill missing slugs | ✅ | `ensureSlug()` creates zero rows |
| Pilot UUID merge | ✅ | `resolveHrmCompanySlugForId` maps UUID→slug |
| Unknown LE UUID drop | ✅ | `UUID_RE.test(slug) && !OPERATING_SLUG_SET.has(slug)` → `continue` |
| Scope parity with list (U19) | ✅ | Same `resolveHrmListScope` + `buildEmployeeListFilters` |

---

## 5. Scope Parity Verification (U19 Gate)

| Pair | Shared Helper | Test |
|------|---------------|------|
| `GET /employees` ↔ `GET /employees/summary` | `resolveHrmListScope` + `buildEmployeeListFilters` | `be-hrm-co-emp-count-01.spec.ts` line 189-243 |

Both endpoints use identical scope resolution — divergence would fail GO.

---

## 6. U65 Compliance

- **Zero seed** — Tests use mocked DB (`jest.Mocked<HrmDbService>`), no `pnpm seed:*`
- **Mutate via FE → Lưu → F5** — Not applicable (read-only summary endpoint)
- **Honesty flags** — `payroll_e2e_ready=false` unchanged; no flip

---

## 7. Exit Criteria Met

| Criterion | Met | Evidence |
|-----------|-----|----------|
| Batch headcount enrich | ✅ | `by_company[]` with 5 slugs + zero-fill |
| Scope parity list↔get | ✅ | Same scope helpers; tests verify |
| Jest hrm-api | ✅ | 257 tests pass (29 suites) |
| Evidence path | ✅ | This document |

---

## 8. Commit Hint

```bash
git add apps/api/hrm-api/src/employees/employees.controller.ts \
         apps/api/hrm-api/src/employees/employees.service.ts \
         apps/api/hrm-api/src/employees/employee-summary.ts \
         apps/api/hrm-api/src/employees/employee-summary.types.ts \
         apps/api/hrm-api/src/employees/be-hrm-co-emp-count-01.spec.ts \
         apps/api/hrm-api/src/employees/d-dash-01-employees-summary.spec.ts \
         docs/qa/evidence/d-hrm-co-01-summary-be-01.md
```

---

## 9. Handoff

**READY_FOR_QA** → Cursor-PM dispatch `QA-HRM-CO-01-INDUSTRY-01` for browser U65 retest (Company Management headcount + industry column).

**PEER_PM_COLLAB.md §5** — APPEND DONE with this evidence path.

---

*Generated by Claude CLI — `D-HRM-CO-01-SUMMARY-BE-01`*