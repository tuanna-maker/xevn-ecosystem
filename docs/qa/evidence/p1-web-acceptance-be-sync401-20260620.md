# P1-WEB-ACCEPTANCE-BE-SYNC-401 — UF-HRM-10 upstream auth fix

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-WEB-ACCEPTANCE-BE-SYNC-401` |
| **from_role** | dev-be |
| **to_role** | qa |
| **executed_at** | 2026-06-20 |
| **ack_status** | **READY_FOR_QA** |

## Executive summary

Fixed **UF-HRM-10** residual on VPS `:8088`: `POST /settings-catalogs/sync-from-xbos` returned **502** `HRM-SYNC-001` because `hrm-be → xbos-be` `GET /config-sync/catalogs` received **401** `XBOS-AUTH-001 Unauthorized internal access`. Root cause: `listRemoteCatalogsFromXbos` and bulk `syncAllFromXbos` did not forward caller JWT; in `NODE_ENV=production` static internal-key fallback is disabled and no `Authorization` header was sent.

## Root cause

| Layer | Finding |
|-------|---------|
| **Symptom** | R3 4-blocker probe 3/4 — only UF-HRM-10 FAIL (`sync` 502) |
| **Upstream** | `CatalogSyncService.listRemoteCatalogsFromXbos` called `buildXbosUpstreamHeaders()` with **no** `authorization` |
| **Bulk pull** | `SettingsCatalogsService.syncAllFromXbos` did not pass JWT to list or per-key `pullCatalogFromXbos` |
| **Production** | `isAuthorizedInternalRequest` on xbos-be rejects dev fallback key when `NODE_ENV=production`; minted/service JWT required |

## Implementation

### `catalog-sync.service.ts`

- `buildXbosUpstreamHeaders(authorization?, scope?)`:
  - Forwards caller `Bearer` when present
  - Else mints `signServiceJwt({ sub: 'hrm-be', svc: 'catalog-sync', tenantId, companyId, roles: ['service'] })` for docker/production S2S
  - Retains `x-internal-api-key` when configured
- `listRemoteCatalogsFromXbos(tenantId, companyId, authorization?)` — passes auth + scope to headers
- `pullCatalogFromXbos` — passes scope to headers (mint fallback when no caller JWT)

### `settings-catalogs.service.ts` + `settings-catalogs.controller.ts`

- `syncAllFromXbos(tenantId, companyId, authorization?)` — JWT pass-through to list + pull loop
- `syncFromXbos` controller passes `@Headers('authorization')` into service

## Verification

```bash
pnpm --dir apps/api/hrm-api exec jest \
  apps/api/hrm-api/src/catalog-sync/p1-web-acceptance-be-sync401.spec.ts \
  apps/api/hrm-api/src/catalog-sync/p1-web-acceptance-xbos-sync-url.spec.ts \
  apps/api/hrm-api/src/settings-catalogs/settings-catalogs.controller.spec.ts \
  --no-coverage
# → 35 passed

pnpm --dir apps/api/hrm-api run build
# → exit 0
```

## QA exit criteria (post-deploy :8088)

| Check | Expected |
|-------|----------|
| `ceo@xe.vn` POST `/api/hrm/settings-catalogs/sync-from-xbos` | **200/201** `HRM-SET-201` |
| hrm-be logs | No `XBOS API error 401` on config-sync/catalogs |
| UF-HRM-10 probe | sync 200/201 + POST items 200/201 |

Account: `ceo@xe.vn` / `Xevn@2026` · base `http://14.225.217.232:8088`

## DevOps hot-sync (pscp) — hrm-be only

Recreate `hrm-be` after pscp:

```
apps/api/hrm-api/src/catalog-sync/catalog-sync.service.ts
apps/api/hrm-api/src/catalog-sync/p1-web-acceptance-be-sync401.spec.ts
apps/api/hrm-api/src/settings-catalogs/settings-catalogs.service.ts
apps/api/hrm-api/src/settings-catalogs/settings-catalogs.controller.ts
apps/api/hrm-api/src/settings-catalogs/settings-catalogs.controller.spec.ts
```

Remote: `/opt/xevn-ecosystem/<path>` → `docker compose -f deploy/xevn-ecosystem/docker-compose.yml up -d --force-recreate hrm-be`

**Prerequisite:** `SERVICE_JWT_SECRET` must match on `hrm-be` and `xbos-be` (deploy `.env`).

## Handoff

- **completion_report:** UF-HRM-10 BE auth chain closed — JWT forward + service JWT mint for xbos config-sync upstream; jest 35/35 PASS; build exit 0.
- **next_owner:** `qa`
- **residual:** Live `:8088` retest after devops pscp + hrm-be recreate; confirm `SERVICE_JWT_SECRET` parity on VPS.
- **evidence_path:** `docs/qa/evidence/p1-web-acceptance-be-sync401-20260620.md`
- **ack_status:** **READY_FOR_QA**

### next_dispatch_prompt

```
Role: qa
work_item_id: P1-WEB-ACCEPTANCE-CLOSE-01-R3-UF10
from_role: dev-be
to_role: qa
entry_criteria: devops pscp 5 hrm-be files from docs/qa/evidence/p1-web-acceptance-be-sync401-20260620.md + force-recreate hrm-be; evidence p1-web-acceptance-be-sync401-20260620.md READY_FOR_QA
exit_criteria: On http://14.225.217.232:8088 with ceo@xe.vn — POST /api/hrm/settings-catalogs/sync-from-xbos returns 200/201 HRM-SET-201 (not 502); UF-HRM-10 row PASS in 4-blocker + full 23 UF matrix; document docs/qa/evidence/p1-web-acceptance-close-01-r3-20260620.md §UF-HRM-10; ack_status PASS_TO_PM or FAIL_TO_PM
evidence_path: docs/qa/evidence/p1-web-acceptance-close-01-r3-20260620.md
ack_status: PASS_TO_PM
pm_dispatch_hint: If still 401 — verify SERVICE_JWT_SECRET parity hrm-be/xbos-be on VPS deploy .env
```
