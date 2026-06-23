# P1-PHASE1-BE-CONTRACTS-RATIO-01 — contracts-ratio density fix

**work_item_id:** P1-PHASE1-BE-CONTRACTS-RATIO-01  
**from_role:** dev-be  
**to_role:** qa  
**ack_status:** READY_FOR_QA  
**date:** 2026-06-05  
**defect:** C-W12QC-02

## Summary

Closed **C-W12QC-02**: pilot DB `contracts-ratio` was **0.848** (952/1122) — below **0.85** gate. Re-ran idempotent `pnpm run seed:hrm:contracts-density`; inserted **2** `employee_contracts` FK rows for active employees lacking any contract. Post-fix **7/7 PASS** on `verify:hrm:menu-density`.

## Root cause

| Factor | Detail |
|--------|--------|
| **Symptom** | `verify:hrm:menu-density` FAIL — `contracts=952 active=1122 ratio=0.848` |
| **Threshold** | `ceil(1122 × 0.85) = 954` contract rows required |
| **Gap** | **2** missing `employee_contracts` rows for active employees in group-CEO scope (`holding`, `trsport`, `logistics`, `finance`, `services`, `main`) |
| **Trigger** | Post–G5 wave workforce grew (+18 active vs prior 1104 baseline) without matching contract supplement; fidelity hash-cohort seed does not guarantee ratio after incremental employee adds |

No API/scope bug — list APIs and group CEO rollup unchanged. Pure **seed density / FK coverage** gap.

## Before / after

| Metric | Before | After |
|--------|--------|-------|
| Active employees | 1122 | 1122 |
| Contract rows | 952 | **954** |
| contracts-ratio | **0.848** | **0.850** |
| `verify:hrm:menu-density` | **6/7** | **7/7 PASS** |

## Fix applied

**No code change** — existing script sufficient.

```bash
pnpm run seed:hrm:contracts-density
# inserted: 2, ratio: 0.8503, target: 954

pnpm run verify:hrm:menu-density
# exit 0 — 7/7 PASS
```

**Idempotency re-run:**

```json
{ "skipped": true, "inserted": 0, "contracts": 954, "ratio": 0.8503 }
```

## Environment

| Item | Value |
|------|-------|
| DB | `deploy/xevn-ecosystem/.env` → `113.20.107.184` / `xevn_hrm` (shared with nip.io pilot) |
| Pilot URL | `https://14-225-217-232.nip.io` |
| Seed script | `scripts/seed-hrm-contracts-density.mjs` |
| Seed tag | `p1-p100-w12-contracts-density` |
| npm script | `pnpm run seed:hrm:contracts-density` |

## Verification log

```text
verify-hrm-menu-data-density — xevn_hrm

PASS  employees  employees=1190 (need >=1000)
PASS  contracts-ratio  contracts=954 active=1122 ratio=0.850 need>=0.85
PASS  insurance-ratio  insurance=1270 ratio need>=0.85
PASS  attendance-scale  attendance=471 need>=22
PASS  payroll-periods  payroll_periods=59 need>=10
PASS  recruitment-pipeline  requisitions=38 candidates=55 need>=5
PASS  leave-requests  leave_requests=59 need>=5

=== Summary: 7/7 PASS ===
```

## Residual / prevention

| Item | Status |
|------|--------|
| C-W12QC-02 contracts-ratio | **CLOSED** (this wave) |
| Re-run after future workforce seeds | **Recommend** `seed:hrm:contracts-density` after `seed:hrm:fidelity` or G5 employee adds |
| ~168 active employees still without contract | By design — ratio uses total rows, not 100% FK coverage |

## Handoff

| Field | Value |
|-------|-------|
| **next_owner** | qa |
| **ack_status** | READY_FOR_QA |
| **pm_dispatch_hint** | Re-run `verify:hrm:menu-density` on nip.io stack; close C-W12QC-02 if 7/7 PASS; spot-check group CEO contracts tab `ceo@xe.vn` / `main` |
