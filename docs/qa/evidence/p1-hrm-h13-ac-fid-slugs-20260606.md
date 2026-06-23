# P1-HRM-H13-AC-FID-SLUGS — AC-FID-03 holding/logistics/services contract_ratio

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-H13-AC-FID-SLUGS` |
| **parent** | R-H10-01 pattern (`P1-HRM-R-H10-01-SEED`) |
| **from_role** | dev-be |
| **to_role** | qa |
| **ack_status** | `READY_FOR_QA` |
| **date** | 2026-06-06 |
| **matrix** | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` AC-FID-03 |

## Summary

Extended per-company contract backfill from `trsport,finance` to **all UAT member slugs** (`holding`, `trsport`, `logistics`, `finance`, `services`) via `UAT_COMPANIES` default in `seed-hrm-contracts-density.mjs`. Same approach: realign mismatched `employee_contracts.company_id` + insert until AC-FID-03 same-slug join ratio ≥ 0.95 per slug.

## Code change

| File | Change |
|------|--------|
| `scripts/seed-hrm-contracts-density.mjs` | `PER_COMPANY_TARGETS` default `UAT_COMPANIES.join(',')` (was `trsport,finance`); `work_item_id` metadata → `P1-HRM-H13-AC-FID-SLUGS` |

## Commands

```bash
pnpm run seed:hrm:contracts-density
pnpm run verify:hrm:menu-density
```

## AC-FID-03 per company (same-slug join) — after seed

| company_id | active_emp | with_contract | contract_ratio | target | inserted | realigned |
|------------|------------|---------------|----------------|--------|----------|-----------|
| **holding** | 213 | 203 | **0.953** | ≥ 0.95 | 17 | 0 |
| **trsport** | 207 | 207 | **1.000** | ≥ 0.95 | 0 | 0 |
| **logistics** | 207 | 197 | **0.952** | ≥ 0.95 | 22 | 18 |
| **finance** | 207 | 207 | **1.000** | ≥ 0.95 | 0 | 0 |
| **services** | 207 | 197 | **0.952** | ≥ 0.95 | 16 | 18 |

Prior baseline (R-H10-01 residual): holding **0.873**, logistics **0.836**, services **0.870** — all below 0.95.

Seed session totals: **55** new contract rows inserted; **36** `company_id` realignments (`logistics` + `services`).

## Global density gate

```text
verify-hrm-menu-data-density — xevn_hrm

PASS  employees          employees=1190 (need >=1000)
PASS  contracts-ratio    contracts=1275 active=1122 ratio=1.136 need>=0.85
PASS  insurance-ratio    insurance=2092 ratio need>=0.85
PASS  attendance-scale   attendance=2852 need>=22
PASS  payroll-periods    payroll_periods=59 need>=10
PASS  recruitment-pipeline requisitions=38 candidates=55 need>=5
PASS  leave-requests     leave_requests=25 need>=5

=== Summary: 7/7 PASS ===
exit 0
```

## Residual

| ID | Owner | Issue |
|----|-------|-------|
| AC-FID-04 insurance | dev-be | Per-company insurance ratio still below 0.95 (CARD-INS-01 — separate wave) |
| R-H10-02 | dev-be | `seed:hrm:fidelity` long TX / progress logging (unchanged) |

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | AC-FID-03 closed for `holding`, `logistics`, `services` (plus idempotent re-verify `trsport`/`finance`): all five UAT slugs ≥ 0.95 same-slug contract_ratio; `verify:hrm:menu-density` **7/7 PASS** exit 0. |
| **next_owner** | qa |
| **next_dispatch_prompt** | QA retest `P1-HRM-H13-AC-FID-SLUGS`: run `pnpm run qc:dev-stack`, `pnpm run verify:hrm:menu-density` (expect 7/7), SQL AC-FID-03 probe for all five slugs (`holding,trsport,logistics,finance,services` — expect ratio ≥ 0.95 each), L2 contracts embed P-CC-04 for `ceo@xe.vn` / `main` — evidence `docs/qa/evidence/p1-hrm-h13-ac-fid-slugs-qa-20260606.md`. |
| **evidence_path** | `docs/qa/evidence/p1-hrm-h13-ac-fid-slugs-20260606.md` |
| **pm_dispatch_hint** | Close AC-FID-03 slug wave on QA PASS; next fidelity gap is AC-FID-04 insurance per-company |
