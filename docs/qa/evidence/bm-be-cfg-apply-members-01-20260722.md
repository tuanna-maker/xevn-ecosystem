# BM-BE-CFG-APPLY-MEMBERS-01 — Holding apply/fan-out (G-BM-REC-01)

| Field | Value |
|-------|--------|
| **work_item_id** | `BM-BE-CFG-APPLY-MEMBERS-01` |
| **program** | `P1-BMINUTES-CUST-RETEST-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **date** | 2026-07-22 (ICT) |
| **ack_status** | **READY_FOR_QA** |
| **gap closed** | **G-BM-REC-01** / **G-BM-03** (catalog Option B) |

## spec_read_ack

| Artifact | Cite |
|----------|------|
| SA trace | `docs/qa/evidence/bm-sa-xbos-hrm-rec-trace-01-20260722.md` §3–§5 Option **B** · G-BM-REC-01 |
| Explore | `docs/qa/evidence/bm-exp-be-wf-bridge-01-20260722.md` G-BM-03 |
| Ownership | `docs/hrm/DANH_MUC_XBOS_CHO_HRM.md` §14 **XBOS-DM-HRM-07** |
| Linkage keys | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` §3 `job_titles` · `recruitment_channels` · `job_grades` |
| OpenAPI | `docs/api/openapi/xbos-api.yaml` `configSyncApplyCatalogToMembers` |
| Consumer | FR-HRM-SC-01 / `POST …/catalog-sync/pull/:key` (member partition) |

**must_keep verified in design:** single-company `POST …/publish` unchanged · LeaveWorkflowBridge / CatalogWorkflowBridge / recruitment WF bridge **not touched** · U65 no seed.

---

## What was implemented

### API

`POST /api/xbos/config-sync/catalog/{catalogKey}/apply-to-members` → **`XBOS-CFG-204`**

| Body field | Meaning |
|------------|---------|
| `tenantId` + `companyId` | **Source** partition (typically `xevn` / `holding`) |
| `targets[]` | Cross-tenant members `{ tenantId, companyId }` (preferred) |
| `memberCompanyIds[]` | Same-tenant shorthand under source `tenantId` |
| `actor` | Optional audit actor |

**Allow-list (narrow):** `job_titles` · `recruitment_channels` · `job_grades`  
Other keys → **`400 XBOS-CFG-005`**.

**Behavior:** Read source catalog → for each unique target ≠ source → reuse existing `publishCatalog` upsert (version/checksum/items/audit identical to single publish). Platform audit action `config_catalog.apply_to_members`.

**Scope:** Controller uses `resolveXbosGroupLegalReadScopeContext` so group CEO JWT `main` maps source to legal `holding` (ADR scope ladder).

### Files

| Path | Change |
|------|--------|
| `apps/api/xbos-api/src/config-sync/dto/apply-catalog-to-members.dto.ts` | **ADD** DTO |
| `apps/api/xbos-api/src/config-sync/config-sync.service.ts` | **ADD** `applyCatalogToMembers` + allow-list + CODE-MEMORY |
| `apps/api/xbos-api/src/config-sync/config-sync.controller.ts` | **ADD** route |
| `apps/api/xbos-api/src/config-sync/*.spec.ts` | **ADD** jest cases |
| `docs/api/openapi/xbos-api.yaml` | **ADD** path + `ApplyCatalogToMembersBody` |

### Jest evidence

```text
pnpm --filter xbos-api exec jest --testPathPatterns=config-sync --no-coverage
Test Suites: 2 passed, 2 total
Tests:       26 passed, 26 total
```

---

## Residual (documented — out of this narrow PR)

| Gap | Status | Follow-up work_item |
|-----|--------|---------------------|
| **G-BM-REC-02** WF definition bind/clone to members | **OPEN** | `BM-BE-REC-WF-BIND-01` |
| **G-BM-REC-04** STT 37–42 ↔ runtime key matrix | **OPEN** (allow-list covers documented runtime keys only) | `ba-data` → optional BE keys |
| WF builders resolver enrich | **OPEN** (G-BM-02) | `BM-BE-REC-WF-RESOLVER-TEMPLATES-01` |
| FE apply wizard | **OPEN** | `BM-FE-*` after BE READY |

**Cấm honored:** no seed · no Phase1/PROD claim · DM-07 seed path **not** used as solution.

---

## completion_report

**Closed:** Option B catalog fan-out API + OpenAPI + jest for HRM recruitment allow-list keys; closes **G-BM-REC-01** / **G-BM-03** for catalogs.  
**Residual:** G-BM-REC-02 WF bind; FE UX; browser U65 E2E `BM-QA-REC-E2E-8088-01` after FE.

## next_owner

`qa` (API contract smoke) then `pm` → FE apply UX + WF bind when ready.

## next_dispatch_prompt

```text
work_item_id: BM-QA-CFG-APPLY-MEMBERS-01
from_role: pm
to_role: qa
priority: P0
program: P1-BMINUTES-CUST-RETEST-01
entry_criteria: docs/qa/evidence/bm-be-cfg-apply-members-01-20260722.md READY_FOR_QA · L0 xbos-api up · U65 zero-seed
job:
  - Publish holding job_titles (or recruitment_channels) via existing POST …/publish (single scope) — from FE or documented admin path if available; else API-only L1 for this wave with note FE follow-up.
  - POST …/catalog/{key}/apply-to-members with targets member (e.g. xe-du-lich/main) → XBOS-CFG-204.
  - GET catalog for member companyId → items match source checksum/version semantics.
  - HRM member pull (settings-catalogs/sync-from-xbos or catalog-sync/pull) sees member partition — no seed.
  - Regression: single-company publish still XBOS-CFG-203; leave/rec WF bridges untouched (smoke only).
  - cấm: seed · claim BM-06 full E2E until FE apply + WF bind.
exit_criteria: PASS_TO_PM · evidence docs/qa/evidence/bm-qa-cfg-apply-members-01-YYYYMMDD.md
spec_ref: XBOS-DM-HRM-07 · G-BM-REC-01 · OpenAPI configSyncApplyCatalogToMembers
```

## pm_dispatch_hint

1. QA `BM-QA-CFG-APPLY-MEMBERS-01` (this evidence)  
2. Parallel residual: `BM-BE-REC-WF-BIND-01` (G-BM-REC-02) when PM slots Wave1  
3. FE apply members UX after QA L1 green
