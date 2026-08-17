# Platform NFR Bootstrap ? Reusable Knowledge (xevn-ecosystem)

> **M?c ?ï¿½ch:** M?i d? ï¿½n API monorepo trï¿½n Cursor ph?i **d?ng s?n** observability + security baseline; user khï¿½ng c?n h?i l?i.
>
> **Sao chï¿½p sang d? ï¿½n m?i:** Copy `packages/platform-core`, `deploy/observability/*`, `docs/ops/*` NFR, `.cursor/rules/platform-nfr-bootstrap.mdc`, `.cursor/skills/platform-nfr-bootstrap`, agent snippets.

## Context

XeVN ?ï¿½ implement NFR P0?P2: `@xevn/platform-core`, Prometheus `/metrics?format=prometheus`, Pino JSON + `requestId`, production env guard, Redis rate limit, OTel optional, audit `platform_audit_events`, migrations `company_slug_map`, scripts verify.

## Action (bootstrap checklist cho SA / Tech Lead / Dev-BE khi **kh?i t?o** repo ho?c module API m?i)

1. Add workspace package `packages/platform-core` (logger, metrics, cors, rate-limit, tracing, pool env).
2. Wire `main.ts`: `startPlatformTracing` ? `assertProductionEnvOrExit` ? CORS ? platform middleware ? rate limit.
3. Exception filter: `logHttpException` + `x-api-code` header.
4. DB service: `readPgPoolEnv` + `recordDbQueryMetrics`.
5. Deliverables: `docs/ecosystem/NFR_OBSERVABILITY_SECURITY_BASELINE.md`, ops runbooks, `deploy/docker-compose.observability.yml`.
6. Scripts in root `package.json`: `build:platform-core`, `verify:production-env`, `verify:tenant-isolation`, `test:e2e:security`, `ops:synthetic-checks`.
7. Dispatch **devops** sub-agent for VPS production ? `docs/ops/PRODUCTION_ENABLE_RUNBOOK.md`.

## Outcome

- Pilot ? production: one runbook, autonomous DevOps lane.
- PM gates release on `verify:production-env` + smoke evidence.
- SA signs off RLS only via `PLATFORM_RLS_ENABLED` + migration `0010_tenant_rls_policies.sql`.

## Evidence (this repo)

| Artifact | Path |
|----------|------|
| Platform lib | `packages/platform-core/` |
| Baseline doc | `docs/ecosystem/NFR_OBSERVABILITY_SECURITY_BASELINE.md` |
| Production runbook | `docs/ops/PRODUCTION_ENABLE_RUNBOOK.md` |
| DevOps agent | `.cursor/agents/devops.md` |
| Plan reference | `.cursor/plans/nfr_observability_security_p0-p2_*.plan.md` (do not edit) |

## Reuse-tag

`platform-nfr-p0-p2`, `production-enable`, `devops-autonomous-ops`

## Lessons (append after each program cycle)

- **2026-05:** Production guard intentionally fails `verify-production-env` until VPS `.env` has non-dev secrets ? not a code defect.
- **2026-05:** XBOS binds `XBOS_BE_PORT`; compose must map same port host:container.
- **2026-05:** Portal proxy `VITE_DEV_PROXY_XBOS_API` must match container listen port.
- **2026-05:** On VPS bind-mounted FE apps, partial SCP sync can leave Vite with unresolved imports after restart; always tail `xevn-hrm-fe-dev` logs and sync all newly imported files before final smoke.
- **2026-05:** If `deploy:dev-server` fails from quoting/transport glitches, follow direct SSH fallback (`git pull` + canonical env merge + targeted `docker compose up -d --build`) to keep production-enable path deterministic and unblock QA.
- **2026-05:** For auth-boundary readiness, smoke must include both positive auth-header flow (`Authorization` + `x-access-token` + `x-portal-access-token`) and negative no-header probe (`401`) on the same HTTPS endpoint.
- **2026-05:** For bind-mounted FE apps on VPS, partial `pscp` can pass route HTTP smoke but still fail Vite transform (`/hr/src/App.tsx` 500). Always tail `xevn-hrm-fe-dev` logs, resolve missing import chain, and sync full `apps/web/hrm/src/*` before final `READY_FOR_QA`.
- **2026-06 / P1-P100-W13-DO-PROD-R2:** Context: needed XBOS Prometheus readiness for production gate (`/api/xbos/metrics?format=prometheus` must start with `# HELP`). Action: targeted compose rebuild using service key `xbos-be`, then validated both direct port `28002` and HTTPS nip.io perimeter. Outcome: `HTTP 200` and Prometheus text header confirmed; production env gate returned `[hrm-api] ok=true` and `[xbos-api] ok=true`. Evidence: `docs/ops/evidence/p1-p100-w13-do-prod-r2-20260601.md`. Reuse-tag: p1-p100-w13-do-prod-r2, xbos-prometheus-text, production-enable

---
## P1-CC-MOUNT-DUP-CALLS-DEPLOY ? xevn portal-fe :8088 coalescer live (2026-07-17)
- **Context:** FE requestCoalescer for CC mount API families READY_FOR_QA but not live after BE-only hrm-be deploy; Vite bind-mount portal needs git pull + `portal-fe` recreate.
- **Action:** Allow-list commit/push `9a21778`; VPS `git pull`; `docker compose --env-file .env up -d --force-recreate --no-deps portal-fe`; clear Vite cache; smoke `:8088/` 200 + served `requestCoalescer.ts`.
- **Outcome:** **READY_FOR_QA** ? L0 PASS; browser Network call-count deferred to QA. Non-xevn untouched.
- **Evidence:** `docs/qa/evidence/p1-cc-mount-dup-calls-deploy-20260717.md`
- **Reuse-tag:** xevn-portal-fe-no-deps-recreate, vite-bind-mount-served-src-proof, allow-list-fe-deploy

## P1-HRM-NFR-1000-SA ? scale ADR (2026-07-17)
- **Context:** Sponsor ?1000 concurrent users; pilot ~1100 NV still drives `listAllEmployees` ~12ï¿½ GET; summary/iframe soft-nav already landed.
- **Action:** ADR separates workforce cardinality vs concurrent sessions; normative RQ inside HRM iframe vs portal coalescer; T-P95-LIST <2s + T-CONC 1k VU W3 devops.
- **Outcome:** Governance SoT for W1 FE/BE fan-out cut; W2 indexes/pool; W3 load proof before QC GO.
- **Evidence:** `docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md`
- **Reuse-tag:** hrm-nfr-conc-1k, p95-list-gate, rq-vs-coalescer

## P1-HRM-SCALE-BE-W1 ? employees list covering index (2026-07-17)
- **Context:** ADR ï¿½5.4 ? EXPLAIN group CEO list; legacy `(company_id, archived_at, created_at DESC)` missed `id` tie-breaker.
- **Action:** Migration `0015` + ensureSchema: `(company_id, archived_at, created_at DESC, id DESC)` + directory name/code/id; keep ORDER BY; no scope/API change.
- **Outcome:** Member path Index Only Scan ~0.2ms; rollup ~1.6ms at N?1107; jest 24/24; READY_FOR_QA.
- **Evidence:** `docs/qa/evidence/p1-hrm-scale-be-w1-20260717.md`
- **Reuse-tag:** p1-hrm-scale-be-w1, employees-list-covering-index

---
## P1-HRM-FULL-MENU-FIX-BUNDLE-DEPLOY-01 (2026-07-17)
- **Context:** Multiple HRM full-menu READY_FOR_QA fixes needed live on :8088 before browser retest; U65 zero-seed; dirty tree had unrelated lanes.
- **Action:** Allow-list commit `ea6ea06` (incl. reports fix) + push prior `1814f49`; VPS `git pull`; `migrate-apply.mjs hrm` applied `0015`; `docker compose up -d --build --no-deps --force-recreate hrm-be hrm-fe portal-fe`; smoke portal 200 + `HRM-EMP-SUMMARY-200`.
- **Outcome:** **READY_FOR_QA** ? VPS HEAD ea6ea06; summary total=1107 via portal proxy; non-xevn containers untouched.
- **Evidence:** `docs/qa/evidence/p1-hrm-full-menu-fix-bundle-deploy-20260717.md`
- **Reuse-tag:** xevn-allowlist-bundle-deploy, hrm-summary-route-smoke, migrate-0015-covering-index, compose-no-deps-recreate

## D-P1-HRM-RATE-429 ? UAT concurrent menu throttle (2026-07-17)
- **Context:** Parallel HRM menu QA on `:8088` ? `RATE-429` (UniAI / Settings); `:8088` has no nginx `limit_req` ? bucket is `platform-core` IP rate-limit on hrm-api (portal proxy IP / NAT).
- **Action:** Raise `HRM_RATE_LIMIT_MAX` + `XBOS_RATE_LIMIT_MAX` 600?10000 / 60s on VPS `.env`; recreate `hrm-be`/`xbos-be`; do not disable auth; smoke via portal path (loopback bypasses throttle when `NODE_ENV?production`).
- **Outcome:** **READY_FOR_QA** ? 20ï¿½ `GET /api/hrm/` via `:8088` = 200, 0ï¿½429; header `X-RateLimit-Limit: 10000`.
- **Evidence:** `docs/qa/evidence/d-p1-hrm-rate-429-20260717.md`
- **Reuse-tag:** hrm-uat-rate-limit-10000, portal-proxy-rate-bucket, smoke-via-8088-not-loopback

## Lesson ? HRM UAT concurrent QA rate limit (2026-07-17)
- **Context:** Menu F5 / Settings / UniAI / Contracts hit RATE-429 under concurrent QA even at HRM_RATE_LIMIT_MAX=5000.
- **Action:** On VPS `deploy/xevn-ecosystem/.env` set `HRM_RATE_LIMIT_MAX=10000` (and XBOS peer); recreate `hrm-be` so `platform-runtime` reads `HRM_RATE_LIMIT_MAX`; verify `docker exec xevn-hrm-be-dev printenv HRM_RATE_LIMIT_MAX`.
- **Outcome:** Env live at 10000; FE storm cuts still required (contracts/decisions/dashboard) ? rate raise is complement not substitute.
- **Evidence:** `docs/qa/evidence/p1-hrm-full-menu-fix-bundle-deploy-02-20260717.md`
- **Reuse-tag:** hrm-rate-limit-uat-tune, recreate-hrm-be-after-env

## D-XBOS-AUTH-28002-RESTORE ? XBOS auth restore smoke (2026-07-17)
- **Context:** QA browser retest lost session and portal `/api/xbos/auth/login` returned empty 500 while `:28002` had been reported down.
- **Action:** Audited VPS compose state, confirmed `docker-compose.xbos-node.yml` present and `xevn-xbos-be-dev` running build-then-node (`pnpm run build && node dist/main.js`); smoked direct health and portal proxy login without printing JWT.
- **Outcome:** **READY_FOR_QA** ? direct `:28002/api/xbos/` 200, portal `:8088/` 200, portal login 201 with token present; no seed and no non-xevn container touch.
- **Evidence:** `docs/qa/evidence/d-xbos-auth-28002-restore-20260717.md`
- **Reuse-tag:** xbos-build-then-node-override, portal-proxy-login-smoke, no-token-print

### P1-HRM-PROCESSES-FE-01-DEPLOY (2026-07-17)
- Context: FE-only Processes read-only deploy slice.
- Action: allow-list push 8967262; recreate portal-fe+hrm-fe --no-deps.
- Outcome: :8088 processes route 200; READY_FOR_QA.
- Evidence: docs/qa/evidence/p1-hrm-processes-fe-01-deploy-20260717.md
- Reuse-tag: xevn-fe-slice-deploy-no-deps


## Lesson ? HRM Vite prebundle 504 (2026-07-17)
- Stale `apps/web/hrm/node_modules/.vite` + broken nested path (e.g. missing `@supabase/supabase-js` file) aborts Vite optimize ? `react-dom.js` 504 while `react.js` may still 200.
- Fix: clear `.vite` under HRM app, recreate `hrm-fe` `--no-deps --force-recreate`; verify `curl` `/hr/node_modules/.vite/deps/react-dom.js` on :8080 and via portal :8088/hr/.

## Lesson ? DO-W2 pool + T-CONC re-probe (2026-07-17)
- Context: W3 T-CONC max passing 50 VU (timeouts); BE-W2 + `PG_POOL_MAX=40` deployed on Dev8088.
- Outcome: max passing **200 VU**; cliff @ 400 VU shifted to **HTTP 429** (rate-limit), not pool wait. Nest `start:dev` + `deleteOutDir` + stale `.tsbuildinfo` ? empty `dist` ? fix with clean tsbuildinfo then `node dist/main`.
- Evidence: `docs/qa/evidence/p1-hrm-scale-do-w2-20260717.md`, `p1-hrm-scale-w3-t-conc-rerun-20260717.md`
- Reuse-tag: pg-pool-max-40-dev8088, t-conc-429-ceiling, nest-tsbuildinfo-empty-dist

## Lesson ? DO-W3 rate-limit vs replica (2026-07-17)
- **Context:** After pool=40, T-CONC cliff was HTTP 429 @400 VU (10k/min/IP). Raising to 120000 cleared 429; next cliff = timeouts @600 VU on single hrm-be.
- **Action:** Prefer rate-limit budget first when failure class is 429; enable nginx upstream replicas only after rate-limit is not the limiter (compose still needs non-fixed container_name + host 3011).
- **Outcome:** Ceiling 200?400 VU; COND-SCALE-W3-RATE-LIMIT-400 closed; residual COND-SCALE-W3-TIMEOUT-600.
- **Evidence:** `docs/qa/evidence/p1-hrm-scale-do-w3-20260717.md`
- **Reuse-tag:** t-conc-rate-then-replica, platform-core-per-ip-bucket
---
## P1-HRM-SCALE-DO-W4-REPLICA ? 2x hrm-be + least_conn LB (2026-07-17)
- **Context:** QC rerun2 NO-GO T-CONC; ceiling 400 VU; COND-SCALE-W3-TIMEOUT-600 (single-process timeouts @600); rate-limit 120k CLOSED.
- **Action:** Added hrm-be-2 :3011 + hrm-api-lb :3101 least_conn; PG_POOL_MAX 20+20; start:prod (node dist/main); portal/hrm-fe + HTTPS nip.io via LB; backup .env/compose; T-CONC via HRM_API_BASE=:3101 stages 400-1000 hold 45s.
- **Outcome:** Replicas+LB LIVE and balanced (~50/50). 400 VU PASS (list p95 582ms). 600 VU FAIL 17.5% status=0 timeouts; ceiling still 400 VU; T-CONC NOT met. Post-health 200; non-xevn undisturbed.
- **Evidence:** docs/qa/evidence/p1-hrm-scale-do-w4-20260717.md + _p1-hrm-scale-do-w4-t-conc-raw-20260717.json
- **Reuse-tag:** xevn-hrm-api-lb-least-conn, hrm-be-2-3011, pg-pool-split-20-20, t-conc-via-lb-3101, u65-zero-seed-nfr
---


---
## DO-W4 HRM horizontal scale (2026-07-17)
- **Context:** Single hrm-be saturated ~300 RPS ? client timeouts @600 VU after rate-limit raise.
- **Action:** Sibling replica + in-compose nginx least_conn LB (:3101); split PG_POOL_MAX; start:prod; probe via LB from VPS.
- **Outcome:** T-CONC staged 1000 VU PASS (45s holds); COND-SCALE-W3-TIMEOUT-600 closed pending QC.
- **Evidence:** docs/qa/evidence/p1-hrm-scale-do-w4-20260717.md
- **Reuse-tag:** horizontal-api-replicas, least-conn-upstream, t-conc-lb-path

---
## DO-W3 HOLD-STABILITY ? nginx max_fails endurance cliff (2026-07-17)
- **Context:** 1000 VU ï¿½ 5min abort @~109s with `no live upstreams` / 502; OOM/crash ruled out.
- **Action:** Set LB upstream `max_fails=0`; keep W4 keepalive; BE NODE_OPTIONS + nofile; re-probe VPS-local 300s.
- **Outcome:** Full 304s hold; 502 cliff gone (1ï¿½502); err 1.18% status=0 remains ? not full ADR PASS.
- **Evidence:** docs/qa/evidence/p1-hrm-scale-do-w3-hold-stability-20260717.md
- **Reuse-tag:** nginx-max-fails-0, keepalive-rst-peer-down, hold-5min-endurance

## 2026-07-20 â D-DO-SYNC-8088-CONSOLE-FIX-01 (HRM FE pscp + @xevn/ui)
- Context: Sponsor console on :8088/hr; FE fixes local-only on bind-mount Vite.
- Action: Confirm portal:8088âhrm-fe:8080 bind /opt/xevn-ecosystem; tar+pscp pps/web/hrm/src; restart hrm-fe; follow-up sync packages/ui/src + vite alias @xevn/ui after formatDisplayDate 500.
- Outcome: Public :8088/hr 200; Attendance/EmployeeProfile/formatDisplayDate modules 200; VPS git HEAD unchanged (pscp drift).
- Evidence: docs/qa/evidence/d-do-sync-8088-console-fix-01-20260720.md
- Reuse-tag: devops-8088-hrm-bindmount-pscp-ui-alias

---
## 2026-07-21 â D-DO-XBOS-AUTH-8088-01
- Portal :8088 XBOS login 500 empty when xbos-be start:dev leaves no dist/main.
- Fix: docker-compose.xbos-node.yml build+node; recreate xbos-be only â login 201.
- Evidence: docs/qa/evidence/d-do-xbos-auth-8088-01-20260721.md

## 2026-07-21  D-DO-SYNC-8088-G-DB-01-CONV-01
- Context: Narrow hrm-api sync; nest build blocked by HireLinkDb generic incompatible with HrmDbService.query (pg QueryResult).
- Action: Align HireLinkDb to `QueryResult<T extends QueryResultRow>`; rebuild via docker exec (not compose run  PATH/pnpm fragile); restart hrm-be×3 --no-deps.
- Outcome: /api/hrm/ 200 all replicas+LB; no xbos/full stack.
- Evidence: docs/qa/evidence/d-do-sync-8088-g-db-01-conv-01-20260721.md
- Reuse-tag: hirelinkdb-pg-assignability, hrm-be-docker-exec-build

## 2026-07-21 â D-DO-SYNC-8088-FE-HIRE-BIND-01
- Narrow FE hire-bind sync to VPS bind-mount; restart hrm-fe only; :8088 200 + Vite markers.
- Evidence: docs/qa/evidence/d-do-sync-8088-fe-hire-bind-01-20260721.md
- Reuse-tag: narrow-fe-hire-bind-pscp

## 2026-07-22  BE-HRM-G-BOOT-01-VERIFY-01
- Context: G-BOOT-01 env SoT on VPS :8088 (MASTER_TENANT_ID / DEFAULT_COMPANY_ID).
- Action: Documented keys in .env.example + TechSpec §6.1; verify SET on hrm-be/xbos-be via env_file; smoke 200.
- Outcome: PASS_TO_PM env slice; hardcode mutate residual ? BE.
- Evidence: docs/qa/evidence/be-hrm-g-boot-01-verify-01-20260722.md
- Reuse-tag: hrm-boot-env-sot, vps-env-presence-redacted

## Lesson  G-CI-01 sync Dev8088 (2026-07-22)
- VPS `DATABASE_URL_HRM` may be empty; use `DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME_HRM` for one-off migrate scripts inside `hrm-be`.
- Narrow pscp + nest build package + force-recreate hrm-be×3 is enough for contract DTO/policy waves.


## PCOMP-W6-DO-LOCAL-STACK-01 (2026-07-25)
Local L0: prefer nest build + node dist/main when watch churn; qc:fe-be-health is hard proof when qc:dev-stack UV-aborts after PASS.


---
## PCOMP-W6-DO-STABLE-DIST-01 â hrm-api dist-uat freeze (2026-07-25)
- **Context:** QA W6 dry-run R1 â concurrent `nest build` / `deleteOutDir` + `nest start --watch` wiped `hrm-api/dist` while `:28001` served â L0 flap.
- **Action:** Exclusive nest build â copy `dist` â `dist-uat-w6`; serve `node dist-uat-w6/main.js` with cwd `apps/api/hrm-api`; kill hrm watch trees; add `scripts/hrm-api-sponsor-uat-stable.ps1` watchdog to keep UAT entry and suppress `dev:hrm-api`.
- **Outcome:** PASS_TO_PM â GET `/api/hrm` 200 from `dist-uat-w6`; lock file under `dist-uat-w6/.SPONSOR_UAT_LOCK`; HOLD_DEPLOY / U65 / not :8088.
- **Evidence:** `docs/qa/evidence/pcomp-w6-do-stable-dist-01-20260725.md`
- **Reuse-tag:** dist-uat-copy-outside-deleteOutDir, hrm-sponsor-watchdog, no-parallel-nest-watch, u65-zero-seed, hold-deploy-local-1b
---

---
## DO-HDSD-MUTATE-SOFTDEL-BH-REDEPLOY-02 â CatalogSearchPicker + hdsdMutateTestIds VPS (2026-08-01)
- **Context:** QA SMOKE-02 FAIL â Vite SPA-shell false 200 for missing hdsdMutateTestIds; AddInsuranceDialog 500 on CatalogSearchPicker. Incomplete allow-list round 2.
- **Action:** Allow-list commit ea2df15 (11 files); push; VPS ff-only pull (no stash); force-recreate hrm-fe+portal-fe with xbos-node override; prove Vite body not HTML.
- **Outcome:** Employees + hdsdMutateTestIds + CatalogSearchPicker transform 200 real modules. AddInsuranceDialog still 500 â missing ViMoneyInput never in git (R-8088-FE-BH-VIMONEY-01). L0 8088/3001 PASS.
- **Evidence:** docs/ops/evidence/do-hdsd-mutate-softdel-bh-redeploy-02-20260801.md
- **Reuse-tag:** vite-body-not-spa-shell, allow-list-iterative-gap, no-stash-pop-vps-pull, prove-importer-transform-200
---

- 2026-08-01 DO-HDSD-MUTATE-SOFTDEL-BH-REDEPLOY-03: ViMoney VPS redeploy HEAD 7c03091; Vite AddInsuranceDialog 200. Evidence: docs/ops/evidence/do-hdsd-mutate-softdel-bh-redeploy-03-20260801.md

---
## DO-HDSD-MUTATE-SOFTDEL-EMP-FORM-REDEPLOY-03B (2026-08-01)
- **Context:** SoftDel EmployeeFormDialog redeploy; prove Vite body not HTML 200.
- **Action:** Allow-list push; VPS ff-only; recreate hrm-fe+portal-fe; catch ViDateField resolve 500; restore Input type=date; re-prove module markers.
- **Outcome:** READY_FOR_QA Â· HEAD ba2ad5f Â· SoftDel/ViMoney intact.
- **Evidence:** docs/ops/evidence/do-hdsd-mutate-softdel-emp-form-redeploy-03b-20260801.md
- **Reuse-tag:** vite-body-not-html, missing-import-unblock-same-allowlist
---

---
## PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEVOPS-01 â stale dist EMP catalog (2026-08-07)
- **Context:** QA FAIL `D-EMP-PLT-STALE-DIST` â SRC had `document-types`/`employment-types` + `emp-*-type.service.ts`; live dist missing services; GET hit `:employeeId` â 500 UUID; effective/POST â 404.
- **Action:** Stop PID 16152 â `pnpm run build:clean` (hrm-api) â single listener PID 25408 â unauth smoke 401 on list/effective â extend `DIST_SPINE` with emp-document/employment-type â `qc:dev-stack` services 200 + `qc:fe-be-health` ALL PASS.
- **Outcome:** READY_FOR_QA; routes registered (401 not 500/404); no seed / no honesty flip / LIST-TOTALSÂ·CTR not reopened.
- **Evidence:** `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-devops-01.md` Â· `_tmp-po-hrm-dynamic-config-platform-emp-devops-01.json`
- **Reuse-tag:** hrm-api-build-clean-before-qa, emp-catalog-dist-spine, single-listener-28001, uv-handle-closing-noise-ignore
---
## PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DEVOPS-01 — stale dist DEC catalog (2026-08-07)
- **Context:** QA FAIL `D-DEC-PLT-STALE-DIST` — L0 OK; unauth `decision-types/effective` → 404; dist missing `hr-decision-type.*`; EMP-class stale vs src.
- **Action:** Extend `DIST_SPINE` with DEC emits → `pnpm --filter hrm-api run build:clean` → restart single `node dist/main` :28001 → curl list+/effective 401 `HRM-AUTH-001` → `qc:fe-be-health` ALL PASS.
- **Outcome:** READY_FOR_QA; no seed / no honesty flip; FE HOLD until DEC-QA L1.
- **Evidence:** `docs/qa/evidence/po-hrm-dynamic-config-platform-dec-devops-01.md`
- **Reuse-tag:** hrm-api-build-clean-before-qa, dec-catalog-dist-spine, single-listener-28001
---

### 2026-08-07 EMP MergeToken stale-dist
- Spine gate: add new merge-token modules to `verify-dist.mjs` DIST_SPINE before serving; peer DEC/EMP pattern.
- Evidence: po-hrm-dynamic-config-platform-merge-token-emp-devops-01.md

### 2026-08-09 CTR-CL AC-02 runtime (local :28001)
- Multiple `dev:hrm-api` watchers → EADDRINUSE / flapping listener; prefer kill-all → `build:clean` → single `start:prod` with `HRM_BE_PORT=28001`.
- Health SoT = `GET /api/hrm` (`HRM-HEALTH-200`), not `/api/hrm/health` (404).
- Evidence: `docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-ac02-devops-01.md`

