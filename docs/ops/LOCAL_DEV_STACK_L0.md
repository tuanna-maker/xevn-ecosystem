# Local dev stack — L0 (`qc:dev-stack`) for QA

Use this when QA runs **L0** / **L1** on a developer workstation (not VPS DEV).

## Ports (default)

| Service | URL | Start command |
|---------|-----|---------------|
| hrm-api | `http://127.0.0.1:28001/api/hrm` | `pnpm run dev:hrm-api` (turbo → `nest start --watch`) |
| xbos-api | `http://127.0.0.1:28002/api/xbos` | **Preferred (durable):** `pnpm run dev:xbos-api:node` · alt: `pnpm run dev:xbos-api` (watch) |
| web-portal | `http://127.0.0.1:5173` (optional L0) | `pnpm run dev:web-only` or `pnpm run dev:web` |

`pnpm dev` does **not** start hrm-api — run **`pnpm run dev:hrm-api`** in a separate terminal (same pattern as xbos-api).

**Port:** `HRM_BE_PORT` is read from `deploy/xevn-ecosystem/.env` (loaded by `apps/api/hrm-api/src/load-env.ts` before `apps/api/hrm-api/.env`). For L0, set **`HRM_BE_PORT=28001`** in deploy `.env` so health matches `qc:dev-stack` (default probe URL). Equivalent: `pnpm --filter hrm-api run start:dev` with the same env.

### xbos-api — durable local start (OBS-XBOS-DIST)

On **OneDrive / Unicode paths** (`Tài liệu` NFD), `nest start --watch` can wipe `apps/api/xbos-api/dist` before emit completes → `:28002` **ECONNREFUSED** / `Cannot find module …/dist/main`.

| Mode | Command | When |
|------|---------|------|
| **Recommended L0** | `pnpm run dev:xbos-api:node` (= `tsc -p tsconfig.build.json` → verify-dist → `node dist/main.js`) | Default on Windows OneDrive; QA/L0 smoke |
| Watch (optional) | `pnpm run dev:xbos-api` | After `predev` ensure-dist; `nest-cli` `deleteOutDir: false` (aligned with hrm-api) |
| Recover partial dist | `pnpm --filter xbos-api run build:clean` then re-run preferred start | Spine missing after wipe |

Health probe: `GET http://127.0.0.1:28002/api/xbos` → **200** (not `/health`).

## Startup order (minimum for L0 PASS)

1. Ensure Postgres is up and `deploy/xevn-ecosystem/.env` + `apps/api/*/.env` DB vars are set.
2. **Terminal A:** `pnpm run dev:hrm-api` — turbo runs `hrm-api` `dev` script (`nest start --watch`); wait for `Nest application successfully started` on the port from `HRM_BE_PORT` (28001 for L0).
3. **Terminal B:** `pnpm run dev:xbos-api:node` (preferred) — or `pnpm run dev:xbos-api` if watch is required.
4. **Terminal C (optional):** `pnpm run dev:web-only` — for portal proxy smoke; not required for L0 exit 0.
5. From repo root: `pnpm run qc:dev-stack` → exit **0** when hrm + xbos health return **200**.

## L1 after L0

```bash
pnpm run qc:dev-stack
pnpm run test:system:uat
```

If `test:system:uat` needs seed: `pnpm run test:system:uat:seed` (see `docs/qa/SYSTEM_INTEGRATION_UAT_SCENARIO.md`).

## VPS DEV (L0 on server, not local)

When local APIs are off, point env at deploy SoT (`PORTAL_FE_PORT=8088`):

```powershell
$env:HRM_HEALTH_URL="http://14.225.217.232:8088/api/hrm"
$env:XBOS_HEALTH_URL="http://14.225.217.232:8088/api/xbos"
$env:PORTAL_DEV_URL="http://14.225.217.232:8088"
pnpm run qc:dev-stack
```

After deploy, wait for APIs or run: `pnpm run probe:stack-stability` (zero 502 on login).

## Common failures

| Symptom | Fix |
|---------|-----|
| `ECONNREFUSED :28001` | Start `dev:hrm-api` |
| `ECONNREFUSED :28002` | Prefer `pnpm run dev:xbos-api:node` (tsc → node). Avoid relying on watch alone under OneDrive/Unicode. If `dist/main.js` missing: `pnpm --filter xbos-api run build:clean` then `dev:xbos-api:node`. |
| `Cannot find module …/xbos-api/dist/main` | Same as above — watch wiped dist mid-emit (OBS-XBOS-DIST) |
| Portal `/api/hrm/*` 500 but APIs up | Portal proxy — check `apps/web/web-portal/.env.local` `VITE_DEV_PROXY_*` |
| database does not exist | Create DB or fix `DATABASE_URL_*` in deploy `.env` |

See also: `docs/ops/DEPLOY_GUIDE.md`, `docs/program/UAT_PRODUCTION_OPERATING_PLAN.md` §6.
