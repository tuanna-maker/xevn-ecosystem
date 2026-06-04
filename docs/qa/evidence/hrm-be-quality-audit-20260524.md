# HRM Backend Quality Audit — `apps/api/hrm-api`

| Field | Value |
|-------|--------|
| **work_item_id** | `HRM-BE-QUALITY-AUDIT-20260524` |
| **Generated** | 2026-05-24 |
| **Owner** | dev-be |
| **ADR reference** | [`docs/architecture/ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md`](../../architecture/ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md) |
| **Scope** | Scope parity, DTO validation, test gaps, error semantics, `main`/`holding` rollup |
| **Commit** | None (audit-only) |

---

## Executive summary

HRM core operational modules (employees, contracts, payroll lists, recruitment requisitions, attendance records, leave requests, settings-catalogs) largely follow ADR §4 via `resolveHrmListScope` / `resolveHrmSettingsCatalogCompanyId`. **Employees** is the only module with explicit **list ↔ get-by-id scope parity** (fixed in S2; regression tests present).

Gaps cluster in: (1) modules that never wire rollup in the service layer, (2) attendance update-requests and payroll reconciliation, (3) DTOs still requiring `@IsUUID()` for `company_id` where portal sends slug `main`, (4) mutate-by-id endpoints without row-level scope checks (IDOR class), (5) missing jest coverage on fleet/notifications/mobile-auth/settings-catalogs controllers.

**Test run:** `pnpm test` in `apps/api/hrm-api` → **127/127 PASS** (28 suites, ~7.6s).

---

## Test execution evidence

```text
> hrm-api@0.0.1 test
> jest

Test Suites: 28 passed, 28 total
Tests:       127 passed, 127 total
Time:        7.601 s
Exit code: 0
```

Command: `Set-Location apps/api/hrm-api; pnpm test`

E2E (not run in this audit): `test/tenant-isolation.e2e-spec.ts`, `test/app.e2e-spec.ts`

---

## Module inventory (16 controllers)

| Module | Controller | Service scope rollup | Get-by-id | Controller spec | Service spec |
|--------|------------|---------------------|-----------|-----------------|--------------|
| employees | `employees.controller.ts` | ✅ list + get | ✅ parity | ✅ | ✅ (+ rollup test) |
| contracts-insurance | `contracts-insurance.controller.ts` | ✅ lists | — | ✅ | ✅ |
| payroll | `payroll.controller.ts` | ✅ periods/payslips | — | ✅ | ✅ |
| recruitment | `recruitment.controller.ts` | ✅ lists | — | ✅ | ✅ |
| attendance | `attendance.controller.ts` | ✅ records, leave | — | ✅ | ✅ leave + attendance |
| employee-metadata | `employee-metadata.controller.ts` | ✅ list change-reqs | — | ✅ | ❌ |
| operations | `operations.controller.ts` | ⚠️ summary only | — | ✅ | ✅ |
| performance | `performance.controller.ts` | ❌ exact `company_id` | — | ✅ | ❌ |
| fleet | `fleet.controller.ts` | ❌ exact `company_id` | — | ❌ | ❌ |
| settings-catalogs | `settings-catalogs.controller.ts` | ✅ catalog alias | batch GET | ❌ | ✅ |
| catalog-sync | `catalog-sync.controller.ts` | strict scope ctx | — | ✅ | ❌ |
| spreadsheet | `spreadsheet.controller.ts` | strict scope ctx | — | ✅ | ✅ ingest |
| notifications | `notifications.controller.ts` | ❌ none | — | ❌ | ❌ |
| mobile-auth | `mobile-auth.controller.ts` | N/A | — | ❌ | ✅ |
| hrm-admin | `hrm-admin.controller.ts` | N/A | — | ✅ | ❌ |
| app | `app.controller.ts` | N/A | — | ✅ | — |

---

## ADR alignment matrix (`main` / `holding` / five-slug rollup)

Per ADR §4 — group CEO (`tenantId=xevn`, JWT `companyId=main`, `roleCode=group_ceo`):

| Surface | ADR expectation | Implementation status |
|---------|-----------------|----------------------|
| HRM operational lists (`?company_id=main`) | SQL `IN GROUP_MEMBER_SLUGS` + master partition | ✅ employees, contracts, payroll periods/payslips, recruitment requisitions, attendance records, leave, employee-metadata lists |
| HRM settings-catalogs overview | `main` → persisted key `holding` | ✅ `resolveHrmSettingsCatalogCompanyId` in `settings-catalogs.controller.ts` |
| HRM get employee by id | Same rollup as list | ✅ `employees.service.ts` `getEmployeeById` |
| Performance / fleet lists | Should rollup per ADR “operational lists” row | ❌ `company_id = $1` literal `main` — empty for group CEO |
| Payroll reconciliation report | Should rollup like list | ❌ `getPayrollReconciliationSummary(scope.companyId)` uses `main` only |
| Attendance update-requests list | Workforce / rollup scope | ❌ `aur.company_id = $1::uuid`, no `resolveHrmListScope` |
| Operations tasks / service-requests | ADR lists row (operational) | ❌ UUID `company_id` exact match; summary rollup inconsistent |
| Notifications inbox | Operational / employee-scoped | ❌ no scope helper; `@IsUUID` on `company_id` |
| Mutations by resource id | Not ADR alias; needs row-level scope | ❌ widespread (see P1) |

**Positive:** `hrm-list-scope.spec.ts` covers group CEO rollup, member CEO partition, catalog `main→holding`, and single-slug filter — matches ADR §6 regression list.

---

## TODO / FIXME scan

Ripgrep over `apps/api/hrm-api/src`: **0** production `TODO` / `FIXME` markers (clean).

---

## Error semantics

| Layer | Pattern | Notes |
|-------|---------|-------|
| Domain | `ApiException(code, message, status, details?)` | Stable codes: `HRM-EMP-404`, `HRM-CON-001`, `SCOPE_CONTEXT_MISMATCH`, etc. |
| Validation | Global `ValidationPipe` whitelist + forbidNonWhitelisted | Fail → `HRM-VAL-001` via filter fallback |
| Scope mismatch | `resolveScopeContext` → **409** `SCOPE_CONTEXT_MISMATCH` | Correct per ADR; no silent alias except named helpers |
| Filter | `GlobalHttpExceptionFilter` + `x-api-code` header | Maps generic Nest statuses to HRM codes |
| Gap | Some catch blocks wrap PG errors as generic `HRM-ATT-001` / `HRM-EMP-001` | Loses constraint-specific codes (P2) |

---

## Prioritized findings

### P0 — Pilot / group CEO correctness or validation blockers

| ID | Finding | File(s) | Impact |
|----|---------|---------|--------|
| P0-01 | **Performance lists ignore group rollup** — `listCycles` / `listEvaluations` filter `company_id = query.company_id` (`main`); seeded rows use member slugs | `performance/performance.service.ts` L94–111, L135–156 | Group CEO sees **0** cycles/evaluations on embed |
| P0-02 | **Payroll reconciliation ignores rollup** — `GET payroll/reports/reconciliation` passes JWT `main` to `WHERE company_id = $1` | `payroll/payroll.service.ts` L245–260, `payroll.controller.ts` L96–108 | CC/HRM dashboard summary under-counts |
| P0-03 | **Attendance update-requests: no scope + UUID cast** — list filters `aur.company_id = $1::uuid`; DTO `@IsUUID()` rejects slug `main` | `attendance/attendance.service.ts` L456–483, `attendance/dto/list-attendance-update-requests.query.dto.ts` | Route fails validation or returns empty; breaks L2 matrix |
| P0-04 | **`ListCandidatesQueryDto` requires UUID `company_id`** while `ListJobRequisitionsQueryDto` accepts slug — inconsistent; portal `main` rejected on candidates list | `recruitment/dto/list-candidates.query.dto.ts` L5–6 vs `list-job-requisitions.query.dto.ts` L5–7 | Candidates tab 400 for group CEO |

### P1 — Security / scope parity / test debt

| ID | Finding | File(s) | Impact |
|----|---------|---------|--------|
| P1-01 | **Mutate-by-id without row scope** — update/delete/archive/process/approve paths query by UUID only (no `resolveHrmListScope` / company predicate) | `employees.service.ts` (update/archive/restore), `contracts-insurance.service.ts` (update/delete), `payroll.service.ts` (process/close), `attendance.service.ts` (updateStatus, approve/reject requests), `recruitment.service.ts` (updateInterviewStatus), `operations.service.ts` (task/service-request mutations), `employee-metadata.repository.ts` (approve/reject) | IDOR: knowing resource id may mutate cross-company rows |
| P1-02 | **Operations list endpoints skip rollup** — `listTasks` / `listServiceRequests` use `company_id = $1::uuid`; DTOs `@IsUUID()` | `operations/operations.service.ts` L153–171, L236–252; `operations/dto/list-*.query.dto.ts` | Inconsistent with `getSummary` which uses rollup; portal slug mismatch |
| P1-03 | **Fleet list uses exact JWT company** — no `resolveHrmListScope`; tourism seed may use member slug | `fleet/fleet.service.ts` L58–77, `fleet.controller.ts` | Group CEO fleet panel empty |
| P1-04 | **Notifications: no `resolveScopeContext` on reads**; all DTOs `@IsUUID()` for `company_id` | `notifications/notifications.controller.ts`, `notifications/dto/*.ts` | Mobile/inbox flows misaligned with slug scope ladder |
| P1-05 | **Widespread `@IsUUID()` on write DTOs** for `company_id` (recruitment create, operations create, attendance create, employee-metadata submit, hrm-admin, notifications) while list DTOs for same domains use `@IsString()` slug | See grep: 15+ DTO files under `attendance/`, `recruitment/`, `operations/`, `notifications/`, `employee-metadata/`, `hrm-admin/` | POST/PATCH from portal with `main` → **400 HRM-VAL-001** |
| P1-06 | **Test coverage gaps** — no specs: `fleet.controller`, `notifications.controller`, `mobile-auth.controller`, `settings-catalogs.controller`, `performance.service`, `fleet.service`, `employee-metadata.service`, `hrm-inbox.service` | respective paths | Rollup/regression not guarded in CI |
| P1-07 | **Recruitment `listCandidates` fragile SQL** — hardcoded `requisition_id = $2::uuid` (works today only because company filter always occupies `$1`) | `recruitment/recruitment.service.ts` L171–173 | Future filter additions will break SQL param indexing |

### P2 — Hardening / maintainability

| ID | Finding | File(s) | Impact |
|----|---------|---------|--------|
| P2-01 | **Only employees module implements get-by-id**; contracts/payroll/recruitment have list→detail UI journeys via list rows only — if get-by-id added later, must copy employees pattern | N/A (design note) | Repeat J-HRM-01 class if new GET routes omit rollup |
| P2-02 | **Mixed `company_id` column types** — some tables UUID (`hrm_tasks`, `attendance_update_requests`, `employee_metadata_*`), others TEXT slugs (`employees`, contracts) | schema in respective services | Requires `pushCompanyIdTextColumnFilter` vs `pushCompanyIdFilter` discipline |
| P2-03 | **Generic error wrapping** on attendance create masks PG constraint codes | `attendance.service.ts` L318–321 | Harder QA triage |
| P2-04 | **Controller tests use UUID company fixtures** (e.g. performance) — masks slug/rollup gaps | `performance.controller.spec.ts` L35–56 | False confidence for ADR persona |
| P2-05 | **E2E tenant isolation** exists but not executed in this audit | `test/tenant-isolation.e2e-spec.ts` | Recommend QA wire into sprint gate |

---

## Scope parity detail (list vs get-by-id)

| Module | List resolver | Get-by-id | Parity |
|--------|---------------|-----------|--------|
| employees | `resolveHrmListScope` + `pushEmployeeListScopeFilters` | Same in `getEmployeeById` | ✅ PASS |
| contracts-insurance | `resolveHrmListScope` + `pushCompanyIdFilter` | No GET-by-id route | N/A |
| payroll | `resolveHrmListScope` on periods/payslips | No GET period-by-id | N/A |
| recruitment | `resolveHrmListScope` on lists | No GET-by-id | N/A |
| attendance records | `pushWorkforceEmployeeScopeFilter` | No GET-by-id | N/A |
| leave requests | `pushWorkforceEmployeeScopeFilter` | No GET-by-id | N/A |
| performance | None (exact match) | — | ❌ FAIL vs ADR |
| fleet | None | — | ❌ FAIL vs ADR |
| attendance update-requests | None (`::uuid`) | — | ❌ FAIL |

**Reference implementation:** `employees.service.ts` L169–242 — list and get share `resolveHrmListScope` + `pushEmployeeListScopeFilters`.

---

## Validation DTO summary

**Slug-friendly (`@IsString`, `@MaxLength(64)`) — ADR-aligned:**  
`list-employees`, `get-employee`, `list-contracts`, `list-expiring`, `list-payroll-periods`, `list-payroll-payslips`, `list-job-requisitions`, `list-attendance-records`, `list-leave-requests`, `list-performance`, `list-employee-metadata-change-requests`.

**UUID-required (`@IsUUID`) on `company_id` — portal `main` incompatible:**  
`list-candidates`, `list-tasks`, `list-service-requests`, `list-attendance-update-requests`, all notification DTOs, most POST bodies in recruitment/operations/attendance/employee-metadata/hrm-admin.

**Recommendation:** Standardize on slug `CompanyId` pattern (as OpenAPI v1.3 `CompanyIdQuery`) across list **and** write DTOs; keep `@IsUUID()` only for true UUID fields (`employee_id`, `period_id`, etc.).

---

## Recommended remediation order

1. **P0-03 + P0-04** — Fix attendance update-requests scope + DTO slug (mirror leave-requests fix from `phase1-view-gaps-be-20260524.md`).
2. **P0-01 + P0-02** — Wire `resolveHrmListScope` into performance + payroll reconciliation; add service specs with group CEO JWT.
3. **P1-01** — Introduce shared `assertResourceInHrmScope(table, id, scope)` helper for mutations (employees first — highest traffic).
4. **P1-05** — Bulk DTO alignment pass (`@IsString` slug for `company_id`).
5. **P1-06** — Add fleet/notifications controller specs + performance service rollup tests.

---

## Handoff

| Field | Value |
|-------|--------|
| **from_role** | dev-be |
| **to_role** | qa / pm |
| **entry_criteria** | Audit complete |
| **exit_criteria** | QA validates P0 rows on `ceo@xe.vn` persona; PM schedules fix wave |
| **evidence_path** | `docs/qa/evidence/hrm-be-quality-audit-20260524.md` |
| **ack_status** | `READY_FOR_QA` (audit); fixes **NOT** implemented in this pass |

---

## P0 scope-parity remediation (2026-05-24 — dev-be)

| Field | Value |
|-------|--------|
| **work_item_id** | `HRM-BE-SCOPE-PARITY-P0` |
| **ADR** | `ADR-GROUP-CEO-MAIN-HOLDING-SCOPE` |
| **Pattern** | List + mutate paths share `resolveHrmListScope` + `pushCompanyIdFilter` (employees reference) |

### Code changes

| Module | Method(s) | Fix |
|--------|-----------|-----|
| `recruitment.service.ts` | `createCandidate`, `scheduleInterview`, `updateInterviewStatus` | Parent row lookup + interview update use rollup `company_id` filter; persist parent `company_id` slug on INSERT |
| `recruitment.service.ts` | `listCandidates` | Dynamic `requisition_id` param index (P1-07) |
| `contracts-insurance.service.ts` | `updateContract`, `deleteContract` | Row-level `pushCompanyIdFilter` on WHERE |
| `performance.service.ts` | `listCycles`, `listEvaluations`, `createEvaluation` | Wire `resolveHrmListScope` (closes audit P0-01) |
| Controllers | recruitment, contracts-insurance, performance | Pass `authorization` + `company_id` into scoped service methods |

### Unit tests added

| File | Cases |
|------|--------|
| `recruitment.service.spec.ts` | Group CEO `main` → holding requisition/candidate for create/schedule |
| `contracts-insurance.service.spec.ts` | Group CEO scoped `updateContract` / `deleteContract` |
| `performance.service.spec.ts` | **new** — rollup list cycles/evaluations + scoped `createEvaluation` |

### Test execution (post-fix)

```text
> hrm-api@0.0.1 test
> jest

Test Suites: 30 passed, 30 total
Tests:       136 passed, 136 total
Time:        ~8s
Exit code: 0
```

Command: `Set-Location apps/api/hrm-api; pnpm test`

### Residual (not in this wave)

- P0-02 payroll reconciliation rollup
- P0-03 attendance update-requests
- P0-04 `ListCandidatesQueryDto` UUID → slug
- P1-01 other mutate-by-id modules (payroll process, attendance approve, operations, employee-metadata)

| **ack_status** | `READY_FOR_QA` (scope parity P0 wave) |

---

## Files referenced

- `apps/api/hrm-api/src/common/hrm-list-scope.ts`
- `apps/api/hrm-api/src/common/hrm-list-scope.spec.ts`
- `apps/api/hrm-api/src/common/scope-context.ts`
- `apps/api/hrm-api/src/employees/employees.service.ts`
- `apps/api/hrm-api/src/performance/performance.service.ts`
- `apps/api/hrm-api/src/payroll/payroll.service.ts`
- `apps/api/hrm-api/src/attendance/attendance.service.ts`
- `apps/api/hrm-api/src/recruitment/recruitment.service.ts`
- `apps/api/hrm-api/src/operations/operations.service.ts`
- `apps/api/hrm-api/src/fleet/fleet.service.ts`
- `docs/architecture/ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md`
