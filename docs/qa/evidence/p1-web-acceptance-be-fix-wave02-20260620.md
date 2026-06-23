# P1-WEB-ACCEPTANCE-FIX-WAVE-01-R3 — BE fixes (UF-XBOS-14, UF-HRM-10, UF-HRM-11)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-WEB-ACCEPTANCE-FIX-WAVE-01-R3` |
| **from_role** | dev-be |
| **to_role** | qa |
| **supersedes** | `P1-WEB-ACCEPTANCE-FIX-WAVE-02` |
| **executed_at** | 2026-06-20 |
| **ack_status** | **READY_FOR_QA** |

## Executive summary

Closed three P0 BE blockers from QA R2 (`p1-web-acceptance-close-01-r2-20260620.md`):

| UF | Fix | Result |
|----|-----|--------|
| **UF-XBOS-14** | `upsertCommandCenterCatalogRow` merges dynamic `itemId` into `regulations` partition; `flattenCommandCenterCatalogList` surfaces `code` at top level on GET | jest **PASS** |
| **UF-HRM-10** | `resolveXbosApiBaseUrl()` ignores localhost `XBOS_API_URL` in Docker; compose sets `XBOS_API_URL=http://xbos-be:28002` + `DOCKER=1` | jest **PASS** |
| **UF-HRM-11** | `isGroupCeoPilotCompanyUuid` allows metadata submit/approve with employee `company_uuid` while JWT `companyId=main` | jest **PASS** |

**Build:** `xbos-api` + `hrm-api` `nest build` exit **0**.

## Root cause

### UF-XBOS-14

PUT autosave used dynamic `itemId` (`qa-uf14-*`) but GET list only returned partition rows (`regulations`/`measurements`/`pricing`) without flattening nested `rows[]`. Probe checks `items[].code` — row was persisted inside partition payload but invisible at list top level.

### UF-HRM-10

`hrm-be` container inherited `XBOS_API_URL=http://127.0.0.1:28002` from `apps/api/hrm-api/.env` via `env_file`, so `sync-from-xbos` could not reach `xbos-be` on docker network → **502** `HRM-SYNC-001`.

### UF-HRM-11

Group CEO JWT `companyId=main`; metadata submit sends body `company_id=<employee company_uuid>`. `companyScopeMatches` rejected pilot UUIDs not in `HRM_COMPANY_UUID_BY_SLUG` map → **409** `SCOPE_CONTEXT_MISMATCH`.

## Implementation

### UF-XBOS-14 (`xbos-api`)

- `business-master.service.ts`
  - `upsertCommandCenterCatalogRow`: merge row into category partition (`regulations` default)
  - `flattenCommandCenterCatalogList`: emit flat items with `id`/`code` for probe + portal
- Scope: group CEO `main` → `holding` partition unchanged (`resolveXbosGroupLegalMutationScopeContext`)

### UF-HRM-10 (`hrm-api` + compose)

- `catalog-sync.service.ts` — exported `resolveXbosApiBaseUrl()`:
  - Prefer non-localhost `XBOS_API_URL`
  - Docker: `http://xbos-be:${XBOS_BE_PORT:-28002}`
  - Local fallback: `http://127.0.0.1:28002`
- `xbos-catalog-workflow.bridge.ts` — reuse `resolveXbosApiBaseUrl()`
- `deploy/xevn-ecosystem/docker-compose.yml` — `hrm-be.environment`:
  - `DOCKER: "1"`
  - `XBOS_API_URL: http://xbos-be:${XBOS_BE_PORT:-28002}` (wins over env_file localhost)

### UF-HRM-11 (`hrm-api`)

- `scope-context.ts` — `isGroupCeoPilotCompanyUuid()` for group CEO on `main` accepting any `HRM_COMPANY_UUID_BY_SLUG` value in request
- `employee-metadata.controller.ts` — unchanged; uses `resolveScopeContext` on submit/approve

## Verification

```bash
# UF-XBOS-14
pnpm --dir apps/api/xbos-api exec jest \
  apps/api/xbos-api/src/business-master/p1-web-acceptance-cc-catalog.spec.ts \
  --no-coverage
# → 1 passed

# UF-HRM-10 + UF-HRM-11
pnpm --dir apps/api/hrm-api exec jest \
  apps/api/hrm-api/src/catalog-sync/p1-web-acceptance-xbos-sync-url.spec.ts \
  apps/api/hrm-api/src/common/scope-context.spec.ts \
  --no-coverage
# → 13 passed

# Build
pnpm --dir apps/api/xbos-api run build   # exit 0
pnpm --dir apps/api/hrm-api run build    # exit 0
```

## PSCP file list (VPS :8088)

```text
# UF-XBOS-14
apps/api/xbos-api/src/business-master/business-master.service.ts
apps/api/xbos-api/src/business-master/business-master.controller.ts
apps/api/xbos-api/src/business-master/p1-web-acceptance-cc-catalog.spec.ts

# UF-HRM-10
apps/api/hrm-api/src/catalog-sync/catalog-sync.service.ts
apps/api/hrm-api/src/catalog-sync/catalog-sync.controller.ts
apps/api/hrm-api/src/catalog-sync/p1-web-acceptance-xbos-sync-url.spec.ts
apps/api/hrm-api/src/settings-catalogs/settings-catalogs.service.ts
apps/api/hrm-api/src/settings-catalogs/settings-catalogs.controller.ts
apps/api/hrm-api/src/settings-catalogs/xbos-catalog-workflow.bridge.ts
apps/api/hrm-api/src/common/http-retry-fetch.ts
apps/api/hrm-api/src/common/hrm-catalog-sync-scope.ts
apps/api/hrm-api/.env.example

# UF-HRM-11
apps/api/hrm-api/src/common/scope-context.ts
apps/api/hrm-api/src/common/hrm-list-scope.ts
apps/api/hrm-api/src/employee-metadata/employee-metadata.controller.ts
apps/api/hrm-api/src/employee-metadata/employee-metadata.service.ts
apps/api/hrm-api/src/employee-metadata/employee-metadata.repository.ts
apps/api/hrm-api/src/employee-metadata/dto/submit-employee-metadata-change.dto.ts

# Compose (UF-HRM-10 docker network)
deploy/xevn-ecosystem/docker-compose.yml
```

**Post-pscp:** recreate `hrm-be` + `xbos-be` on VPS (`scripts/tmp-vps-deploy-acceptance-fix-wave-20260620.sh`).

## QA retest (Dev8088)

| UF | Command / path | Pass when |
|----|----------------|-----------|
| UF-XBOS-14 | `node scripts/tmp-p1-web-acceptance-4blocker-probe-8088.mjs` | PUT 200 + GET `found=true` |
| UF-HRM-10 | same script | `sync-from-xbos` 200/201 `HRM-SET-201` |
| UF-HRM-11 | same script | POST change-request 201 + approve 202 |

Account: `ceo@xe.vn` / `Xevn@2026` · portal `http://14.225.217.232:8088`

## Residual

| Item | Owner | Notes |
|------|-------|-------|
| VPS deploy | devops | pscp + recreate containers required before QA PASS on :8088 |
| UF-XBOS-05 | dev-fe | UI holding shareholder path — out of BE scope |
| Live probe | qa | R3 retest after devops deploy |

## Handoff

- **next_owner:** qa (+ devops for VPS pscp/recreate)
- **pm_dispatch_hint:** `P1-WEB-ACCEPTANCE-CLOSE-01-R3` — L0 + 4-blocker probe on :8088 after devops deploy
