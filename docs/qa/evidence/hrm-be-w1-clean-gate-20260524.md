# W1-HRM-QC-CLEAN-GATE — HRM Backend scope clean gate (Dev-BE handoff)

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-HRM-QC-CLEAN-GATE` |
| **date** | 2026-05-24 |
| **owner** | dev-be |
| **ack_status** | **READY_FOR_QA** |
| **ADR reference** | [`docs/architecture/ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md`](../../architecture/ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md) |
| **Prior audit** | [`docs/qa/evidence/hrm-be-quality-audit-20260524.md`](./hrm-be-quality-audit-20260524.md) |
| **Commit** | None (evidence-only handoff) |

---

## Scope owned (BE)

| Journey / item | Module | Change summary |
|----------------|--------|----------------|
| **J-HRM-05** | `recruitment/dto/list-candidates.query.dto.ts` | `company_id` accepts slug (`@IsString` `@MaxLength(64)`); portal `?company_id=main` no longer 400. Service `listCandidates` uses `resolveHrmListScope` + rollup SQL. |
| **J-HRM-07** | `employees/employees.service.ts`, `payroll/payroll.service.ts` | **getEmployeeById:** same `resolveHrmListScope` + `pushCompanyIdFilter` as list (ADR list↔get parity). **listPayslips:** group CEO `main` uses `pushWorkforceEmployeeScopeFilter` on `p.employee_id` (workforce partition). |
| **Decisions** | `decisions/*` → `GET/POST/PATCH/DELETE /api/hrm/decisions` | New module; `listDecisions` / mutations wire `resolveHrmListScope` + `pushCompanyIdFilter`; controller enforces `resolveScopeContext` on ingress. |
| **Attendance update-requests** | `attendance/attendance.service.ts`, `attendance/dto/list-attendance-update-requests.query.dto.ts` | `listUpdateRequests` uses `resolveHrmListScope`; group CEO path uses `pushWorkforceEmployeeScopeFilter` on `aur.employee_id`; DTO slug-friendly `company_id`. |
| **Payroll reconciliation rollup** | `payroll/payroll.service.ts` | `getPayrollReconciliationSummary` uses `resolveHrmListScope` + `pushCompanyIdFilter` (closes audit P0-02). |

---

## Test execution evidence

Command: `Set-Location apps/api/hrm-api; pnpm test`

```text
> hrm-api@0.0.1 test
> jest

Test Suites: 30 passed, 30 total
Tests:       139 passed, 139 total
Snapshots:   0 total
Time:        9.022 s
Exit code: 0
```

**Pass count:** **139/139** (30 suites).

### Scope-related specs (representative)

| File | Coverage |
|------|----------|
| `recruitment.service.spec.ts` | Group CEO `listCandidates` with `company_id=main` |
| `employees.service.spec.ts` | Group CEO `getEmployeeById` finds holding-row employee |
| `payroll.service.spec.ts` | Payslip workforce scope + reconciliation rollup for `main` |
| `decisions.service.spec.ts` | Group CEO `listDecisions` → `company_id = ANY(...)` |
| `performance.service.spec.ts` | Rollup list cycles/evaluations (prior P0 wave) |
| `common/hrm-list-scope.spec.ts` | ADR regression: group CEO rollup, catalog `main→holding` |

E2E not run in this handoff: `test/tenant-isolation.e2e-spec.ts`, `test/app.e2e-spec.ts`.

---

## ADR alignment notes (`resolveHrmListScope`)

Per **ADR-GROUP-CEO-MAIN-HOLDING-SCOPE** §3–§4:

1. **JWT invariant:** Group CEO keeps `companyId=main`; no global alias bypass of `resolveScopeContext`.
2. **Operational lists:** `resolveHrmListScope(authorization, query.company_id)` expands master-tenant group CEO `main` to **`GROUP_MEMBER_SLUGS`** via `pushCompanyIdFilter` / `pushEmployeeListScopeFilters`.
3. **List ↔ get-by-id parity (J-HRM-07):** `employees.service.ts` — `listEmployees` and `getEmployeeById` share the same scope resolver and company predicates (reference implementation per ADR §6).
4. **UUID-backed workforce tables:** `attendance_update_requests`, payslips — when `scope.masterTenantPartition || scope.memberTenantId`, use `pushWorkforceEmployeeScopeFilter` instead of literal `company_id = main` (avoids empty panels and `::uuid` cast failures).
5. **Settings/catalog exception:** Not in this wave; unchanged `resolveHrmSettingsCatalogCompanyId` for overview reads.

Helper source: `apps/api/hrm-api/src/common/hrm-list-scope.ts` · regression: `hrm-list-scope.spec.ts`.

---

## Audit P0 closure (this wave)

| Audit ID | Status |
|----------|--------|
| P0-02 Payroll reconciliation ignores rollup | **Closed** — `getPayrollReconciliationSummary` |
| P0-03 Attendance update-requests scope + UUID DTO | **Closed** — `listUpdateRequests` + slug DTO |
| P0-04 `ListCandidatesQueryDto` UUID vs slug | **Closed** — J-HRM-05 |
| P0-01 Performance lists ignore rollup | **Closed** (prior `HRM-BE-SCOPE-PARITY-P0` wave) |

---

## Residual P0/P1 (still open from quality audit)

No **P0** items remain from `hrm-be-quality-audit-20260524.md` for surfaces in this wave.

**P1 — deferred (not in W1-HRM-QC-CLEAN-GATE scope):**

| ID | Finding | Notes |
|----|---------|-------|
| **P1-01** | Mutate-by-id without row-level scope | Partial fix in recruitment/contracts-insurance; still open: `employees` update/archive, `payroll` process/close, `attendance` approve/reject, `operations` mutations, `employee-metadata` approve/reject |
| **P1-02** | Operations `listTasks` / `listServiceRequests` exact UUID | `getSummary` rolls up; list DTOs still `@IsUUID()` |
| **P1-03** | Fleet list no rollup | `fleet.service.ts` |
| **P1-04** | Notifications reads / slug scope helper | `notifications/*` |
| **P1-05** | Write DTOs `@IsUUID()` on `company_id` | POST/PATCH bodies in recruitment, operations, attendance, employee-metadata, hrm-admin, notifications |
| **P1-06** | Test coverage gaps | No jest: `fleet.controller`, `notifications.controller`, `mobile-auth.controller`, `settings-catalogs.controller`, `attendance` update-requests list spec, `employee-metadata.service`, `hrm-inbox.service` |

---

## Handoff packet

| Field | Value |
|-------|--------|
| **from_role** | dev-be |
| **to_role** | qa |
| **entry_criteria** | W1 clean-gate BE scope fixes merged in working tree; unit suite green |
| **exit_criteria** | QA L1 + L2.5 J-HRM-05/07 on `ceo@xe.vn`; decisions + attendance update-requests + payroll reconciliation live smoke |
| **evidence_path** | `docs/qa/evidence/hrm-be-w1-clean-gate-20260524.md` |
| **ack_status** | **READY_FOR_QA** |

### QA focus (persona `ceo@xe.vn` / `Xevn@2026`)

- `GET /api/hrm/recruitment/candidates?company_id=main` — 200, non-empty when seeded
- `GET /api/hrm/employees/:id?company_id=main` — 200 for member-slug employee (J-HRM-07)
- `GET /api/hrm/payroll/payslips?company_id=main` — workforce rows visible
- `GET /api/hrm/payroll/reports/reconciliation?company_id=main` — rollup counts
- `GET /api/hrm/attendance/update-requests?company_id=main` — 200, slug accepted
- `GET /api/hrm/decisions?company_id=main` — 200, rollup list
