# P1-HRM-H18-AC-FID-08-PAYSLIP — latest closed period payslip density

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-H18-AC-FID-08-PAYSLIP` |
| **from_role** | dev-be |
| **to_role** | qa |
| **ack_status** | `READY_FOR_QA` |
| **date** | 2026-06-06 |
| **matrix** | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` AC-FID-08 · CARD-PAY-01 |

## Summary

Added idempotent `seed-hrm-payslip-density.mjs` (+ `pnpm run seed:hrm:payslip-density`) to backfill `payroll_payslips` for the **latest closed period** per UAT slug until **AC-FID-08** passes: `R_distinct(c) ≥ 0.90` vs active employees. Enhanced `verify-hrm-menu-data-density.mjs` payroll check to include closed-period payslip ratios (still **7/7** gate).

## Code change

| File | Change |
|------|--------|
| `scripts/seed-hrm-payslip-density.mjs` | New — per-company latest closed period payslip backfill, batch `unnest` upserts, metadata tracking |
| `scripts/verify-hrm-menu-data-density.mjs` | `payroll-periods` → `payroll-fidelity` (periods + AC-FID-08 closed-ratio per slug) |
| `package.json` | `seed:hrm:payslip-density` npm script |

## Commands

```bash
pnpm run seed:hrm:payroll-density   # prerequisite — closed periods (AC-FID-07)
pnpm run seed:hrm:payslip-density
pnpm run verify:hrm:menu-density
```

## AC-FID-08 per company (latest closed period)

Formula: `payslip_ratio` = `COUNT(DISTINCT payroll_payslips.employee_id)` / `N_EMP(c)` for latest `payroll_periods.status='closed'` per slug; target **≥ 0.90**.

| company_id | active_emp | with_payslip | ratio | period (closed) | inserted |
|------------|------------|--------------|-------|-----------------|----------|
| **holding** | 213 | **192** | **0.901** | Kỳ lương 12/2025 — holding | 192 |
| **trsport** | 207 | **187** | **0.903** | Kỳ lương 12/2025 — trsport | 187 |
| **logistics** | 207 | **187** | **0.903** | Kỳ lương 12/2025 — logistics | 187 |
| **finance** | 207 | **187** | **0.903** | Kỳ lương 12/2025 — finance | 187 |
| **services** | 207 | **187** | **0.903** | Kỳ lương 12/2025 — services | 187 |

**Group total:** **1905** payslips (prior baseline **965** sparse fidelity cohort). **Session insert:** **940** new rows.

**Idempotent re-run:** second `seed:hrm:payslip-density` → `inserted: 0`, ratios unchanged, exit 0.

Prior baseline: fidelity cohort ~80% employees with payslip on processed period only — AC-FID-08 latest **closed** period ratio ~0.07–0.45 per slug.

## Global density gate

```text
verify-hrm-menu-data-density — xevn_hrm

PASS  employees          employees=1190 (need >=1000)
PASS  contracts-ratio    contracts=1275 active=1122 ratio=1.136 need>=0.85
PASS  insurance-ratio    insurance=2152 ratio need>=0.85
PASS  attendance-scale   attendance=13291 need>=22
PASS  payroll-fidelity   payroll_periods=119 need>=10; payslip_closed_ratio need>=0.9 (holding=0.901@2025-12-31, trsport=0.903@2025-12-31, logistics=0.903@2025-12-31, finance=0.903@2025-12-31, services=0.903@2025-12-31)
PASS  recruitment-pipeline requisitions=38 candidates=55 need>=5
PASS  leave-requests     leave_requests=100 need>=5

=== Summary: 7/7 PASS ===
exit 0
```

## Residual

| ID | Owner | Issue |
|----|-------|-------|
| R-H10-02 | dev-be | `seed:hrm:fidelity` long TX / progress logging (unchanged) |
| AC-FID-09+ | backlog | Recruitment / settings catalog per-company fidelity — separate waves |

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | AC-FID-08 closed: all five UAT slugs latest closed period (12/2025) payslip_ratio ≥ **0.901**; `verify:hrm:menu-density` **7/7 PASS** exit 0; idempotent re-run inserted 0. |
| **next_owner** | qa |
| **next_dispatch_prompt** | QA retest `P1-HRM-H18-AC-FID-08-PAYSLIP`: run `pnpm run qc:dev-stack`, `pnpm run verify:hrm:menu-density` (expect 7/7, payroll-fidelity payslip_closed_ratio ≥0.9 all slugs), SQL probe latest closed period payslip ratio per slug, L2 P-CC-08 payroll tab + J-HRM-07 payslip list→detail for `ceo@xe.vn` / `main` — non-empty payslip rows; evidence `docs/qa/evidence/p1-hrm-h18-ac-fid-08-payslip-qa-20260606.md`. |
| **evidence_path** | `docs/qa/evidence/p1-hrm-h18-ac-fid-08-payslip-20260606.md` |
| **pm_dispatch_hint** | Close AC-FID-08 on QA PASS; next fidelity gap AC-FID-09 recruitment pipeline group density |
