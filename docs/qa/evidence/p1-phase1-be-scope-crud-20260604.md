# P1-PHASE1-BE-SCOPE-CRUD-01 — XBOS legal-entity read scope parity

| Field | Value |
|-------|-------|
| work_item_id | P1-PHASE1-BE-SCOPE-CRUD-01 |
| owner | dev-be |
| ack_status | READY_FOR_QA |
| date | 2026-06-04 |

## Problem (U28)

Group CEO `ceo@xe.vn` (JWT `xevn/main`) must read/mutate member legal entities when portal sends member registry headers (`x-tenant-id: xe-du-lich`, `x-company-id: main`). Member CEO `du-lich.ceo@xe.vn` must remain blocked on group rollup (`xevn/main`).

**P0:** `GET /org-foundation/legal-entities/:id` and `GET …/shareholders` returned **409 SCOPE_CONTEXT_MISMATCH** for group CEO with member tenant headers — `legal-entity-profile` used strict `resolveScopeContext` instead of `resolveXbosGroupLegalReadScopeContext`.

## Change

| File | Change |
|------|--------|
| `apps/api/xbos-api/src/legal-entity-profile/legal-entity-profile.controller.ts` | `readScope` → `resolveXbosGroupLegalReadScopeContext`; writes → `resolveXbosGroupLegalMutationScopeContext` |
| `apps/api/xbos-api/src/legal-entity-profile/legal-entity-profile.controller.spec.ts` | Group CEO member-tenant shareholders; member CEO group rollup 409 |
| `apps/api/xbos-api/src/common/xbos-group-legal-scope.spec.ts` | U28 member CEO blocked on `xevn/main` |
| `apps/api/xbos-api/src/org-foundation/org-foundation.legal-scope-crud.integration.spec.ts` | Supertest browser-shaped GET entity + shareholders + member block |

`org-foundation.controller.ts` already used read/mutation resolvers for GET-by-id (no code change).

## HRM audit

Grep `hrm-api` for `org-foundation` / legal-entity controllers: **no** XBOS legal-entity routes; scope parity for this work item is **xbos-api only**.

## Verification

```text
pnpm --filter xbos-api test
→ Test Suites: 45 passed, Tests: 242 passed (exit 0)
```

New/updated cases: `P1-PHASE1-BE-SCOPE-CRUD-01`, `U28` in scope + profile + integration specs.

### Pilot smoke (`scripts/tmp-phase1-be-scope-crud-probe.mjs`)

Target: `https://14-225-217-232.nip.io` · entity `11d2bb7b-6190-4cb4-b0fe-03d43b5596b8` · tenant `xe-du-lich`

| Step | Result |
|------|--------|
| login ceo@xe.vn | PASS |
| GET legal-entity (member headers) | PASS HTTP 200 XBOS-ORG-200 |
| GET shareholders (member headers) | **FAIL HTTP 409** (stale `xbos-be` — fix not deployed) |
| PUT XE_DU_LICH | PASS HTTP 200 XBOS-ORG-201 |
| du-lich.ceo@xe.vn GET xevn/main | PASS HTTP 409 (blocked as expected) |

**QA note:** Re-run shareholders row after **devops** redeploy `xbos-be` with this commit.

## Residual

- Pilot shareholders 409 until VPS image includes `legal-entity-profile` scope fix (same class as prior P1-CC member-legal deploy gaps).

## J-* / matrix

- J-CC member legal edit preload (shareholders tab)
- P-CC-* Command Center member unit legal entity

## Handoff

- `next_owner`: qa
- `work_item_id` QA: P1-PHASE1-QA-CRUD-JOURNEY-01
