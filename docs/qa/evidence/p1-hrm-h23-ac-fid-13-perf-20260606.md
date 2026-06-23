# P1-HRM-H23-AC-FID-13-PERF — performance cycles + evaluations density

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-H23-AC-FID-13-PERF` |
| **from_role** | dev-be |
| **to_role** | qa |
| **ack_status** | `READY_FOR_QA` |
| **date** | 2026-06-06 |
| **matrix** | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` AC-FID-13 · performance |

## Summary

Added idempotent `seed-hrm-performance-density.mjs` (+ `pnpm run seed:hrm:performance-density`) to backfill `performance_cycles` and `performance_evaluations` until **AC-FID-13** passes: group **≥ 5** cycles and **≥ 300** evaluations linked to real employees + cycle FKs. Enhanced `verify-hrm-menu-data-density.mjs` with `performance-fidelity` check (**10/10** gate).

## Code change

| File | Change |
|------|--------|
| `scripts/seed-hrm-performance-density.mjs` | New — per-company cycle ensure (≥1/slug), group eval top-up to 300, batch `unnest` upsert, `performanceFidelityStats` export |
| `scripts/verify-hrm-menu-data-density.mjs` | Added `performance-fidelity` check (cycles ≥5, evaluations ≥300) |
| `package.json` | `seed:hrm:performance-density` npm script |
| `scripts/lib/pm-backlog-scan.mjs` | AC-FID-13 `seedScript: seed:hrm:performance-density` |

## Commands

```bash
pnpm run seed:hrm:performance-density
pnpm run verify:hrm:menu-density
```

## AC-FID-13 group

Formula: `COUNT(performance_cycles) ≥ 5` AND `COUNT(performance_evaluations) ≥ 300` (evaluations linked via `employee_id` + `cycle_id` FK).

| metric | before | after | inserted | PASS |
|--------|--------|-------|----------|------|
| **performance_cycles** | 14 | **14** | 0 | ✓ (≥5) |
| **performance_evaluations** | 10 | **300** | 290 | ✓ (≥300) |

Per-company cycles (existing baseline sufficient):

| company_id | cycles |
|------------|--------|
| holding | 6 |
| trsport | 2 |
| logistics | 2 |
| finance | 2 |
| services | 2 |

**Idempotent re-run:** `inserted_cycles: 0`, `inserted_evaluations: 0`, exit 0.

## Global density gate

```text
verify-hrm-menu-data-density — xevn_hrm

PASS  employees
PASS  contracts-ratio
PASS  insurance-ratio
PASS  attendance-scale
PASS  payroll-fidelity
PASS  recruitment-pipeline
PASS  leave-requests
PASS  catalog-fidelity
PASS  operations-fidelity
PASS  performance-fidelity  performance_cycles=14 evaluations=300 need cycles>=5 evals>=300

=== Summary: 10/10 PASS ===
exit 0
```

## API contract (unchanged)

- `GET /api/hrm/performance/cycles?company_id=main` — group CEO rollup via `resolveHrmListScope`
- `GET /api/hrm/performance/evaluations?company_id=main` — same rollup
- Evaluations inherit `company_id` from parent cycle (TEXT slug or legacy UUID)

## Residual

| ID | Owner | Issue |
|----|-------|-------|
| R-H10-02 | dev-be | Density seed modules run `main()` on import when loaded by verify script — noisy stdout; defer guard refactor |
| AC-FID-14+ | backlog | Scope RBAC persona matrix — separate waves |

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | AC-FID-13 closed: group **14** cycles (≥5), **300** evaluations (≥300); `verify:hrm:menu-density` **10/10 PASS** exit 0; idempotent re-run inserted 0. |
| **next_owner** | qa |
| **next_dispatch_prompt** | QA retest `P1-HRM-H23-AC-FID-13-PERF`: run `pnpm run qc:dev-stack`, `pnpm run verify:hrm:menu-density` (expect 10/10, performance-fidelity cycles≥5 evals≥300), SQL `SELECT COUNT(*) FROM performance_cycles; SELECT COUNT(*) FROM performance_evaluations;`, API `GET /api/hrm/performance/cycles?company_id=main` + `GET /api/hrm/performance/evaluations?company_id=main` as `ceo@xe.vn` — non-empty lists; L2 `/command-center/hrm/performance?portal=1` tab load; evidence `docs/qa/evidence/p1-hrm-h23-ac-fid-13-perf-qa-20260606.md`. |
| **evidence_path** | `docs/qa/evidence/p1-hrm-h23-ac-fid-13-perf-20260606.md` |
| **ack_status** | `READY_FOR_QA` |
