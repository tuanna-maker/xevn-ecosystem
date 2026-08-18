# P1-HRM-SCALE-DO-W3-HOLD-5MIN — ADR §5.5 sustained 5 min T-CONC probe

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-SCALE-DO-W3-HOLD-5MIN` |
| **from_role** | `devops` |
| **to_role** | `pm` / `qc` |
| **date** | 2026-07-17 |
| **environment** | VPS Dev8088 · capacity SoT **VPS-local** `http://127.0.0.1:3101/api/hrm` |
| **closes_condition?** | **NO** — `COND-SCALE-W3-HOLD-5MIN` remains **OPEN** |
| **prior_gate** | QC RERUN4 **GWC** — 1000 VU / **45s** / 0% err / list p95 1481 ms |
| **adr_ref** | `docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md` §5.5 T-CONC |
| **u65** | zero-seed · GET-only · **no** UF promote · **not** Phase1/PROD |
| **raw_artifact** | `docs/qa/evidence/_p1-hrm-scale-do-w3-hold-5min-t-conc-raw-20260717.json` |
| **console_artifact** | `docs/qa/evidence/_p1-hrm-scale-do-w3-hold-5min-console-20260717.txt` |
| **ack_status** | **FAIL_TO_PM** |

---

## Purpose

Prove ADR §5.5 ideal **1000 VU sustained ≥5 min** on the live DO-W4 topology (2× hrm-be + LB `:3101`). Hard gates already PASS under **45s** holds (RERUN4); this wave tests **endurance only**.

---

## Topology (unchanged — LIVE)

```
probe (VPS node) → hrm-api-lb :3101 (least_conn)
                    ├── hrm-be   :3001  PG_POOL_MAX=20  node dist/main
                    └── hrm-be-2 :3011  PG_POOL_MAX=20  node dist/main
```

| Pre-test health (VPS-local) | Status |
|-----------------------------|-------:|
| LB `:3101/api/hrm/` | **200** |
| hrm-be `:3001` | **200** |
| hrm-be-2 `:3011` | **200** |
| portal `:8088` | **200** |
| xbos `:28002` | **200** |

---

## Method

| Control | Value |
|---------|-------|
| Script | `scripts/load/hrm-t-conc-load.mjs` |
| Runner | **VPS** `/usr/bin/node` v20 (not Windows WAN) |
| `PORTAL_DEV_URL` | `http://127.0.0.1:8088` |
| `HRM_API_BASE` | `http://127.0.0.1:3101/api/hrm` (**LB**) |
| Stages | **`--stages 1000`** (single stage — ADR ideal) |
| `T_CONC_STAGE_HOLD_MS` | **300000** (5 min) |
| `T_CONC_THINK_MS` | `1000` |
| Abort threshold | `T_CONC_ABORT_ERROR_RATE=0.05` (script default) |
| Traffic | GET-only list `page_size=50` + summary |
| Seed | **none** (U65) |

Command (VPS):

```bash
cd /opt/xevn-ecosystem
PORTAL_DEV_URL=http://127.0.0.1:8088 \
HRM_API_BASE=http://127.0.0.1:3101/api/hrm \
T_CONC_STAGE_HOLD_MS=300000 \
T_CONC_THINK_MS=1000 \
node scripts/load/hrm-t-conc-load.mjs --stages 1000
```

---

## Results — **FAIL** (endurance cliff)

| Metric | Target (ADR §5.5) | Measured @1000 VU | Gate |
|--------|-------------------|-------------------|------|
| Hold duration | **≥300 s** sustained | **~109 s** then abort | **FAIL** |
| Error rate | **&lt; 1%** | **7.49%** (5088/67911) | **FAIL** |
| 429 | — | **0%** | OK |
| 5xx | — | **6.59%** (4475× **502**) | **FAIL** |
| status=0 | — | 613 | FAIL contrib |
| List p95 | **&lt; 2s** | **1545 ms** | **PASS** (latency OK while errors climb) |
| Summary p95 | **&lt; 1s** (residual note) | **1491 ms** | **MISS** — `COND-SCALE-W3-T-P95-SUM-1000` (does **not** alone decide hold-5min) |
| RPS | — | ~621 | — |
| `t_conc_met` | true | **false** | **FAIL** |
| `max_passing_vu` | 1000 | **null** | **FAIL** |
| `blocked_reason` | — | `post-stage health FAIL at 1000 VU` | — |
| Mid-hold abort | — | `abort_triggered: true` (rolling err &gt; 5%) | — |

### Cliff class

| Observation | Evidence |
|-------------|----------|
| Nginx upstream collapse | LB error log: **`no live upstreams while connecting to upstream`** → client **502** |
| Timing | Failures clustered ~`16:56:48Z` near abort (~109s into 300s hold) |
| Post-stage health (script) | LB health + list → **502** |
| Post-test recovery (now) | LB / BE1 / BE2 / portal / xbos → **200**; both replicas **healthy**; `pg_pool_waiting_count=0` |
| Non-xevn | Undisturbed (compose not touched; no `docker compose down`) |

**Interpretation:** 45s hold @1000 VU remains valid capacity proof (RERUN4). Under **5 min** sustained load, Nest upstreams were marked dead by nginx (`no live upstreams`), producing **502** burst and script abort. This is an **endurance / upstream availability cliff**, not WAN client noise.

**Forbidden claim:** Do **not** claim full ADR T-CONC PASS (1000 VU × 5 min). RERUN4 GWC hard gates (45s) are **not** revoked by this FAIL.

---

## Before vs after (45s vs 5min)

| Probe | Hold | Error | List p95 | Summary p95 | Verdict |
|-------|-----:|------:|---------:|------------:|---------|
| DO-W4 / QC RERUN4 | **45 s** | **0%** | **1481 ms** | 1183 ms | Hard gates **PASS** (GWC) |
| **This wave** | **300 s intent** (~109 s abort) | **7.49%** | **1545 ms** | 1491 ms | Hold-5min **FAIL** |

---

## Gate adjudication (devops)

| Criterion | Verdict |
|-----------|---------|
| Probe via VPS-local LB `:3101` | **PASS** (method) |
| Stage 1000 VU + `T_CONC_STAGE_HOLD_MS=300000` | **PASS** (flags applied) |
| Sustained 5 min without abort | **FAIL** |
| Error &lt;1% for full hold | **FAIL** |
| List p95 &lt;2s on samples collected | **PASS** (partial window) |
| Summary p95 &lt;1s | **MISS** — residual only (`COND-SCALE-W3-T-P95-SUM-1000`) |
| Post-test health 200 | **PASS** (recovered after cliff) |
| Non-xevn undisturbed | **PASS** |
| Full ADR T-CONC claim | **NO** |
| UF / Phase1 / PROD | **NO** |

---

## Residuals for QC / PM

| ID | Sev | Status | Notes |
|----|-----|--------|-------|
| `COND-SCALE-W3-HOLD-5MIN` | P2 NFR | **OPEN** (confirmed FAIL) | Keep GWC; do not close |
| `COND-SCALE-W3-T-P95-SUM-1000` | P2 NFR | OPEN | Summary p95 1491 ms @1000 — **not** blocking this hold verdict |
| Optional follow-up | — | PM decide | Revisit DO-W5 PG / connection / nginx `max_fails`/`fail_timeout` / replica headroom **only if** sponsor wants 5min endurance closed — out of this wave scope unless dispatched |

---

## Handoff packet

- **completion_report:** Ran VPS-local **1000 VU × 300000 ms** hold against LB `:3101`. Script aborted ~**109 s** with **errorRate 7.49%**, **0×429**, **4475×502**, list p95 **1545 ms**, summary p95 **1491 ms**. LB logged **no live upstreams**. `t_conc_met=false`. Post-test stack **recovered to 200**. Non-xevn undisturbed. **COND-SCALE-W3-HOLD-5MIN remains OPEN** — do **not** claim full ADR T-CONC PASS. Summary p95 residual noted separately.
- **next_owner:** `qc`
- **evidence_path:** `docs/qa/evidence/p1-hrm-scale-do-w3-hold-5min-20260717.md` + `_p1-hrm-scale-do-w3-hold-5min-t-conc-raw-20260717.json` + `_p1-hrm-scale-do-w3-hold-5min-console-20260717.txt`
- **ack_status:** **FAIL_TO_PM**

### next_dispatch_prompt

```text
work_item_id: P1-HRM-SCALE-QC-W3-HOLD-5MIN
from_role: pm
to_role: qc
subagent_type: qc

Read: docs/qa/evidence/p1-hrm-scale-do-w3-hold-5min-20260717.md
+ _p1-hrm-scale-do-w3-hold-5min-t-conc-raw-20260717.json
Prior: qc-p1-hrm-scale-w3-rerun4-20260717.md (GWC)

Task: Adjudicate COND-SCALE-W3-HOLD-5MIN — devops FAIL (1000 VU 5min abort @~109s, 7.49% err, 502 no-live-upstreams). Keep GWC; do NOT close hold condition; do NOT revoke RERUN4 45s hard-gate PASS. Note COND-SCALE-W3-T-P95-SUM-1000 separately (1491 ms). NOT Phase1/PROD; no UF promote.

Exit: evidence qc note; ack_status PASS_TO_PM; next_owner pm (optional DO follow-up only if sponsor wants endurance closed).
```
