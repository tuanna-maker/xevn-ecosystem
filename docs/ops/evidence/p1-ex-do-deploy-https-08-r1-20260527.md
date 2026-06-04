# P1-EX-DO-DEPLOY-HTTPS-08-R1 — Restore pilot HRM API (502 → 200)

| Field | Value |
|---|---|
| work_item_id | `P1-EX-DO-DEPLOY-HTTPS-08-R1` |
| from_role | `devops` |
| to_role | `pm` |
| date | `2026-05-27` |
| base_url | `https://14-225-217-232.nip.io` |
| prior_qa | `docs/qa/evidence/p1-ex-qa-https-01-r7-20260527.md` |
| ack_status | **PASS_TO_PM** |

---

## Executive verdict

| Gate | Result | Notes |
|---|---|---|
| L0 HRM health | **PASS** | `GET /api/hrm/` → **200** (local + HTTPS) |
| L0 HRM metrics | **PASS** | `GET /api/hrm/metrics?format=prometheus` → **200** |
| L0 XBOS (control) | **PASS** | Still **200** (unchanged) |
| nginx upstream | **PASS** | `proxy_pass http://127.0.0.1:3001` — backend listening |

**pm_dispatch_hint:** `P1-EX-QA-HTTPS-01-R8` — full L0→L2→L2.5 retest now that HRM perimeter is green.

---

## Root cause

1. **Container Up but Nest not listening** — `xevn-hrm-be-dev` published `:3001` but `curl` to `127.0.0.1:3001` returned **000** / nginx **502**.
2. **TypeScript compile failure (52 → 2 errors)** after deploy wave — missing/outdated workspace deps (`@xevn/platform-core`, redis/bullmq packages); duplicate `ioredis` types between `bullmq` and app.
3. **Production guard exit** — after compile fixed, `assertProductionEnvOrExit` blocked boot: `INTERNAL_API_KEY must not use dev default in production` with `NODE_ENV=production` (env_file layering / stale process).

XBOS unaffected (already built and listening on `28002`).

---

## Remediation (VPS — no git commit)

| Step | Action |
|---|---|
| 1 | `docker compose run --rm pnpm-install` — refresh monorepo `node_modules` volume |
| 2 | `pnpm --filter @xevn/platform-core run build` inside `xevn-hrm-be-dev` |
| 3 | `pnpm dedupe ioredis` + VPS hotfix `connection: this.connection as any` in `platform-queue.service.ts` (compile unblock) |
| 4 | Set `BULLMQ_ENABLED=false` in `deploy/xevn-ecosystem/.env` (pilot) |
| 5 | Sync `INTERNAL_API_KEY` between `deploy/xevn-ecosystem/.env` and `apps/api/hrm-api/.env` |
| 6 | `docker compose restart hrm-be` — wait ~60s for Nest boot |

**Not changed:** nginx vhost (`deploy/nginx/xevn-ecosystem-vhost.conf`) — upstream port **3001** was already correct; failure was backend down, not mis-pointed proxy.

---

## Smoke evidence

### From VPS (`127.0.0.1` + TLS Host header)

```
hrm-local:200
hrm-metrics-local:200
hrm-https:200
hrm-metrics-https:200
```

Nest log: `Nest application successfully started` + request completed `status:200` for `/api/hrm/` and metrics.

### From operator network (external HTTPS)

```
hrm-health:200
hrm-metrics:200
xbos:200
```

Commands (no secrets):

```bash
curl -sk -o /dev/null -w "%{http_code}" https://14-225-217-232.nip.io/api/hrm/
curl -sk -o /dev/null -w "%{http_code}" "https://14-225-217-232.nip.io/api/hrm/metrics?format=prometheus"
```

---

## Residual / follow-up (not blocking L0)

| Priority | Owner | Item |
|---|---|---|
| P1 | **dev-be** | Commit proper fix for `platform-queue.service.ts` ioredis typing (remove VPS `as any` shim) |
| P2 | **devops** | Add post-deploy check: `curl :3001/api/hrm/` before closing HTTPS deploy wave |
| P2 | **pm** | Ensure `apps/api/hrm-api/.env` on VPS does not override production `INTERNAL_API_KEY` with dev default on future pulls |

---

## Handoff packet

```yaml
work_item_id: P1-EX-DO-DEPLOY-HTTPS-08-R1
from_role: devops
to_role: pm
ack_status: PASS_TO_PM
entry_criteria:
  - QA R7 FAIL — all /api/hrm/* 502
exit_criteria:
  - GET /api/hrm/ → 200
  - GET /api/hrm/metrics?format=prometheus → 200
evidence_path: docs/ops/evidence/p1-ex-do-deploy-https-08-r1-20260527.md
summary: |
  HRM 502 was nginx Bad Gateway because hrm-api never bound :3001 (TS compile + prod env guard).
  Restored via pnpm install, platform-core build, env sync, container restart. L0 HRM 200 local + HTTPS.
pm_dispatch_hint: P1-EX-QA-HTTPS-01-R8
no_commit: true
```
