# P1-EX-BE-HTTPS-J-CC-03-SCOPE-01 — KPI rollup scope parity (HTTPS pilot)

| Field | Value |
|---|---|
| work_item_id | `P1-EX-BE-HTTPS-J-CC-03-SCOPE-01` |
| from_role | `dev-be` |
| to_role | `qa` |
| execution_time_utc | `2026-05-29` |
| ack_status | **READY_FOR_QA** |

## Problem

QA R6 / QC GWC (`docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r6-20260529.md`): HTTPS probe still **409** `SCOPE_CONTEXT_MISMATCH` on:

- **J-CC-03** — `GET /api/xbos/kpi-engine/rollup?tenantId=main&companyId=holding`
- **P-CC-04c** — same KPI path with portal session headers `x-tenant-id: main`, `x-company-id: main`

Root cause: portal session echoes operating bucket **`main`** as `defaultTenantId` / `x-tenant-id`, while JWT carries `tenantId=xevn`. `resolveKpiRollupScopeContext` holding bridge called `resolveScopeContext` with raw `tenantId=main` → tenant mismatch **before** group CEO `main`→`holding` alias ran.

HRM-api already had `normalizePortalScopeRequest` (J-HRM-06); xbos-api `scope-context` did not.

## Fix

| File | Change |
|---|---|
| `apps/api/xbos-api/src/common/scope-context.ts` | Add `normalizePortalScopeRequest` — map request `tenantId=main` → `xevn` when JWT tenant is master; wire into `resolveScopeContext` + `resolveTenantOnlyContext` |
| `apps/api/xbos-api/src/kpi-engine/kpi-rollup-scope.ts` | Normalize request before holding bridge + final resolver |
| `apps/api/xbos-api/src/common/xbos-group-legal-scope.ts` | Same normalization for group legal read paths |

ADR: `docs/architecture/ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md` §4 (KPI rollup).

## Regression tests

| Spec | Case |
|---|---|
| `scope-context.spec.ts` | JWT `xevn` + request `tenantId=main` → `{ tenantId: xevn, companyId: main }` |
| `kpi-rollup-scope.spec.ts` | group CEO + `tenantId=main&companyId=holding` → `{ tenantId: xevn, companyId: holding }` |
| `kpi-engine.controller.spec.ts` | rollup controller with query/header `main` + holding → service `('xevn','holding')` |
| `xbos-group-legal-scope.spec.ts` | unchanged PASS |

## Verification (local)

```bash
cd apps/api/xbos-api
pnpm exec jest src/common/scope-context.spec.ts src/kpi-engine/kpi-rollup-scope.spec.ts src/kpi-engine/kpi-engine.controller.spec.ts src/common/xbos-group-legal-scope.spec.ts
```

Result: **27/27 PASS**

## QA retest (HTTPS pilot)

Account: `ceo@xe.vn` / `Xevn@2026` · `https://14-225-217-232.nip.io`

1. Deploy/restart **xbos-api** on pilot VPS (same wave as hrm scope fixes).
2. Run probe:

```bash
PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs
```

3. Expect **J-CC-03** and **P-CC-04c** **PASS** — `GET /api/xbos/kpi-engine/rollup?tenantId=main&companyId=holding` → **200** `XBOS-KPI-202` (not 409).
4. Optional L2: Command Center dashboard — no KPI rollup 409 in network tab on load.

## completion_report

- **Closed:** xbos-api scope parity for KPI rollup when portal sends `tenantId=main` (query + `x-tenant-id`) with group CEO JWT `tenantId=xevn` and `companyId=holding` query; aligns with hrm-api `normalizePortalScopeRequest` pattern.
- **Residual:** Pilot **xbos-api** deploy required before HTTPS probe turns green; `P-CC-01-jwt` expiry probe remains separate work item.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: P1-EX-QA-HTTPS-J-CC-03-01
from_role: pm
to_role: qa
entry_criteria: docs/ops/evidence/p1-ex-be-https-j-cc-03-scope-01-20260529.md READY_FOR_QA; xbos-api deployed on https://14-225-217-232.nip.io
exit_criteria: scripts/tmp-p1-ex-qa-https-01-probe.mjs — J-CC-03 and P-CC-04c PASS (kpi-engine/rollup tenantId=main&companyId=holding → 200 XBOS-KPI-202, no SCOPE_CONTEXT_MISMATCH); optional CC dashboard network check
evidence_path: docs/qa/evidence/p1-ex-qa-https-j-cc-03-01-20260529.md
ack_status: PASS_TO_PM
```

## ack_status

**READY_FOR_QA**
