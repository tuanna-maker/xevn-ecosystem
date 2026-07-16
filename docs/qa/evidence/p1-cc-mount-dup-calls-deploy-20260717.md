# P1-CC-MOUNT-DUP-CALLS-DEPLOY — portal-fe :8088 recreate (2026-07-17)

| Field | Value |
|-------|-------|
| work_item_id | `P1-CC-MOUNT-DUP-CALLS-DEPLOY` |
| from_role | pm |
| to_role | devops |
| host | `14.225.217.232` (:8088 portal) |
| commit | `9a21778` — `fix(web-portal): coalesce duplicate CC mount API reads (P1-CC-MOUNT-DUP-CALLS-FE)` |
| prior FE evidence | `docs/qa/evidence/p1-cc-mount-dup-calls-fe-20260717.md` |
| seed | **none** (U65) |

## Why

FE `requestCoalescer` + wiring for 5 Command Center mount endpoint families was not live on `:8088` after `P1-HRM-EMP-DUP-KEY-DEPLOY` (BE-only `hrm-be` recreate). Portal must be synced + `portal-fe` recreated so QA can browser-verify Network call counts.

## Steps executed

1. **Allow-list commit** (local → `origin/main`) — only portal coalescer slice + FE evidence; unrelated dirty lanes left unstaged:
   - `apps/web/web-portal/src/integrations/requestCoalescer.ts` (+ test)
   - `tenantScopeApi.ts`, `kpiEngineApi.ts`, `workflowEngineApi.ts`, `portalAlertsApi.ts`
   - `workflowEngineApi.coalesce.test.ts`
   - `docs/qa/evidence/p1-cc-mount-dup-calls-fe-20260717.md`
   - Push: `e4087ea..9a21778` → `main`
2. **VPS pre-audit:**
   - `xevn-portal-fe-dev` Up 3 weeks `:8088`
   - non-xevn (`ytexa_*`, `hsbx_*`, `asms_*`, `viconnec_*`) Up — left untouched
3. **VPS sync + minimal recreate:**

```bash
cd /opt/xevn-ecosystem
git fetch origin main && git pull origin main   # POST_HEAD=9a21778
test -f apps/web/web-portal/src/integrations/requestCoalescer.ts
cd deploy/xevn-ecosystem
docker exec xevn-portal-fe-dev sh -lc 'rm -rf /app/apps/web/web-portal/node_modules/.vite /app/node_modules/.vite' || true
docker compose --env-file .env up -d --force-recreate --no-deps portal-fe
```

4. No `docker compose down`; no non-xevn stop/rm; no seed.

## Health / smoke proof

| Check | Result |
|-------|--------|
| VPS `POST_HEAD` | **9a21778** |
| Disk `requestCoalescer.ts` | present (3100 bytes, Jul 17 06:47) |
| `xevn-portal-fe-dev` recreate | **Started** `2026-07-17 06:48:12 +0700` |
| `GET http://127.0.0.1:8088/` | **200** |
| `GET http://127.0.0.1:8088/command-center` | **200** |
| External `GET http://14.225.217.232:8088/` | **200** (len 763) |
| External `GET .../command-center` | **200** |
| Served `/src/integrations/requestCoalescer.ts` | **200**, contains `coalesceGet` |
| Served `/src/integrations/tenantScopeApi.ts` | **200**, contains `coalesceGet` (x2) |
| Non-xevn containers still Up | **10** (unchanged) |

> Note: compose `portal-fe` is Vite bind-mount (`node:22-alpine`), not a hashed production SPA build. Bundle proof = container recreate timestamp + served source modules containing coalescer symbols (not Vite asset hash).

## Out of scope / residual

- **Browser Network call-count** (≤1 identical scope per mount) — **QA only**; DevOps does not claim PASS.
- Documented residual on Command Center: assignee-inbox vs alerts-feed may remain **2 distinct** `workflow-engine.tasks.list` calls (different query params) — not a defect.
- Unrelated local dirty lanes (HRM, auth, workflow resolver, etc.) **not** deployed.

## Gate table

| Gate | Verdict |
|------|---------|
| FE commit + push `9a21778` | **PASS** |
| VPS git sync + `portal-fe` `--no-deps` recreate | **PASS** |
| L0 `:8088/` 200 + coalescer source served | **PASS** |
| Browser Network ≤1 / identical scope | **DEFER → QA** |

## Handoff

- `ack_status`: **READY_FOR_QA**
- `next_owner`: **qa**
- `evidence_path`: `docs/qa/evidence/p1-cc-mount-dup-calls-deploy-20260717.md`
