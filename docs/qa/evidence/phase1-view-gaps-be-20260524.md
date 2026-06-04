# PHASE1-VIEW-GAPS-BE — backend fixes

**work_item_id:** `PHASE1-VIEW-GAPS-BE`  
**Generated:** 2026-05-24T23:35:00Z  
**Owner:** dev-be

## Root causes

| Probe | Symptom | Cause | Fix |
|-------|---------|-------|-----|
| leave | HTTP 400 | `ListLeaveRequestsQueryDto` rejected `company_id=main` (`@IsUUID`) and probe `page_size=50` (`forbidNonWhitelisted`) | Slug `company_id` + optional `page_size`; list scope unchanged (`resolveHrmListScope`) |
| catalogs | total=0 | Group import catalogs seeded under `(xevn, holding)`; portal JWT uses `main` | `resolveHrmSettingsCatalogCompanyId` maps group CEO `main` → `holding` for overview |
| kpi-rollup | HTTP 409 | JWT `main` vs query `companyId=holding` | `resolveKpiRollupScopeContext` allows group CEO main→holding on rollup only |
| dept-templates | HTTP 404 | Probe path missing `/items`; running xbos stale | `GET /business-master/:domain` alias; xbos-api restart required |

## Verification

```text
pnpm exec jest --runInBand  (hrm-api)  → 117/117 PASS
pnpm exec jest --runInBand  (xbos-api) → 94/94 PASS
pnpm run verify:phase1:view-completeness → 10/10 PASS (exit 0)
```

Post-restart probe sample (`ceo@xe.vn`):

- `GET /api/hrm/attendance/leave-requests?company_id=main&page_size=50` → 200, total≥1
- `GET /api/hrm/settings-catalogs` → 200, catalogs=14
- `GET /api/xbos/kpi-engine/rollup?companyId=holding` → 200
- `GET /api/xbos/business-master/dept_system_templates` → 200

## Files touched

- `apps/api/hrm-api/src/attendance/dto/list-leave-requests.query.dto.ts`
- `apps/api/hrm-api/src/common/hrm-list-scope.ts` (+ spec)
- `apps/api/hrm-api/src/settings-catalogs/settings-catalogs.controller.ts`
- `apps/api/hrm-api/src/attendance/leave-requests.service.spec.ts`
- `apps/api/xbos-api/src/kpi-engine/kpi-rollup-scope.ts` (+ spec, controller)
- `apps/api/xbos-api/src/business-master/business-master.controller.ts`

## Handoff

- **ack_status:** `READY_FOR_QA`
- **evidence_path:** `docs/qa/evidence/phase1-view-gaps-be-20260524.md`
- **QA matrix:** re-run `pnpm run verify:phase1:view-completeness` after `xbos-api` deploy/restart on pilot stack.
