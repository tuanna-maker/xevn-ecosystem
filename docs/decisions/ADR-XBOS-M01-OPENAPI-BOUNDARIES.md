# ADR: XBOS M01 — OpenAPI package & API boundaries (Sprint S1)

| Field | Value |
|-------|--------|
| **Status** | Accepted |
| **Date** | 2026-05-23 |
| **Work item** | `P1-S1-SA-01` |
| **Sprint** | S1 only — **S0 closed; S2 not started** |
| **Deciders** | SA |
| **Evidence** | `docs/api/openapi/xbos-api.yaml`, `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4.6, `docs/xbos/TECHSPEC.md` §5 |

## Context

Phase 1 Sprint 1 targets **Module M01** (~75 UC): catalog publish/pull, KPI engine, org foundation, tenant scope, business master, and platform audit (emit path). Dev lanes `P1-S1-BE-01`…`BE-04` need a **single contract surface** and **bounded contexts** so FE/QA do not cross wires (e.g. `companyId=main` vs JWT `holding` → HTTP 409).

Runtime code lives in `apps/api/xbos-api`. Prior OpenAPI stub only documented health/metrics.

## Decision

1. **Canonical OpenAPI** for M01 hub APIs: `docs/api/openapi/xbos-api.yaml` (OpenAPI 3.1), tagged by plane: `M01-Catalog`, `M01-KPI`, `M01-Org`, `M01-Tenant`, `M01-Master`, `Platform`.
2. **Bounded contexts** (who owns write vs read):

| Plane | Bounded context | Controller prefix | Scope resolver | Primary consumers | S1 BE owner |
|-------|-----------------|-------------------|----------------|-------------------|-------------|
| Catalog | Publish & export definitions | `config-sync` | `resolveScopeContext` | HRM `catalog-sync`, portal | P1-S1-BE-01 |
| Catalog | Extension approval workflow | `catalog-governance` | Internal auth only (gap: add scope in BE-01) | Command Center | P1-S1-BE-01 |
| KPI | Evaluate / rollup / alerts | `kpi-engine` | Rollup: full scope; alerts: `resolveTenantOnlyContext` | Portal dashboard, CC rail | P1-S1-BE-02 |
| Org | Legal entity + org tree | `org-foundation` | `resolveScopeContext` | Portal, HRM metadata | P1-S1-BE-03 |
| Org | Position templates & RBAC | `position-rbac` | Templates: tenant-only; assignments: full scope | Portal HR settings | P1-S1-BE-03 |
| Tenant | Membership & group overview | `tenant-scope` | JWT `sub` / email — **no** `companyId` gate | GlobalFilter, CC | P1-S1-BE-03 (read) |
| Master | Domain CRUD whitelist | `business-master/:domain` | `resolveScopeContext` | Portal settings panels | P1-S1-BA-D-01 / BE-01 |
| Audit | Platform audit events | `platform_audit_events` (DB) | N/A — **no REST in S1** | Ops, future `UC-XBOS-06` | P1-S1-BE-04 |
| CC presentation | Workspace meta / KPI aggregation | `command-center` | `resolveScopeContext` | Portal only — **not** duplicate `kpi-engine` math | P1-S1-FE-01 |

3. **Out of M01 S1 OpenAPI scope** (defer S2 / separate modules): `workflow-engine` graph, `raci-governance`, `asset-requests`, Logistic spoke, full `command-center` inbox unification.

4. **Contract CI**: `pnpm verify:openapi-m01` validates YAML presence + required M01 paths (static). Runtime smoke remains `pnpm verify:openapi-contract` (health/metrics on running APIs).

## Architecture invariants

```text
Portal / HRM spoke
        │
        ▼
┌───────────────────────────────────────────────────┐
│ XBOS API  /api/xbos                               │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ config-sync │  │ kpi-engine   │  │ org-fnd   │ │
│  │ (publish)   │  │ (compute)    │  │ (structure)│ │
│  └──────┬──────┘  └──────┬───────┘  └─────┬─────┘ │
│         │                │                 │       │
│         └────────────────┼─────────────────┘       │
│                          ▼                       │
│              resolveScopeContext (JWT ∩ query)    │
│              409 SCOPE_CONTEXT_MISMATCH if drift  │
└───────────────────────────────────────────────────┘
                          │
                          ▼
                   PostgreSQL xevn_xbos
```

### Scope rules (enforceable)

| Rule | Behavior | Error code |
|------|----------|------------|
| JWT present | Query/header `tenantId`/`companyId` must match claims | `SCOPE_CONTEXT_MISMATCH` (409) |
| Holding CEO rollup | Use `companyId=holding` aligned with token — not `main` | Pilot P-CC-04 evidence |
| Tenant-only endpoints | `portal-alerts`, position `templates` | `resolveTenantOnlyContext` |
| Internal edge | `Authorization` or `x-internal-api-key` | `XBOS-AUTH-001` (401) |

### KPI vs Command Center

- **`kpi-engine`**: deterministic evaluate/rollup (`XBOS-KPI-200`…`203`) — **source of KPI math**.
- **`command-center`**: presentation/workspace meta (`XBOS-CC-200`) — **no** re-implementation of rollup formulas in S1 (see `docs/xbos/TECHSPEC.md` §12.2 Option B).

### Catalog vs Business master

- **`config-sync`**: versioned catalog keys, targets `hrm|xbos|web-portal`, publish/bootstrap.
- **`business-master`**: row-level master domains (`kpi_metrics`, `positions`, …) — whitelist in `BusinessMasterService.allowedDomains`.
- HRM **must not** write catalog definitions; only pull via `catalog-sync` spoke.

## Options considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A — Expand OpenAPI from controllers (this ADR) | Matches code; QA traceability | Manual drift until codegen | **Chosen** |
| B — Swagger decorators in Nest only | Always in sync | Not started; large S1 diff | Defer S2 |
| C — Single `/api/xbos/graphql` | Flexible | Breaks envelope/scope patterns | Rejected |

## Consequences

- **BA** (`P1-S1-BA-P-01`, `P1-S1-BA-D-01`): UC rows must cite `operationId` from `xbos-api.yaml`.
- **Dev-BE**: Changes to M01 routes require OpenAPI + ADR update in same PR.
- **QA**: L1 UAT scenarios attach path + expected `code` from spec.
- **PM**: Dispatch `P1-S1-BE-01` after BA packets; **do not** open S2 capability gate until S1 QA-01 PASS.

## Validation

| Check | Command / artifact | Pass |
|-------|-------------------|------|
| Static M01 contract | `pnpm verify:openapi-m01` | Required paths in YAML |
| Runtime health | `pnpm verify:openapi-contract` | When stack up |
| Pilot scope alignment | `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` P-CC-04 | `companyId` = JWT |

## References

- `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4.6
- `docs/xbos/TECHSPEC.md` §5
- `apps/api/xbos-api/src/common/scope-context.ts`
- `docs/program/PHASE1_COMPLETION_PLAN.md` Sprint 1 table
