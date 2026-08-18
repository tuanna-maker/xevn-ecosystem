# P1-HRM-SCALE-DO-W4-REPLICA — Horizontal hrm-be replicas + LB T-CONC re-probe

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-SCALE-DO-W4-REPLICA` |
| **from_role** | `devops` |
| **to_role** | `pm` / `qc` |
| **date** | 2026-07-17 |
| **environment** | VPS Dev8088 `http://14.225.217.232:8088` |
| **LB probe target** | `http://127.0.0.1:3101/api/hrm` (nginx least_conn; run from VPS) |
| **prior** | QC RERUN2 NO-GO — ceiling **400 VU**; `COND-SCALE-W3-TIMEOUT-600` (single-process timeouts @600) |
| **adr_ref** | `docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md` §5.5 / §6 W3 |
| **u65** | zero-seed · GET-only · **no** UF promote · **not** Phase1/PROD |
| **raw_artifact** | `docs/qa/evidence/_p1-hrm-scale-do-w4-t-conc-raw-20260717.json` |
| **ack_status** | **PASS_TO_PM** (topology + staged proof present; QC re-gate required) |

---

## Purpose

Close `COND-SCALE-W3-TIMEOUT-600` by enabling ≥2 `hrm-be` replicas behind nginx `least_conn`, splitting `PG_POOL_MAX`, preferring `node dist/main`, and re-probing **400 → 600 → 800 → 1000** VU via the **LB path**.

---

## Topology applied (LIVE)

```
T-CONC / portal Vite proxy
        │
        ▼
  hrm-api-lb :3101  (nginx least_conn + keepalive; worker_connections 8192)
     ├── hrm-be   host :3001  PG_POOL_MAX=20  node dist/main (start:prod)
     └── hrm-be-2 host :3011  PG_POOL_MAX=20  node dist/main (start:prod)
```

| Control | Value |
|---------|--------|
| Compose services | `hrm-be`, `hrm-be-2`, `hrm-api-lb` (fixed `container_name` kept; scale via sibling) |
| Host ports | `3001` / `3011` / LB `3101` |
| Pool split | `HRM_BE_PG_POOL_MAX=20` ×2 → Σ **40** (same budget as DO-W3 single) |
| Rate limit | `HRM_RATE_LIMIT_MAX` / `RATE_LIMIT_MAX` = **120000**/min (unchanged) |
| Runtime | `pnpm … start:prod` → **`node dist/main`** on both replicas |
| Portal / hrm-fe proxy | `VITE_DEV_PROXY_HRM_API=http://hrm-api-lb:80` |
| Host upstream doc | `deploy/nginx/upstream-replicas.conf` (`:3001`+`:3011`) |
| LB conf | `deploy/xevn-ecosystem/nginx/hrm-api-lb.conf` + `hrm-api-lb-nginx.conf` |
| Backup | `.env.bak-do-w4-20260717234149` · `docker-compose.yml.bak-do-w4-20260717234149` |

### Nginx tune (after first WAN probe noise)

- `worker_connections 8192`, `multi_accept on`
- Upstream `keepalive 64` + `proxy_http_version 1.1` / `Connection ""`
- `ulimits.nofile` 65535 on `hrm-api-lb`

---

## Progress log

| UTC+7 | Step | Result |
|-------|------|--------|
| 23:43 | Intake | Read QC rerun2 + DO-W3 §B; compose already had replica stubs from stalled prior |
| 23:44 | VPS audit | Both replicas + LB **Up/healthy**; non-xevn undisturbed |
| 23:44 | Backup | do-w4 `.env` + compose backups present |
| 23:45 | Smoke | :3001/:3011/:3101/:8088/:28002 **200** |
| 23:45 | WAN probe (discarded) | Windows→`:3101` @400 VU aborted (~90% `status=0`) — **client/WAN path noise**; nginx access still logged **200** |
| 23:46 | LB harden | Recreate `hrm-api-lb` with keepalive + 8192 workers |
| 23:46–23:49 | **Official probe** | VPS-local `node scripts/load/hrm-t-conc-load.mjs` via `127.0.0.1:3101` — **all stages PASS** |
| 23:50 | Post-health | replicas + LB + portal + xbos **200**; `pg_pool_waiting_count=0` both; non-xevn still Up |

---

## Method (official)

| Control | Value |
|---------|-------|
| Script | `scripts/load/hrm-t-conc-load.mjs` |
| Runner | **VPS** `/usr/bin/node` v20 (not Windows WAN) |
| `HRM_API_BASE` | `http://127.0.0.1:3101/api/hrm` (**LB**) |
| `PORTAL_DEV_URL` | `http://127.0.0.1:8088` |
| Stages | **400, 600, 800, 1000** |
| Hold | **45s** / stage (task minimum; ADR ideal 5min still QC note) |
| Traffic | GET-only list `page_size=50` + summary |
| Raw | `_p1-hrm-scale-do-w4-t-conc-raw-20260717.json` |

---

## Results (LB path)

| VU | Requests | Error rate | 429 | 5xx | list p95 (ms) | summary p95 (ms) | RPS | Gates (err / list p95) |
|----|---------:|-----------:|----:|----:|--------------:|-----------------:|----:|:-----------------------|
| **400** | 16083 | **0%** | 0% | 0% | **450** | 449 | 348.5 | **PASS / PASS** |
| **600** | 21809 | **0%** | 0% | 0% | **739** | 511 | 473.6 | **PASS / PASS** (prior cliff CLOSED) |
| **800** | 26528 | **0%** | 0% | 0% | **923** | 785 | 575.5 | **PASS / PASS** |
| **1000** | 28880 | **0%** | 0% | 0% | **1481** | 1183 | 622.9 | **PASS / PASS** |

| Aggregate | Value |
|-----------|--------|
| `t_conc_met` (script) | **true** |
| `max_passing_vu` | **1000** |
| `measured_ceiling_vu` | **1000** |
| `blocked_reason` | `null` |
| `pg_pool_waiting_count` (post) | **0** / **0** |

### Before vs after

| Metric | DO-W3 (single `:3001`) | **DO-W4 (LB `:3101`, 2× replicas)** |
|--------|-------------------------|--------------------------------------|
| Max passing VU | **400** | **1000** |
| 600 VU | FAIL 14.33% timeouts | **PASS 0% err**, list p95 739 ms |
| 1000 VU | NOT REACHED | **PASS 0% err**, list p95 1481 ms |
| Bottleneck class | single Nest process | **cleared for this hold window** |

---

## Gate adjudication (devops)

| Criterion | Verdict |
|-----------|---------|
| ≥2 hrm-be + nginx least_conn live | **PASS** |
| Split `PG_POOL_MAX` (20+20) | **PASS** |
| Prefer `node dist/main` | **PASS** |
| Probe via LB path | **PASS** (VPS→`:3101`) |
| Staged 400→1000, hold ≥45s | **PASS** |
| Error &lt;1% @1000 + list p95 &lt;2s | **PASS** on this evidence |
| Summary p95 &lt;1s @1000 (`T-P95-SUM`) | **MISS** — 1183 ms (QC residual note) |
| Hold = ADR 5min ideal | **NOT** — 45s holds (same class as DO-W3); QC may require longer hold |
| Claim UF / Phase1 / PROD | **NO** |
| Non-xevn undisturbed | **PASS** (ytexa/hsbx/asms/viconnec Up) |
| `COND-SCALE-W3-TIMEOUT-600` | **CLOSED** on this NFR probe (subject to QC re-gate) |

---

## Residuals for QC / PM

| ID | Sev | Notes |
|----|-----|-------|
| `P1-HRM-SCALE-QC-W3-RERUN3` | P0 gate | Re-gate T-CONC using this raw JSON + topology |
| Hold-duration gap | P2 NFR | ADR §5.5 cites 5min; this wave used **45s** (task + prior DO-W3 parity) |
| `T-P95-SUM` @1000 | P2 | summary p95 **1183 ms** &gt; 1s target while list gate still PASS |
| WAN probe path | P3 | Windows→public `:3101` not used as official evidence (client noise); capacity SoT = VPS-local LB |

---

## Handoff packet

- **completion_report:** Enabled **2× hrm-be** (`node dist/main`, `PG_POOL_MAX=20` each) behind **`hrm-api-lb` least_conn `:3101`**. Backups do-w4 present; non-xevn undisturbed. Official VPS-local LB probe **400/600/800/1000 all PASS** (0% error; list p95 1481 ms @1000). Prior 600-VU timeout cliff **cleared**. Script `t_conc_met=true`, `max_passing_vu=1000`. **Not** UF/Phase1/PROD. Summary p95 @1000 and 45s-vs-5min hold noted for QC.
- **next_owner:** `qc`
- **evidence_path:** `docs/qa/evidence/p1-hrm-scale-do-w4-20260717.md` + `_p1-hrm-scale-do-w4-t-conc-raw-20260717.json`
- **ack_status:** **PASS_TO_PM**

### next_dispatch_prompt

```text
work_item_id: P1-HRM-SCALE-QC-W3-RERUN3
from_role: pm
to_role: qc
subagent_type: qc
entry_criteria: DO-W4 PASS_TO_PM — 2× hrm-be + nginx least_conn :3101 live; PG_POOL_MAX 20+20; node dist/main; T-CONC LB raw JSON present
read_first:
  - docs/qa/evidence/p1-hrm-scale-do-w4-20260717.md
  - docs/qa/evidence/_p1-hrm-scale-do-w4-t-conc-raw-20260717.json
  - docs/qa/evidence/qc-p1-hrm-scale-w3-rerun2-20260717.md
  - docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md §5.5 T-CONC / §6 W3
exit_criteria: Re-gate T-CONC — adjudicate 1000 VU proof (0% err, list p95 1481ms, 45s holds via LB); close or condition COND-SCALE-W3-TIMEOUT-600; note T-P95-SUM 1183ms@1000 and 45s vs ADR 5min; update ADR §6 W3; NOT Phase1/PROD; no UF promote; evidence qc-p1-hrm-scale-w3-rerun3-20260717.md
cấm: claim PROD/Phase1; promote UF from NFR probe; seed; ignore hold-duration caveat without statement
```
