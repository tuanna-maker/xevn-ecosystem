# VPS deploy evidence — P1-PHASE1-DO-XBOS-BE-SCOPE-DEPLOY-01 (2026-06-04)

| Field | Value |
|-------|--------|
| work_item_id | P1-PHASE1-DO-XBOS-BE-SCOPE-DEPLOY-01 |
| depends_on | P1-PHASE1-BE-SCOPE-CRUD-01 |
| VPS | root@14.225.217.232 `/opt/xevn-ecosystem` |
| Portal HTTPS | https://14-225-217-232.nip.io |
| VPS git HEAD | `68ec457` (unchanged) |
| ack_status | **READY_FOR_QA** |

## Deploy method

Scope-fix files were **not yet on `origin/main`** at deploy time. Synced via **pscp** (hotfix path), then `docker compose` rebuild **xbos-be only** — no `docker compose down`, non-xevn containers untouched.

| Local file (synced) | Remote path |
|---------------------|-------------|
| `legal-entity-profile.controller.ts` | `/opt/xevn-ecosystem/apps/api/xbos-api/src/legal-entity-profile/` |
| `legal-entity-profile.controller.spec.ts` | same |
| `xbos-group-legal-scope.spec.ts` | `/opt/xevn-ecosystem/apps/api/xbos-api/src/common/` |

## VPS steps

1. Audit: `xevn-xbos-be-dev` Up
2. `node scripts/merge-vps-port-env.mjs --apply-canonical` (XBOS_BE_PORT=28002)
3. `docker compose --env-file .env up -d --build --force-recreate xbos-be`
4. Sleep 45s

## Remote smoke

| Endpoint | HTTP |
|----------|------|
| `127.0.0.1:28002/api/xbos/metrics` | 200 |
| `https://14-225-217-232.nip.io/api/xbos/metrics` | 200 |

Container: `xevn-xbos-be-dev` Up after recreate.

## Primary exit — `scripts/tmp-phase1-be-scope-crud-probe.mjs`

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-phase1-be-scope-crud-probe.mjs
```

| Step | Result |
|------|--------|
| login ceo@xe.vn | PASS |
| GET legal-entity `11d2bb7b-6190-4cb4-b0fe-03d43b5596b8` (xe-du-lich / main) | PASS HTTP 200 `XBOS-ORG-200` |
| **GET shareholders** (xe-du-lich / main) | **PASS HTTP 200 `XBOS-SHR-200`** (was 409 pre-deploy) |
| PUT XE_DU_LICH | PASS HTTP 200 `XBOS-ORG-201` |
| du-lich.ceo@xe.vn GET xevn/main rollup | PASS HTTP 409 (blocked) |
| **Exit code** | **0** (`PROBE_OK`) |

## Residual

- **Git drift:** VPS image built from pscp-synced sources; `origin/main` still lacks `P1-PHASE1-BE-SCOPE-CRUD-01` commit — **dev-be** should commit + push `legal-entity-profile` scope files so next standard `git pull` deploy is reproducible.
- QA L2.5: shareholders tab preload in Command Center member legal UI (J-* per `docs/qa/evidence/p1-phase1-be-scope-crud-20260604.md`).

## next_owner

qa — L2/L2.5 on nip.io for member legal + shareholders; work_item `P1-PHASE1-QA-CRUD-JOURNEY-01`.
