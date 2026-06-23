# P1-HRM-H16-AC-FID-06-LEAVE — group leave density

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-H16-AC-FID-06-LEAVE` |
| **from_role** | dev-be |
| **to_role** | qa |
| **ack_status** | `READY_FOR_QA` |
| **date** | 2026-06-06 |
| **matrix** | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` AC-FID-06 · `docs/hrm/HRM_SEED_CARDINALITY_RULES.md` CARD-LVE-01 |

## Summary

Added idempotent `seed-hrm-leave-density.mjs` (+ `pnpm run seed:hrm:leave-density`) to backfill `leave_requests` linked to active employees across five UAT slugs until **AC-FID-06** passes: group **≥ 100** and per-company **max(5, ⌈N × 0.05⌉)**. Mirrors attendance/insurance density pattern with batch `unnest` upserts and metadata tracking.

## Code change

| File | Change |
|------|--------|
| `scripts/seed-hrm-leave-density.mjs` | New — per-company CARD-LVE-01 + group top-up to 100, stable UUID per employee+slot |
| `package.json` | `seed:hrm:leave-density` npm script |

## Commands

```bash
pnpm run seed:hrm:leave-density
pnpm run verify:hrm:menu-density
```

## AC-FID-06 per company (CARD-LVE-01)

Formula: `leave_count` = rows in `leave_requests` joined to `employees` where `employees.company_id = slug`; target = **max(5, ⌈active_emp × 0.05⌉)**.

| company_id | active_emp | leave_count | target | inserted |
|------------|------------|-------------|--------|----------|
| **holding** | 213 | **11** | 11 | 11 |
| **trsport** | 207 | **11** | 11 | 11 |
| **logistics** | 207 | **11** | 11 | 11 |
| **finance** | 207 | **11** | 11 | 11 |
| **services** | 207 | **11** | 11 | 11 |

**Group total:** **100** leave requests (≥ **100** AC-FID-06 threshold). **Session insert:** **75** new rows (55 per-company + 20 group top-up; prior baseline **25**).

**Idempotent re-run:** second `seed:hrm:leave-density` → `inserted: 0`, group **100** unchanged, exit 0.

Prior baseline: sparse fidelity cohort (~25 group) — menu-density leave check passed at ≥5 but AC-FID-06 group threshold FAIL.

## Global density gate

```text
verify-hrm-menu-data-density — xevn_hrm

PASS  employees          employees=1190 (need >=1000)
PASS  contracts-ratio    contracts=1275 active=1122 ratio=1.136 need>=0.85
PASS  insurance-ratio    insurance=2152 ratio need>=0.85
PASS  attendance-scale   attendance=13291 need>=22
PASS  payroll-periods    payroll_periods=59 need>=10
PASS  recruitment-pipeline requisitions=38 candidates=55 need>=5
PASS  leave-requests     leave_requests=100 need>=5

=== Summary: 7/7 PASS ===
exit 0
```

## Residual

| ID | Owner | Issue |
|----|-------|-------|
| R-H10-02 | dev-be | `seed:hrm:fidelity` long TX / progress logging (unchanged) |
| AC-FID-07+ | backlog | Payroll periods / payslip per-company fidelity — separate waves |

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | AC-FID-06 closed: group `leave_requests` **100** ≥ **100**; all five UAT slugs meet CARD-LVE-01 per-company minimum; `verify:hrm:menu-density` **7/7 PASS** exit 0; idempotent re-run inserted 0. |
| **next_owner** | qa |
| **next_dispatch_prompt** | QA retest `P1-HRM-H16-AC-FID-06-LEAVE`: run `pnpm run qc:dev-stack`, `pnpm run verify:hrm:menu-density` (expect 7/7, leave_requests≥100), SQL AC-FID-06 probe `SELECT COUNT(*) FROM leave_requests` (expect ≥100), L2 attendance embed P-CC-07 leave tab for `ceo@xe.vn` / `main` — list non-empty, mix pending/approved; evidence `docs/qa/evidence/p1-hrm-h16-ac-fid-06-leave-qa-20260606.md`. |
| **evidence_path** | `docs/qa/evidence/p1-hrm-h16-ac-fid-06-leave-20260606.md` |
| **pm_dispatch_hint** | Close AC-FID-06 on QA PASS; next fidelity gap AC-FID-07 payroll periods group density |
