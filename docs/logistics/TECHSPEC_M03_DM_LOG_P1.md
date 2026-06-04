# docs/logistics/TECHSPEC_M03_DM_LOG_P1.md

# M03 — XBOS-DM-LOG (Phase 1 catalog-only)

| Field | Value |
|-------|--------|
| **MOD** | M03 |
| **UC** | `XBOS-DM-LOG-01` … `XBOS-DM-LOG-22` (22) |
| **Phase** | P1 — configuration & seed only |
| **Owner** | Data + XBOS |
| **Parent** | [`TECHSPEC_HE_SINH_THAI_XEVN.md`](../ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md) §9.5 |
| **Delta** | [`P1-TECHSPEC-OPENAPI-DELTA-U18-20260524.md`](../architecture/P1-TECHSPEC-OPENAPI-DELTA-U18-20260524.md) §3.3 |

## 1. Scope

Phase 1 delivers **183-catalog subset for logistic vertical** on XBOS hub. No `logistic-api`, no shipment/order entities (P2).

## 2. API pattern (reuse M01)

| Operation | UC | Endpoint | Notes |
|-----------|-----|----------|-------|
| List catalogs | LOG-01 | `GET /config-sync/catalogs?target=xbos&tenantId=&companyId=` | Filter keys `log_dm_*` |
| CRUD values | LOG-03..05 | Publish via `POST /config-sync/catalog/{key}/publish` | Same as `XBOS-DM-03`..`05` |
| Assign subsystem | LOG-07 | Catalog metadata `assignmentTargets: [logistic]` | Seed JSON |
| Company copy | LOG-08..09 | Bootstrap script per company slug | DevOps seed |
| Export / import | LOG-10..11 | **P1 delta:** `export`/`import` paths (see OpenAPI delta) | CSV via config-sync |
| Sensitive change WF | LOG-12..13 | `catalog-governance/workflows/start` + approve/reject | Same as CAT workflow |
| History | LOG-14 | `platform-audit/events?entityType=catalog` | UC-XBOS-06 emit |
| Field extension | LOG-15..16 | `catalog-governance/extension-requests` | HRM pattern |
| Publish version | LOG-17 | `config-sync/catalog/{key}/publish` | G5 gate |
| Notify spoke | LOG-18 | Event on publish → future logistic pull (P2 stub OK) |
| Pre-op check | LOG-19 | `pnpm verify:phase1:logistic-catalog` | **G4 evidence** |
| 3-tier service | LOG-20 | Seed defs in `seed:phase1:logistic-catalog` | Cardinality in seed script |
| 3-tier vehicle | LOG-21 | Same seed bundle | |
| Unpriced products | LOG-22 | QA report row in LOG-19 output | Read-only check |

## 3. Scope rules

- Group CEO catalog reads: `resolveXbosGroupLegalReadScopeContext` or strict `holding` aligned with JWT per [`ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md`](../architecture/ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md).
- Member CEO: single company `main` only.

## 4. impl_status

Matrix: all 22 = `data` after `P1-S4-DO-01`. Promotion to `e2e_pass` requires LOG-19 script PASS + spot UI on catalog admin (optional P1).

## 5. Non-goals (P1)

- Logistic web module, driver app, 128 `LG-*` UC.
- Workflow execution on shipment entities.
