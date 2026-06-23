# P1-WEB-ACCEPTANCE-FIX-WAVE-01 — dev-be evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-WEB-ACCEPTANCE-FIX-WAVE-01` |
| **supersedes** | `P1-WEB-ACCEPTANCE-BE-FIX-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **executed_at** | 2026-06-20 |
| **ack_status** | **READY_FOR_QA** |
| **probe baseline** | `docs/qa/evidence/p1-web-acceptance-close-20260620.md` |

## Defects closed (BE-owned)

| UF-ID | Defect | Root cause | Fix |
|-------|--------|------------|-----|
| **UF-XBOS-12** | `D-UF-WEB-XBOS-12-01` | Member org-unit POST persisted under wrong partition; group GET returned nested empty `tree` | `resolveOrgUnitPersistScope` (member tenant + `main`); group GET flattens nested `groups[].tree` into `tree` for F5 surrogate |
| **UF-XBOS-14** | `D-UF-WEB-XBOS-14-01` | Probe PUT single row by dynamic `itemId`; FE stores `{ rows:[] }` per category partition | `BusinessMasterService.upsertCommandCenterCatalogRow` merges row into `regulations\|measurements\|pricing` partition |
| **UF-XBOS-15** | `D-UF-WEB-XBOS-15-01` | `HRM-SET-209` approval path invisible on GET | Dual-write draft `hrm_catalog_extension_items` on submit; `getOverview` exposes `catalog_key` / `extension_items` aliases |
| **UF-HRM-10** | `D-UF-WEB-HRM-10-01` | `sync-from-xbos` 502 — HRM called `localhost:3002` inside docker | `resolveXbosApiBaseUrl()` + docker-compose `XBOS_API_URL=http://xbos-be:28002` |
| **UF-HRM-11** | `D-UF-WEB-HRM-11-01` | Metadata submit requires UUID; employee list only had slug | `company_uuid` on `mapEmployee`; metadata accepts slug → `resolveHrmCompanyUuidForSlug` |
| **UF-HRM-12** | `D-UF-WEB-HRM-12-01` | PATCH route missing on deployed hrm-api | `PATCH` + `PUT` alias retained; scope parity tests PASS (deploy residual) |

## Files touched

| Package | Files |
|---------|-------|
| xbos-api | `org-foundation.service.ts`, `org-foundation.controller.ts`, `business-master.service.ts` |
| hrm-api | `catalog-sync.service.ts`, `settings-catalogs.service.ts`, `employees.service.ts`, `employee-metadata.service.ts`, `submit-employee-metadata-change.dto.ts`, `hrm-list-scope.ts`, `recruitment.controller.ts` |
| deploy | `deploy/xevn-ecosystem/docker-compose.yml`, `apps/api/hrm-api/.env.example` |

## Regression specs

| Spec | Result |
|------|--------|
| `org-foundation/p1-web-acceptance-org-units-scope.spec.ts` | **3/3 PASS** |
| `business-master/p1-web-acceptance-cc-catalog.spec.ts` | **1/1 PASS** |
| `settings-catalogs/p1-web-acceptance-extension-items.spec.ts` | **2/2 PASS** |
| `employee-metadata/p1-web-acceptance-metadata-company-uuid.spec.ts` | **2/2 PASS** |
| `catalog-sync/p1-web-acceptance-xbos-sync-url.spec.ts` | **2/2 PASS** |
| `recruitment/p1-phase1-be-rec-patch.spec.ts` | **PASS** |

## Commands (exit 0)

```bash
# xbos-api
pnpm exec jest org-foundation/p1-web-acceptance-org-units-scope.spec.ts business-master/p1-web-acceptance-cc-catalog.spec.ts
pnpm run build

# hrm-api
pnpm exec jest settings-catalogs/p1-web-acceptance-extension-items.spec.ts employee-metadata/p1-web-acceptance-metadata-company-uuid.spec.ts catalog-sync/p1-web-acceptance-xbos-sync-url.spec.ts recruitment/p1-phase1-be-rec-patch.spec.ts
pnpm run build
```

## QA retest matrix (:8088 post-deploy)

| UF-ID | Account | Pass when |
|-------|---------|-----------|
| UF-XBOS-12 | `ceo@xe.vn` | POST org-unit 201 → GET `org-units/tree` (flat `tree[]` or `?legal_entity_id=11d2bb7b-…`) contains new `code` |
| UF-XBOS-14 | `ceo@xe.vn` | PUT `…/command_center_catalogs/items/qa-uf14-*` 200 → GET items → `regulations.rows` contains code |
| UF-XBOS-15 | `ceo@xe.vn` | POST extension-items 201 → GET settings-catalogs `extension_items` contains code |
| UF-HRM-10 | `ceo@xe.vn` | POST `sync-from-xbos` **200** `HRM-SET-201` (not 502) |
| UF-HRM-11 | `ceo@xe.vn` | GET employees has `company_uuid`; POST metadata change-request **201** |
| UF-HRM-12 | `ceo@xe.vn` | POST requisition → PATCH or PUT → GET by id **200** `status=on_hold` |

## Residual

| Item | Owner | Notes |
|------|-------|-------|
| VPS :8088 images stale | **devops** | Restart `hrm-be` + `xbos-be` after merge; verify `XBOS_API_URL` in container env |
| UF-XBOS-05 holding shareholder UI 404 | **dev-fe** | Out of BE scope |
| UF-HRM-12 PATCH 404 if proxy blocks PATCH | **qa** | Retry PUT alias |

## Handoff

| Field | Value |
|-------|-------|
| **completion_report** | Closed 6/6 BE defects for web acceptance wave: org-unit tree persist + flat group GET, CC catalog row merge upsert, extension read-back, XBOS sync URL, employee `company_uuid` + metadata slug map, recruitment PATCH/PUT. Builds PASS. |
| **next_owner** | **devops** (hot-sync :8088) then **qa** |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/p1-web-acceptance-be-fix-20260620.md` |
| **ack_status** | **READY_FOR_QA** |

### next_dispatch_prompt (copy-ready)

```
work_item_id: P1-WEB-ACCEPTANCE-CLOSE-01-R2
from_role: devops
to_role: qa
priority: P0

entry_criteria: dev-be P1-WEB-ACCEPTANCE-FIX-WAVE-01 READY_FOR_QA — evidence docs/qa/evidence/p1-web-acceptance-be-fix-20260620.md

devops:
- Rebuild/restart hrm-be + xbos-be on :8088 VPS
- Verify hrm-be env: XBOS_API_URL=http://xbos-be:28002
- Smoke: curl POST /api/hrm/settings-catalogs/sync-from-xbos → 200 HRM-SET-201

qa:
- Re-run PORTAL_DEV_URL=http://14.225.217.232:8088 node scripts/tmp-p1-web-acceptance-close-20260620.mjs
- Target UF-XBOS-12/14/15 + UF-HRM-10/11/12 🟢 on Dev8088
- evidence: docs/qa/evidence/p1-web-acceptance-close-01-r2-20260620.md
- ack_status: PASS_TO_PM or FAIL_TO_PM
```
