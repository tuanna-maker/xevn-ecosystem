# P1-HRM-SCALE-DO-W3-REPLICA — Rate-limit budget + T-CONC re-probe (Dev8088)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-SCALE-DO-W3-REPLICA` |
| **from_role** | `devops` |
| **to_role** | `pm` / `qc` |
| **date** | 2026-07-17 |
| **environment** | VPS Dev8088 `http://14.225.217.232:8088` · HRM API direct `http://14.225.217.232:3001/api/hrm` |
| **prior** | QC NO-GO W3 re-run — ceiling **200 VU**; cliff **HTTP 429** @ 400 VU (`COND-SCALE-W3-RATE-LIMIT-400`) |
| **adr_ref** | `docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md` §5.5 T-CONC · §6 W3 |
| **u65** | zero-seed · GET-only load · **no** UF promote · **not** Phase1/PROD |
| **ack_status** | **PASS_TO_PM** (remediation applied + ceiling documented; **T-CONC NOT met**) |

---

## Purpose

Move the measured **429 rate-limit cliff** above the ADR concurrency path and re-probe staged **400 → 600 → 800 → 1000** VU. Document whether T-CONC reaches 1000 or the new ceiling + bottleneck class.

---

## Changes applied (documented)

### A) Rate-limit budget (primary — matches measured 429 class)

| Control | Before (DO-W2 era) | After (DO-W3) |
|---------|-------------------|---------------|
| `HRM_RATE_LIMIT_MAX` | **10000** / 60s | **120000** / 60s |
| `XBOS_RATE_LIMIT_MAX` | 10000 | **120000** |
| `RATE_LIMIT_MAX` | unset | **120000** (platform-core middleware prefers this over opts.max) |
| Window | 60000 ms | unchanged |
| Backup | — | `deploy/xevn-ecosystem/.env.bak-do-w3-20260717224533` |
| Recreate | — | `docker compose --env-file .env up -d --no-deps --force-recreate hrm-be` |

**Rationale:** At 400 VU the prior re-run held ~289 RPS ≈ **17.3k req/min** from a **single probe IP** (per-IP memory bucket in `@xevn/platform-core`). Budget 10k/min ⇒ 429. Target 1000 VU ≈ 0.7–1.0 rps/VU ⇒ up to ~60k/min; **120k** provides headroom for UAT load windows only (not a prod claim).

Verified in container: `HRM_RATE_LIMIT_MAX=120000`, `RATE_LIMIT_MAX=120000`, `PG_POOL_MAX=40`, `NODE_ENV=development`.

### B) Horizontal replicas (≥2 hrm-be) — **not activated this wave**

| Constraint | Detail |
|------------|--------|
| Compose | `hrm-be` uses fixed `container_name: xevn-hrm-be-dev` + host publish `${HRM_BE_PORT}:3001` — blocks `compose scale` |
| Probe path | T-CONC uses **direct `:3001`** — bypasses nginx `deploy/nginx/upstream-replicas.conf` (3011 backup unused) |
| Portal DNS | Vite proxy `http://hrm-be:3001` resolves to **one** service DNS A record |

**Decision:** AND/OR satisfied via **rate-limit raise** (correct for prior 429 class). Replica enablement is the **next** remediation now that failure class shifted (see below).

**Shared pool budget note (when replicas land):** keep **Σ `PG_POOL_MAX` ≤ Postgres headroom** (today single instance **40**). Suggested start: 2× `PG_POOL_MAX=20` or raise DB `max_connections` first, then 2×20–25.

---

## Method (re-probe)

| Control | Value |
|---------|-------|
| Script | `scripts/load/hrm-t-conc-load.mjs` |
| Stages | **400, 600, 800, 1000** |
| Hold | **45s** / stage |
| Think | 1s |
| Traffic | GET-only list `page_size=50` + summary |
| Raw | `docs/qa/evidence/_p1-hrm-scale-do-w3-t-conc-raw-20260717.json` |

```powershell
$env:PORTAL_DEV_URL="http://14.225.217.232:8088"
$env:HRM_API_BASE="http://14.225.217.232:3001/api/hrm"
$env:T_CONC_STAGES="400,600,800,1000"
$env:T_CONC_STAGE_HOLD_MS="45000"
node scripts/load/hrm-t-conc-load.mjs
```

Login OK · Pre-health PASS.

---

## Results

| VU | Requests | Error rate | 429 rate | 5xx rate | list p95 (ms) | summary p95 (ms) | RPS | Gates (err / p95) | Notes |
|----|---------:|-----------:|---------:|---------:|--------------:|-----------------:|----:|:------------------|-------|
| **400** | 13693 | **0.00%** | **0%** | 0% | **944** | 853 | 296.3 | **PASS / PASS** | Prior cliff cleared |
| **600** | 8703 | **14.33%** | **0%** | 0% | **2247** | 2045 | 307.0 | **FAIL / FAIL** | `status=0` timeouts (1247); aborted |
| 800 | — | — | — | — | — | — | — | not run | aborted after 600 |
| 1000 | — | — | — | — | — | — | — | not run | aborted after 600 |

**`pg_pool_waiting_count`:** idle / post-test = **0** (Prometheus). Mid-stage sample not instrumented in load script; failures at 600 were **client timeouts (`status=0`)**, not HTTP 429/5xx — consistent with single Nest process saturation / request queueing under ~300+ RPS concurrent handlers rather than the prior rate-limit bucket.

### Before vs after

| Metric | W3 baseline | DO-W2 re-run | **DO-W3 (this)** |
|--------|-------------|--------------|------------------|
| Max passing VU (both ADR gates) | **50** | **200** | **400** |
| Cliff class | timeouts | **HTTP 429** @ 400 | **timeouts (`status=0`)** @ 600 |
| 429 @ 400 VU | n/a | 8.93% | **0%** |
| T-CONC 1000 | NOT | NOT | **NOT** |

---

## Gate adjudication

| Criterion | Verdict |
|-----------|---------|
| COND-SCALE-W3-RATE-LIMIT-400 closed (429 no longer blocks 400) | **YES** — 400 VU 0% 429, gates PASS |
| T-CONC ≥1000 VU, err &lt;1%, list p95 &lt;2s | **FAIL** — ramp stopped at 600 |
| Max passing VU | **400** |
| Claim T-CONC PASS | **NO** |
| Post-test health hrm/xbos/portal | **200** |
| Non-xevn undisturbed | **PASS** (ytexa/hsbx/asms/viconnec still Up) |

---

## Residual / exact next remediation

| ID | Sev | Bottleneck class | Exact next step |
|----|-----|------------------|-----------------|
| `COND-SCALE-W3-TIMEOUT-600` | P0 NFR | Single `hrm-be` capacity — client **timeouts** @ 600 VU (0% 429) | **Enable ≥2 hrm-be replicas**: remove/relax fixed `container_name`; add `hrm-be-2` on host **3011** (or compose scale); wire `deploy/nginx/upstream-replicas.conf` least_conn; split `PG_POOL_MAX` (e.g. 20+20); re-point T-CONC `HRM_API_BASE` through LB or dual-publish; re-probe 600→1000 |
| Optional | P1 | Nest `start:dev` overhead under load | Prefer `node dist/main` for load windows (same class as DO-W2 xbos restore) |
| BE-W3 cursor | deferred | Only if list p95 still fails **after** replicas + pool split | ADR Option C |

---

## Handoff packet

- **completion_report:** Raised rate-limit to **120000**/min (backed up `.env`); recreated `hrm-be` `--no-deps`. Re-probe: **400 VU PASS** (0% 429, list p95 944ms); **600 VU FAIL** on timeouts; **max passing 400 VU** (was 200). Replicas not activated (compose/port constraints). **T-CONC 1000 NOT met.** Stack healthy post-test.
- **next_owner:** `qc`
- **evidence_path:** this file + `_p1-hrm-scale-do-w3-t-conc-raw-20260717.json`
- **ack_status:** **PASS_TO_PM**

### next_dispatch_prompt

```text
work_item_id: P1-HRM-SCALE-QC-W3-RERUN2
from_role: pm
to_role: qc
subagent_type: qc
entry_criteria: DO-W3 PASS_TO_PM — HRM_RATE_LIMIT_MAX/RATE_LIMIT_MAX=120000 on Dev8088; T-CONC re-probe raw JSON present; COND-SCALE-W3-RATE-LIMIT-400 closed at 400 VU
read_first:
  - docs/qa/evidence/p1-hrm-scale-do-w3-20260717.md
  - docs/qa/evidence/_p1-hrm-scale-do-w3-t-conc-raw-20260717.json
  - docs/qa/evidence/p1-hrm-scale-w3-t-conc-rerun-20260717.md
  - docs/qa/evidence/qc-p1-hrm-scale-w3-20260717.md
  - docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md §5.5 T-CONC / §6 W3
exit_criteria: Re-gate T-CONC — document improved ceiling max passing 400 VU (was 200); confirm 429@400 CLOSED; confirm T-CONC still NOT PASS (1000 unmet; timeout cliff @600); residual COND-SCALE-W3-TIMEOUT-600 → next devops replica wave; NOT Phase1/PROD; evidence qc-p1-hrm-scale-w3-rerun2-20260717.md
cấm: claim T-CONC PASS without 1000 VU ADR gates; promote UF from NFR probe; seed
```
