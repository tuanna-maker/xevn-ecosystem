# HRM-FIDELITY-BE — Dev-BE evidence

**work_item_id:** `HRM-FIDELITY-BE`  
**Date:** 2026-05-23  
**ack_status:** `READY_FOR_QA`

## Deliverables

| Item | Path |
|------|------|
| Cardinality rules (BA) | `docs/hrm/HRM_SEED_CARDINALITY_RULES.md` |
| Workforce satellite seed | `scripts/seed-hrm-satellite-from-workforce.mjs` |
| Package script | `pnpm run seed:hrm:fidelity` |
| Idempotency | `public.hrm_seed_metadata` + `public.hrm_seed_runs` (`seed_tag`: `hrm-fidelity-v1`) |

## Seed run (local Postgres `xevn_hrm`)

```bash
pnpm run seed:hrm:fidelity
```

**Result:** `success: true`

| Table | Count after seed |
|-------|------------------|
| employees (active sampled) | 1104 |
| employee_contracts | 1037 (~94% of active) |
| employee_insurance_records | 1037 |
| attendance_records | 2819 |
| payroll_periods | 53 |
| payroll_payslips | 985 |
| job_requisitions | 21 |
| recruitment_candidates | 33 |
| leave_requests | 18 |

**This run inserted/updated:** 936 contracts, 936 insurance, 2838 attendance rows, 10 periods + 935 payslips, 10 requisitions + 20 candidates, 6 leave rows (metadata-tagged).

## Density gate

```bash
pnpm run verify:hrm:menu-density
```

**Verdict:** **7/7 PASS** (exit 0)

- contracts ratio 0.939 (≥ 0.85)
- insurance ratio 0.939 (≥ 0.85)
- attendance 2819 (≥ 22)
- payroll_periods 53 (≥ 10)
- recruitment pipeline OK
- leave_requests 18 (≥ 5)

## List API scope audit (`resolveScopeContext` + SQL filter)

| Module | Endpoint | Controller `resolveScopeContext` | Service `company_id` filter | Gap |
|--------|----------|-------------------------------|----------------------------|-----|
| Contracts | `GET /contracts-insurance/contracts` | Yes (`query.company_id`) | `WHERE company_id = $1` | None |
| Contracts | `GET /contracts-insurance/contracts/expiring` | Yes | `WHERE company_id = $1` | None |
| Insurance | `GET /contracts-insurance/insurance/expiring` | Yes | `WHERE company_id = $1` | No dedicated list-all insurance endpoint |
| Attendance | `GET /attendance/records` | Yes | `WHERE company_id = $1` (+ optional employee/status/date) | None |
| Payroll | `GET /payroll/periods` | Yes | `WHERE company_id = $1` | None |
| Payroll | `GET /payroll/payslips` | Yes | `p.company_id = $1` | None |
| Recruitment | `GET /recruitment/job-requisitions` | Yes | `WHERE company_id = $1` | None |
| Recruitment | `GET /recruitment/candidates` | Yes | `company_id = $1` | SQL cast `::uuid` — FE must pass scope UUID when column migrated to TEXT |
| Leave | `GET /attendance/leave-requests` | **No** | `WHERE lr.company_id = $1::uuid` | **P1:** add `resolveScopeContext` on list/create; align `company_id` type with TEXT slug vs attendance UUID |

### Notes for QA

- Leave list relies on caller-supplied `company_id` (UUID). Portal should use `attendance_company_uuid` from employee custom_fields / scope helper — same as mobile UAT seed.
- `PATCH/DELETE contracts/:id` only checks header scope, not row `company_id` (pre-existing; out of scope unless QA finds cross-company mutation).

## Handoff

- **QA:** Re-run `pnpm run seed:hrm:fidelity` (idempotent) then `pnpm run verify:hrm:menu-density`; spot-check list APIs per company (`holding`, `trsport`) with internal JWT + `x-company-id`.
- **FE:** Ensure embed passes scoped `company_id` (TEXT slug for contracts/payroll; UUID for attendance/leave where required).
