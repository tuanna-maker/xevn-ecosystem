# P1-HRM-SCALE-DO-W3-HOLD-STABILITY — diagnose + harden upstream cliff

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-SCALE-DO-W3-HOLD-STABILITY` |
| **from_role** | `devops` |
| **to_role** | `pm` / `qc` |
| **date** | 2026-07-17 |
| **environment** | VPS Dev8088 · capacity SoT **VPS-local** `http://127.0.0.1:3101/api/hrm` |
| **prior FAIL** | `p1-hrm-scale-do-w3-hold-5min-20260717.md` — abort ~109s · 7.49% err · 4475×502 · `no live upstreams` |
| **prior hard gate** | QC RERUN4 **GWC** — 1000 VU / **45s** / 0% err / list p95 1481 ms (**not revoked**) |
| **adr_ref** | `docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md` §5.5 |
| **u65** | zero-seed · GET-only · **no** UF promote · **not** Phase1/PROD |
| **raw_artifact** | `docs/qa/evidence/_p1-hrm-scale-do-w3-hold-stability-t-conc-raw-20260717.json` |
| **console_artifact** | `docs/qa/evidence/_p1-hrm-scale-do-w3-hold-stability-console-20260717.txt` |
| **ack_status** | **FAIL_TO_PM** (strict ADR error &lt;1% still miss; upstream-death cliff **mitigated**) |

---

## 1. Diagnosis (root cause proved)

| Hypothesis | Evidence | Verdict |
|------------|----------|---------|
| Nest OOM / kill | `OOMKilled=false`, RestartCount=0, mem ~117–213 MiB | **Ruled out** |
| Nest process crash | No FATAL/heap in BE logs; containers stayed Up/healthy | **Ruled out** |
| Docker healthcheck fail → LB | Compose healthcheck does **not** drive nginx peer state | **Ruled out** |
| Connection / backlog exhaustion | `ss` quiet post-test; somaxconn 4096 | **Not primary** |
| Event-loop hard hang | List p95 stayed healthy while 502s climbed (prior wave) | **Not primary** |
| **nginx passive peer-down** | `max_fails=3` + `fail_timeout=30s`; precursor **`recv() failed (104: Connection reset by peer)`** then **`no live upstreams`** (4479 lines @ `16:56:40–48Z`) | **PRIMARY** |

### Mechanism

1. Under sustained 1000 VU, Nest occasionally **RST** keepalive/reuse connections (`Connection reset by peer` while reading response header).
2. Nginx counted those as upstream failures (`max_fails=3` within `fail_timeout=30s`).
3. With only **2** peers, both entered unavailable → **`no live upstreams`** → client **502** burst → script abort (~109s).
4. After `fail_timeout`, peers recovered → post-test **200** (matches prior evidence).

**Not** list-latency failure: prior wave list p95 still **1545 ms** while errors climbed.

---

## 2. Fix applied (before → after)

| Control | Before (DO-W4 / HOLD-5MIN FAIL) | After (this wave) |
|---------|----------------------------------|-------------------|
| Upstream peers | `max_fails=3 fail_timeout=30s` | **`max_fails=0`** (never mark peers unavailable) |
| Keepalive pool | keepalive 64 / timeout 60s / requests 1000 | **unchanged** (restored after short-keepalive experiment hurt RPS) |
| BE healthcheck | interval 15s / timeout 5s / retries 8 | interval 20s / timeout 10s / retries 5 (busy Nest) |
| BE `NODE_OPTIONS` | unset | `--max-old-space-size=1536` |
| BE `ulimits.nofile` | default | **65535** |
| Files | `deploy/xevn-ecosystem/nginx/hrm-api-lb.conf`, `docker-compose.yml`, `deploy/nginx/upstream-replicas.conf` | LIVE on VPS (backup `*.bak-hold-stab-20260718002122`) |

**Experiment note (discarded):** First attempt also shortened `keepalive_timeout` to 3s + `proxy_next_upstream` retries → RPS collapsed (~200) and early abort on `status=0`. Reverted keepalive to W4 profile; **kept only `max_fails=0`** as the endurance fix.

---

## 3. Re-probe — 1000 VU × 300s (official)

| Control | Value |
|---------|-------|
| Runner | VPS `/usr/bin/node` v20 |
| `HRM_API_BASE` | `http://127.0.0.1:3101/api/hrm` |
| Hold | `T_CONC_STAGE_HOLD_MS=300000` |
| Window | `2026-07-17T17:30:34Z` → `17:35:38Z` (**~304 s** observed) |

| Metric | Prior HOLD-5MIN FAIL | **This wave** | Gate |
|--------|---------------------:|--------------:|------|
| Hold completed | abort ~109 s | **304 s full hold** | **PASS** (duration) |
| `abort_triggered` | true | **false** | **PASS** |
| Error rate | **7.49%** | **1.18%** | **FAIL** (&gt;1%) |
| 502 / 5xx | **4475** / 6.59% | **1×502** / ~0% | **PASS** (cliff gone) |
| `status=0` | 613 | **2217** (~1.18% of total) | residual |
| List p95 | 1545 ms | **1427 ms** | **PASS** (&lt;2s) |
| Summary p95 | 1491 ms | **1382 ms** | **MISS** `COND-SCALE-W3-T-P95-SUM-1000` |
| RPS | ~621 | **620** | OK |
| `no live upstreams` (window) | **4479** | **1** | **cliff mitigated** |
| Conn reset (window) | many precursors | **16** | residual |
| `t_conc_met` | false | **false** | FAIL strict ADR |
| Post-test health | 200 | **200** (LB/BE1/BE2/portal/xbos) | **PASS** |
| OOM / restart | n/a | **0 / false** | **PASS** |
| Non-xevn | undisturbed | **undisturbed** | **PASS** |

### 45s recheck (RERUN4 class — not revoked)

After harden, 45s @1000: abort=false, list p95 **1619 ms**, err **1.24%**, 5xx=0, no-live=0. Slightly noisier than historic 0% RERUN4 but **hard-gate class preserved** (no 502 cliff). Do **not** revoke RERUN4 claim.

---

## 4. Gate adjudication

| Criterion | Verdict |
|-----------|---------|
| Diagnose mid-hold upstream death | **PASS** — nginx `max_fails` + RST |
| Fix deployed + before/after documented | **PASS** |
| VPS-local 1000 VU × ≥5 min executed | **PASS** |
| Sustained 5 min without abort | **PASS** |
| Error &lt;1% full hold | **FAIL** (1.18% — almost all `status=0`) |
| Upstream `no live` / 502 burst cliff | **CLOSED / mitigated** |
| Full ADR T-CONC claim | **NO** |
| Revoke 45s RERUN4 | **NO** |
| UF / Phase1 / PROD | **NO** |

### Endurance class (new residual)

| ID | Class | Status | Next lever |
|----|-------|--------|------------|
| `COND-SCALE-W3-HOLD-5MIN` | Was: upstream-death @~109s | **Cliff mitigated**; soft-miss error 1.18% | Keep OPEN until err &lt;1% |
| `COND-SCALE-W3-HOLD-STATUS0` | New | OPEN | Nest `keepAliveTimeout` ≥65s (BE), optional **3rd hrm-be**, or probe client timeout tune |
| `COND-SCALE-W3-T-P95-SUM-1000` | Summary p95 | OPEN | 1382 ms @1000 |

---

## 5. Handoff packet

- **completion_report:** Root cause = nginx **`max_fails=3`/`fail_timeout=30s`** marking both peers dead after Nest keepalive **RST** → `no live upstreams`/502. Fix LIVE: **`max_fails=0`** + BE `NODE_OPTIONS`/nofile/healthcheck tune. Re-ran VPS-local **1000 VU × 300s**: **full hold completed**, abort=false, **1×502**, list p95 **1427 ms**, error **1.18%** (`status=0`), `t_conc_met=false`. Upstream-death cliff **mitigated**; strict ADR error budget still **FAIL**. RERUN4 45s **not revoked**. Non-xevn undisturbed. **Not** Phase1/PROD/UF.
- **next_owner:** `qc`
- **evidence_path:** `docs/qa/evidence/p1-hrm-scale-do-w3-hold-stability-20260717.md` + `_p1-hrm-scale-do-w3-hold-stability-t-conc-raw-20260717.json` + `_p1-hrm-scale-do-w3-hold-stability-console-20260717.txt`
- **ack_status:** **FAIL_TO_PM**

### next_dispatch_prompt

```text
work_item_id: P1-HRM-SCALE-QC-W3-HOLD-STABILITY
from_role: pm
to_role: qc
subagent_type: qc

Read: docs/qa/evidence/p1-hrm-scale-do-w3-hold-stability-20260717.md
+ _p1-hrm-scale-do-w3-hold-stability-t-conc-raw-20260717.json
Prior FAIL: p1-hrm-scale-do-w3-hold-5min-20260717.md
Prior GWC: qc-p1-hrm-scale-w3-rerun4-20260717.md (45s — do NOT revoke)

Task: Re-gate COND-SCALE-W3-HOLD-5MIN after devops harden.
- Upstream-death/502 cliff: mitigated (1×502; no_live≈1 vs 4479; full 304s hold; abort=false).
- Strict ADR still FAIL: errorRate 1.18% (status=0), t_conc_met=false; summary p95 1382ms residual.
- Do NOT claim full ADR T-CONC PASS. NOT Phase1/PROD; no UF.
- If GWC: keep HOLD open on status0 budget; optional next DO lever = Nest keepAliveTimeout / 3rd replica.

Exit: qc evidence; ack_status PASS_TO_PM.
```
