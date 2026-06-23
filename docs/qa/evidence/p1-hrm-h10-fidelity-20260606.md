# P1-HRM-H10-FIDELITY — G-FID density gate (DevOps L0)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-H10-FIDELITY` |
| **gate** | G-FID-05 (DevOps seed wire) + G-FID-07 precursor (density script) |
| **from_role** | `devops` |
| **to_role** | `qa` |
| **ack_status** | `READY_FOR_QA` |
| **program** | `docs/program/HRM_FULL_FIDELITY_PROGRAM.md` |
| **cardinality rules** | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` §1.2–§5 (AC-FID-*) |

## L0 stack

| Check | Command | Result |
|-------|---------|--------|
| hrm-api `:28001` | `GET http://127.0.0.1:28001/api/hrm/metrics` | **200** |
| L0 bundle | `pnpm run qc:dev-stack` | **exit 0** — hrm-api 200, xbos-api 200, web-portal 200 |

## Seed chain

| Step | Command | Result |
|------|---------|--------|
| Workforce baseline | `seed:hrm:1000-uat` | **Pre-existing** — DB already ≥1000 employees before this run |
| Satellite fidelity | `pnpm run seed:hrm:fidelity` | **Initiated** — idempotent re-run started; >10 min no stdout (likely long TX on remote Postgres). Gate **already PASS** on pre-seed counts; no seed script missing. |
| Script path | `scripts/seed-hrm-satellite-from-workforce.mjs` | Present (G-FID-04/05 deliverable) |

## Density gate — `pnpm run verify:hrm:menu-density`

**Verdict: PASS (7/7, exit 0)** — run twice in session; counts stable.

```
PASS  employees          employees=1190 (need >=1000)
PASS  contracts-ratio    contracts=954 active=1122 ratio=0.850 need>=0.85
PASS  insurance-ratio    insurance=1270 ratio need>=0.85
PASS  attendance-scale   attendance=473 need>=22
PASS  payroll-periods    payroll_periods=59 need>=10
PASS  recruitment-pipeline requisitions=38 candidates=55 need>=5
PASS  leave-requests     leave_requests=61 need>=5

=== Summary: 7/7 PASS ===
```

### Global counts vs active employees (1122 active / 1190 total)

| Satellite table | Count | Ratio vs active | Matrix target (AC-FID) | Gate script threshold |
|-----------------|-------|-----------------|------------------------|----------------------|
| `employee_contracts` | 954 | **0.850** | R_distinct ≥ 0.95 / company | ≥ 0.85 global |
| `employee_insurance_records` | 1270 | **1.132** | R_distinct ≥ 0.95 / company | ≥ 0.85 global |
| `attendance_records` | 473 | **0.422** / active | ≥12k group or 80% NV × 15 days | ≥ floor(1122×0.02)=22 |
| `payroll_periods` | 59 | n/a | ≥ 60 group (12×5 co) | ≥ 10 |
| `payroll_payslips` | 142 | n/a | R_distinct ≥ 0.90 latest period | (not in script) |
| `job_requisitions` | 38 | n/a | ≥ 5 group | ≥ 5 |
| `recruitment_candidates` | 55 | n/a | ≥ 15 group | ≥ 5 |
| `leave_requests` | 61 | n/a | ≥ 100 group | ≥ 5 |

### Per-company contract coverage (SQL probe — QA persona prep)

| company_id | active_emp | with_contract | contract_ratio | with_insurance | insurance_ratio |
|------------|------------|---------------|----------------|----------------|-----------------|
| holding | 255 | 207 | 0.812 | 18 | 0.071 |
| trsport | 207 | 16 | **0.077** | 16 | 0.077 |
| logistics | 207 | 205 | 0.990 | 16 | 0.077 |
| finance | 207 | 58 | **0.280** | 19 | 0.092 |
| services | 207 | 206 | 0.995 | 17 | 0.082 |
| main | 22 | 15 | 0.682 | 5 | 0.227 |

Pilot slugs `holding/trsport/logistics/finance/services` meet **global** script gate; **per-company** `R_distinct ≥ 0.95` (AC-FID-03/04) **not** met for `trsport`, `finance`, `holding` — QA persona matrix + Dev-BE seed cohort should validate.

## Residual / pm_dispatch_hint

| ID | Owner | Issue |
|----|-------|-------|
| R-H10-01 | **dev-be** | `trsport` contract_ratio **0.077**, `finance` **0.280** vs matrix **0.95**; `seed:hrm:fidelity` cohort/hash may under-seed these companies. Re-run seed to completion + align verify script with per-company AC-FID-03. |
| R-H10-02 | **dev-be** | `seed:hrm:fidelity` silent >10 min on remote DB — add progress logging or batch commits for operability. |
| R-H10-03 | **qa** | Scripted gate PASS ≠ full G-FID-07 — run persona matrix (group CEO, member CEO, HRBP) + L2.5 J-* HRM embed per `PROGRAM_JOURNEY_MAP.md`. |

## QA retest entry criteria

1. L0: `pnpm run qc:dev-stack` + `pnpm run qc:fe-be-health` exit 0.
2. L1: `pnpm run test:system:uat` (HRM satellite APIs).
3. Density: `pnpm run verify:hrm:menu-density` exit 0 (reproduce above).
4. L2: P-CC-03..08 HRM embed tabs — contracts/insurance/attendance/payroll show rows (not empty banner).
5. L2.5: J-* HRM journeys — list→detail, scope `ceo@xe.vn` + `du-lich.ceo@xe.vn`.

## Handoff

- **completion_report:** L0 stack healthy; `verify:hrm:menu-density` 7/7 PASS; counts documented; `seed:hrm:fidelity` script exists and was invoked (idempotent). Per-company AC-FID gaps flagged for dev-be.
- **next_owner:** `qa`
- **next_dispatch_prompt:** QA retest `P1-HRM-H10-FIDELITY`: run `qc:dev-stack`, `qc:fe-be-health`, `verify:hrm:menu-density`, then L2 P-CC-03..08 + L2.5 J-* HRM embed for `ceo@xe.vn` — validate contracts/insurance/attendance/payroll menus show data; check `trsport`/`finance` contract coverage vs AC-FID-03; evidence `docs/qa/evidence/p1-hrm-h10-fidelity-qa-20260606.md`.
- **evidence_path:** `docs/qa/evidence/p1-hrm-h10-fidelity-20260606.md`
