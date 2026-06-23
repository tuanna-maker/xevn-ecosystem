# P1-S2-BE-DEFECTS — S2-D-01..03 closure (scope + audit schema)

| Field | Value |
|-------|--------|
| **work_item_id** | S2-D-01, S2-D-02, S2-D-03 |
| **from_role** | dev-be |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-05-24 |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **prerequisite** | `docs/qa/evidence/p1-s2-qa-01-20260524.md` |

## Root cause summary

| ID | Symptom | Root cause | Fix |
|----|---------|------------|-----|
| **S2-D-01** | `GET /config-sync/catalog/job_titles` → 404 | Group CEO JWT `companyId=main`; catalog seed under `(xevn, holding)` | `resolveXbosGroupLegalReadScopeContext` on catalog GET/list |
| **S2-D-02** | `GET /platform-audit/events` → 500 | `platform_audit_events` table missing when migration not applied | `PlatformAuditService.ensureSchema()` on emit/list |
| **S2-D-03** | `GET /org-foundation/*` → 409 | Same JWT `main` vs seed `holding` on org plane | Same scope helper on org-foundation controller |

**ADR:** `docs/architecture/ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md` — extends §4 alias to XBOS catalog read, org-foundation, platform-audit (group CEO only; publish stays strict `resolveScopeContext`).

## Code changes

| File | Change |
|------|--------|
| `apps/api/xbos-api/src/common/xbos-group-legal-scope.ts` | New helper: group CEO JWT `main` → read partition `holding` |
| `apps/api/xbos-api/src/config-sync/config-sync.controller.ts` | GET catalog/list use helper; publish unchanged |
| `apps/api/xbos-api/src/org-foundation/org-foundation.controller.ts` | All routes use helper |
| `apps/api/xbos-api/src/platform/platform-audit.controller.ts` | listEvents uses helper |
| `apps/api/xbos-api/src/platform/platform-audit.service.ts` | `ensureSchema()` DDL for audit table |

## Verification

| Gate | Command | Result |
|------|---------|--------|
| xbos-api jest | `pnpm -C apps/api/xbos-api test` | **110/110** PASS (27 suites) |
| Capability registry | `pnpm run verify:capabilities` | **pass=23 skip=35 fail=0** exit 0 |
| Catalog bootstrap | `POST /config-sync/bootstrap-xevn` (internal key) | **XBOS-CFG-200**, 3 catalogs |

### Live probes (`ceo@xe.vn` bearer, no manual companyId header)

<a id="s2-d-01"></a>

| Probe | Before | After |
|-------|--------|-------|
| `GET /config-sync/catalog/job_titles?target=hrm` | 404 `XBOS-CFG-001` | **200** `XBOS-CFG-201` (partition `holding`, 5 items) |

<a id="s2-d-02"></a>

| Probe | Before | After |
|-------|--------|-------|
| `GET /platform-audit/events?companyId=main` | 500 `XBOS-SYS-001` | **200** `XBOS-AUDIT-200` (`total≥1` after bootstrap) |

<a id="s2-d-03"></a>

| Probe | Before | After |
|-------|--------|-------|
| `GET /org-foundation/legal-entities` (JWT default) | 409 `SCOPE_CONTEXT_MISMATCH` | **200** `XBOS-ORG-200` |
| `GET /org-foundation/org-units/tree` (master tenant) | 409 | **400** `XBOS-ORG-400` — by design: master uses `tenant-scope/group-org-overview` |

**Note:** ORG-01 tree on master tenant returns 400 (not scope defect). Legal-entity list scope defect closed.

## impl_status delta

| UC | Before | After |
|----|--------|-------|
| UC-XBOS-03 | be | **e2e_pass** |
| UC-XBOS-06 | be | **e2e_pass** |
| UC-XBOS-02, ORG-01/02 | be | be (publish / master org-tree not live-200) |

Updated: `docs/ecosystem/phase1-impl-status.json`

## Handoff

| Field | Value |
|-------|--------|
| entry_criteria | P1-S2-QA-01 defects S2-D-01..03 OPEN |
| exit_criteria | Live probes 200 for catalog/audit/legal-entities; jest + verify:capabilities PASS |
| evidence_path | `docs/qa/evidence/p1-s2-be-defects-20260524.md` |
| needed_by | P1-S2-QA-02 retest · P1-S2-QC-01 |
