# DO-HDSD-MUTATE-SOFTDEL-BH-REDEPLOY-01 — evidence (2026-08-01)

**work_item_id:** `DO-HDSD-MUTATE-SOFTDEL-BH-REDEPLOY-01`  
**program:** `P-HDSD-ECOSYSTEM-03` · R-8088-FE-SOFTDEL-IMPORT-01 + R-8088-FE-BH-IMPORT-01 + R-8088-BE-INS-POL-404-01  
**ack_status:** `READY_FOR_QA`  
**VPS HEAD:** `3920df3` (`origin/main`)  
**Operator:** devops  
**U65:** no seed · no demote

## Closed

1. **Allow-list commit** `0148d13` — SoftDel/BH FE deps + E3 insurance-policies routes (+ compensation compile siblings + `app.module` `EmployeeCompensationService` provider).
2. **Compile follow-up** `3920df3` — surgical `getEffectiveItemsForKey` / `assertCodeInEffectiveCatalog` on HEAD `SettingsCatalogsService` (Nest tsc failed without these).
3. **Push** `origin/main` → VPS `git pull --ff-only` to `3920df3`.
4. **Redeploy** (no `compose down`; keep `docker-compose.xbos-node.yml`):
   - force-recreate `hrm-be`, `hrm-fe`, `portal-fe`
   - xbos-be left running (override intact)

## Extra compile deps (documented)

| Path | Why |
|------|-----|
| `apps/api/hrm-api/src/contracts-insurance/employee-compensation.service.ts` (+ spec + compensation DTOs) | Controller imports/injects compensation |
| `apps/api/hrm-api/src/app.module.ts` | Register `EmployeeCompensationService` provider (HEAD lacked it) |
| `apps/api/hrm-api/src/common/assert-status-transition.ts` | Service import; restored from `dist` (was untracked/missing) |
| `settings-catalogs.service.ts` ADD methods only | E3 service calls catalog helpers missing on main |

**Not shipped:** full dirty local settings/catalog-sync rewrite, leave/recruitment workflow module churn.

## Local verify

- `pnpm --filter hrm-api exec jest --testPathPatterns=contracts-insurance` → **59 passed** (against HEAD catalog modules; local dirty catalog-sync that imports missing `hrm-settings-master-keys` was temporarily checked out to HEAD for that run).

## Smoke (workstation → VPS)

| Check | Result |
|-------|--------|
| `GET :3001/api/hrm/contracts-insurance/insurance-policies?company_id=main` | **401** (route exists — not 404) |
| `GET :8088/` | **200** |
| `GET :8080/` | **200** (SPA; redirects `/hr/`) |
| `GET :8088/src/lib/employeeCompanyDisplayName.ts` | **200** |
| `GET :8088/src/hooks/useSettingsCatalogsOverview.ts` | **200** |
| `GET :8080/hr/src/lib/employeeCompanyDisplayName.ts` | **200** (base `/hr/`) |
| `GET :8080/hr/src/hooks/useSettingsCatalogsOverview.ts` | **200** |
| non-xevn containers | still Up (ytexa/hsbx/asms/viconnec) |
| xbos-node override | compose `-f docker-compose.xbos-node.yml` used |

## Residual

- Browser SoftDel/BH/insurance mutate journeys not run here (QA SMOKE-02).
- Local WIP still has dirty catalog-sync referencing untracked `hrm-settings-master-keys` — **not** on VPS/main; do not confuse local jest with VPS Nest.

## Race note

Parallel ops lane briefly committed then reverted allow-list (`837a0ee` / `403dbe4`). Product files re-committed as `0148d13` and verified on remote before VPS pull.
