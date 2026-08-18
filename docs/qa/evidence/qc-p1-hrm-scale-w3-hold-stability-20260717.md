# QC Gate — P1-HRM-SCALE-QC-W3-HOLD-STABILITY (endurance cliff re-adjudication)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-SCALE-QC-W3-HOLD-STABILITY` |
| **date** | `2026-07-17` / adjudicated `2026-07-18` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **GO WITH CONDITIONS** (W3 overall **unchanged** from RERUN4 — **not** Phase 1 / **not** PROD) |
| **evidence_path** | `docs/qa/evidence/qc-p1-hrm-scale-w3-hold-stability-20260717.md` |
| **source_devops** | `docs/qa/evidence/p1-hrm-scale-do-w3-hold-stability-20260717.md` |
| **authoritative_raw** | `docs/qa/evidence/_p1-hrm-scale-do-w3-hold-stability-t-conc-raw-20260717.json` |
| **console** | `docs/qa/evidence/_p1-hrm-scale-do-w3-hold-stability-console-20260717.txt` |
| **prior_fail** | `docs/qa/evidence/p1-hrm-scale-do-w3-hold-5min-20260717.md` + `qc-p1-hrm-scale-w3-hold-5min-20260717.md` |
| **prior_hard_gate** | `docs/qa/evidence/qc-p1-hrm-scale-w3-rerun4-20260717.md` (**GWC** — 45s hard PASS) |
| **adr_ref** | `docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md` §5.5 T-CONC |
| **capacity_SoT** | **VPS-local** `http://127.0.0.1:3101/api/hrm` only |
| **portal_url** | Dev8088 portal `http://127.0.0.1:8088` (NFR probe SoT = LB `:3101`; portal not load-tested this gate) |
| **u65** | zero-seed · GET-only · **no** UF promote |

## Verdict

**GO WITH CONDITIONS** for Scale W3 NFR **overall** — **RERUN4 stands**. This wave re-adjudicates **HOLD endurance** after DevOps `max_fails=0` harden:

| Decision | QC |
|----------|-----|
| Revoke RERUN4 45s hard-gate PASS (1000 VU / 0% err / list p95 1481 ms)? | **NO** |
| Upstream-death / 502 cliff mitigated? | **YES** — **CLOSED** as `COND-SCALE-W3-HOLD-502-CLIFF` |
| Strict ADR error &lt;1% on full 5 min hold? | **NO** — measured **1.18%** (`status=0`) → **OPEN** |
| Claim full ADR T-CONC (1000 VU × 5 min)? | **NO** |
| Phase 1 DONE / PROD-READY / UF promote? | **NO** |

### Condition split (authoritative)

Prior monolithic `COND-SCALE-W3-HOLD-5MIN` is **split** so progress is visible and residual is precise:

| Condition ID | Scope | Status | Measured |
|--------------|-------|--------|----------|
| **`COND-SCALE-W3-HOLD-502-CLIFF`** | nginx `no live upstreams` → 502 burst / mid-hold abort | **CLOSED** | Full hold **~304 s**; `abort_triggered=false`; **1×502**; `no_live` ≈1 vs prior **4479**; list p95 **1427 ms** |
| **`COND-SCALE-W3-HOLD-ERRBUDGET`** | ADR error &lt;1% across full hold | **OPEN** | errorRate **1.176%** (2218/188590); almost all **`status=0`** (2217); 5xx ≈0 |
| **`COND-SCALE-W3-HOLD-5MIN`** | Parent / ADR “5 min hold met” | **OPEN** (soft) | Parent stays OPEN until **ERRBUDGET** closes; **502-CLIFF no longer blocks** |
| **`COND-SCALE-W3-T-P95-SUM-1000`** | Summary p95 &lt;1s @1000 | **OPEN** (separate) | summary p95 **1382 ms** (improved vs hold-5min **1491 ms**; still &gt;1s) |

**Do not** treat DO `FAIL_TO_PM` (strict ADR) as overall W3 **NO-GO** or as revoke of RERUN4. Material progress = cliff **CLOSED**; residual = error-budget / client `status=0`.

## Source evidence audit

| Check | Result |
|-------|--------|
| DevOps MD present + readable | **PASS** |
| Raw JSON present (`t_conc_met=false`, stages[0]) | **PASS** |
| Console confirms errorRate 0.0118, abort false, statusCounts 502=1 | **PASS** |
| Method = VPS-local LB `:3101` (not WAN) | **PASS** |
| Post-test health 200 | **PASS** (raw + DO MD) |
| Non-xevn undisturbed | **PASS** (DO MD) |
| U65 zero-seed / GET-only | **PASS** |
| Fix documented (`max_fails=0` LIVE) | **PASS** |

### Measured window (authoritative raw)

| Metric | Target | Prior HOLD-5MIN FAIL | **HOLD-STABILITY** | QC |
|--------|--------|---------------------:|-------------------:|-----|
| Hold duration | ≥300 s | ~109 s abort | **304.06 s** | **PASS** |
| `abort_triggered` | false | true | **false** | **PASS** |
| Error rate | &lt;1% | 7.49% | **1.176%** (2218/188590) | **FAIL** |
| 502 count | cliff gone | **4475** | **1** | **PASS** (cliff) |
| `status=0` | — | 613 | **2217** | residual ERRBUDGET |
| rate5xx | — | 6.59% | **~0.0005%** (1/188590) | **PASS** |
| List p95 | &lt;2s | 1545 ms | **1427 ms** | **PASS** |
| Summary p95 | &lt;1s | 1491 ms | **1382 ms** | **MISS** (separate) |
| RPS | — | ~621 | **620** | OK |
| `t_conc_met` | true | false | **false** | **FAIL** strict ADR |
| `gates.error_budget_ok` | true | false | **false** | **FAIL** |
| `gates.p95_list_ok` | true | — | **true** | **PASS** |

Raw keys audited: `stages[0].overall.statusCounts` = `{0:2217, 200:186372, 502:1}`; `duration_sec=304.06`; `generatedAt=2026-07-17T17:35:38.909Z`.

### 45s recheck (post-harden) — do not revoke RERUN4

DO reported post-harden 45s @1000: abort=false, list p95 1619 ms, err 1.24%, 5xx=0, no-live=0. Slightly noisier than historic RERUN4 **0%**, but **no 502 cliff**. QC disposition: **RERUN4 historic hard-gate claim retained**; do **not** revoke without a dedicated VPS-local 45s regression that itself fails the RERUN4 bar. Optional follow-up: re-baseline 45s after ERRBUDGET fix (not this gate).

## Adjudication matrix vs prior gates

| Criterion | RERUN4 (45s) | HOLD-5MIN FAIL | **HOLD-STABILITY** | QC disposition |
|-----------|--------------|----------------|--------------------|----------------|
| Concurrent 1000 VU | PASS | Attempted | Sustained 304s | Unchanged for 45s SoT |
| Error &lt;1% | PASS 0% | FAIL 7.49% | FAIL **1.18%** | ERRBUDGET **OPEN** |
| List p95 &lt;2s | PASS 1481 ms | 1545 ms partial | **1427 ms** | PASS on full hold |
| 502 / no-live cliff | n/a | **FAIL** 4475×502 | **CLOSED** (1×502) | `COND-SCALE-W3-HOLD-502-CLIFF` **CLOSED** |
| Hold = ADR 5 min | CONDITION | Confirmed FAIL | Duration PASS; budget FAIL | Parent HOLD-5MIN **OPEN** via ERRBUDGET |
| Summary p95 &lt;1s @1000 | CONDITION | 1491 ms | **1382 ms** | `COND-SCALE-W3-T-P95-SUM-1000` **OPEN** |
| `COND-SCALE-W3-TIMEOUT-600` | **CLOSED** | n/a | n/a | **Remains CLOSED** |
| Overall W3 gate | **GWC** | GWC retained | **GWC retained** | Progress recorded |

## Command table (NFR probe — source DO)

| Command / probe | Exit / result | Notes |
|-----------------|---------------|-------|
| VPS-local T-CONC 1000 VU × `T_CONC_STAGE_HOLD_MS=300000` via `127.0.0.1:3101` | Completed; `t_conc_met=false` | Raw JSON artifact |
| Post-test LB/BE health | HTTP **200** | Raw `post_test_health` |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-scale-do-w3-hold-stability-20260717.md` | **5/8 FAIL** (process NFR class) | Not product NO-GO |

## L2.5 J-* journeys

| Journey ID | Account | Click path | Expected | Actual | Verdict |
|------------|---------|------------|----------|--------|---------|
| N/A — NFR read-only endurance probe | script token | API load via LB only | No UF promotion | No browser L2.5 | **NOT PROMOTED** |

## Read-only matrix

| Module / hot path | C | R | U | D | Negative case | Verdict |
|-------------------|---|---|---|---|---------------|---------|
| HRM Employees list via LB (45s SoT) | N/A | 1000 VU **PASS** (RERUN4) | N/A | N/A | — | **GWC retained** |
| HRM Employees list via LB (5 min hold — cliff) | N/A | Full 304s; **1×502** | N/A | N/A | Prior `no live upstreams` | **502-CLIFF CLOSED** |
| HRM Employees list via LB (5 min hold — budget) | N/A | err **1.18%** `status=0` | N/A | N/A | Soft error budget | **ERRBUDGET OPEN** |
| HRM Employees summary @1000 | N/A | p95 1382 ms | N/A | N/A | T-P95-SUM | **CONDITION OPEN** |

## Classification (ENV vs PRODUCT vs PROCESS)

- **PRODUCT/NFR (502 cliff — CLOSED this gate):** Prior endurance failure class was nginx peer-down (`max_fails=3`) after Nest keepalive RST → `no live upstreams` / 502 burst. Fix LIVE (`max_fails=0` + BE nofile/NODE_OPTIONS/healthcheck). Re-probe proves cliff **mitigated**.
- **PRODUCT/NFR (error budget — OPEN):** Full hold completes but ADR error &lt;1% **misses** at **1.18%**, dominated by client **`status=0`** (not 5xx). Residual owner: devops `P1-HRM-SCALE-DO-W3-HOLD-ERRBUDGET` (Nest keepAliveTimeout / replica / client timeout levers per DO).
- **PRODUCT/NFR (hard gates — CLEARED, retained):** RERUN4 VPS-local **45s** @1000 VU — **not revoked**.
- **PRODUCT/NFR (latency residual — OPEN, separate):** `COND-SCALE-W3-T-P95-SUM-1000` — summary p95 **1382 ms**.
- **ENV:** Pre/post health 200; not ENV-only.
- **PROCESS:** Source DO pack **5/8** on `verify:qc:evidence-pack` (missing journey_l25 / crud / portal_url / residual heading / command_table shape) — recurring NFR false-negative; gate integrity = DO MD + named raw JSON + prior RERUN4/HOLD-5MIN QC files. **Not** used to force product NO-GO of overall W3 GWC.

## Residual

| ID | Sev | Owner | Status | Required action | Exit evidence |
|----|-----|-------|--------|-----------------|---------------|
| **`COND-SCALE-W3-HOLD-502-CLIFF`** | P2 NFR | devops | **CLOSED** | Retain `max_fails=0` (or equivalent) on LB; regression if reopened | This gate + DO stability MD |
| **`COND-SCALE-W3-HOLD-ERRBUDGET`** | **P2 NFR** | **devops** | **OPEN** | Drive full-hold errorRate **&lt;1%** (reduce `status=0`); target Nest keepAliveTimeout ≥65s / optional 3rd replica / probe client timeout | New raw+console + QC re-close |
| **`COND-SCALE-W3-HOLD-5MIN`** | P2 NFR | devops | **OPEN** (parent) | Closes only when ERRBUDGET PASS (duration already PASS) | Same |
| **`COND-SCALE-W3-T-P95-SUM-1000`** | P2 NFR | dev-be / devops | **OPEN** (separate) | Summary p95 → &lt;1s **or** signed waiver | Re-probe or waiver |
| RERUN4 45s hard gates | — | — | **PASS retained** | Do **not** revoke without VPS-local 45s regression FAIL | — |
| `COND-SCALE-W3-TIMEOUT-600` | — | — | **CLOSED** | Unchanged | RERUN4 |
| Standing claim limit | **P0 governance** | **pm** | Active | May state NFR GWC: **1000 VU / 45s** + **5min hold without 502 cliff** — **must not** claim ADR T-CONC PASS (error &lt;1% ×5min), Phase 1, or PROD | SERVICE_READINESS wording |
| UF / J-* | — | — | **No promote** | — | — |

### Residual owner confirmation (in-flight)

| work_item_id | Role | Status | QC note |
|--------------|------|--------|---------|
| **`P1-HRM-SCALE-DO-W3-HOLD-ERRBUDGET`** | **devops** | **Already DISPATCHED** (PM) | **Confirmed residual owner** for status=0 / error &lt;1% — **no duplicate** QC dispatch |
| `COND-SCALE-W3-T-P95-SUM-1000` | defer / dev-be | OPEN | After ERRBUDGET or waiver — **not** blocking this adjudication |

## Gate decision

| Criterion | QC result |
|-----------|-----------|
| Source DO FAIL_TO_PM integrity | **PASS** (audited; strict ADR miss honest) |
| Material progress (502 cliff) | **PASS** — **CLOSED** |
| Keep overall W3 **GO WITH CONDITIONS** | **YES** |
| Revoke RERUN4 45s hard PASS | **NO** |
| Full ADR 5min T-CONC | **NO** |
| UF / J-* promote | **NO** |
| Phase 1 / PROD claim | **NO** |
| Next residual owner | **devops** `P1-HRM-SCALE-DO-W3-HOLD-ERRBUDGET` (already DISPATCHED) |

## Forbidden claims

- NOT Phase 1 DONE
- NOT PROD-READY
- NOT full ADR T-CONC PASS (1000 VU × 5 min, error &lt;1%)
- NO UF / J-* promote from this probe
- NO seed
- NO revoke of RERUN4 45s hard-gate PASS without VPS-local 45s regression FAIL
- NO claim that `COND-SCALE-W3-HOLD-5MIN` parent is CLOSED while ERRBUDGET remains OPEN

## Handoff packet

- **completion_report:** QC re-gated HOLD-STABILITY after DO harden. Upstream-death/502 cliff **CLOSED** (`COND-SCALE-W3-HOLD-502-CLIFF`): full **~304s** hold, abort=false, **1×502** vs prior **4475**, list p95 **1427 ms**. Strict ADR still **FAIL**: error **1.18%** (`status=0`) → **`COND-SCALE-W3-HOLD-ERRBUDGET` OPEN**; parent `COND-SCALE-W3-HOLD-5MIN` remains **OPEN**. Overall Scale W3 **GO WITH CONDITIONS** retained — **RERUN4 45s hard PASS NOT revoked**. Full ADR T-CONC **not** claimed. Residual owner confirmed: devops `P1-HRM-SCALE-DO-W3-HOLD-ERRBUDGET` already DISPATCHED. Not Phase 1 / not PROD; no UF promoted.
- **next_owner:** `pm` (monitor ERRBUDGET devops; after READY_FOR_QA → QC re-close)
- **evidence_path:** `docs/qa/evidence/qc-p1-hrm-scale-w3-hold-stability-20260717.md`
- **ack_status:** **PASS_TO_PM**

### next_dispatch_prompt

```text
work_item_id: P1-HRM-SCALE-PM-W3-HOLD-STABILITY-INTAKE
from_role: qc
to_role: pm
subagent_type: pm

QC P1-HRM-SCALE-QC-W3-HOLD-STABILITY = GO WITH CONDITIONS retained (RERUN4 45s hard PASS NOT revoked).
SPLIT: COND-SCALE-W3-HOLD-502-CLIFF CLOSED (full 304s; 1×502; abort=false).
COND-SCALE-W3-HOLD-ERRBUDGET OPEN (error 1.18% status=0) — parent COND-SCALE-W3-HOLD-5MIN stays OPEN.
Do NOT claim full ADR T-CONC PASS. COND-SCALE-W3-T-P95-SUM-1000 OPEN separate (1382ms).
Residual owner CONFIRMED in-flight: devops P1-HRM-SCALE-DO-W3-HOLD-ERRBUDGET.

Actions:
1) Update TEAM_WORKING_NOW / bus: 502 cliff CLOSED; ERRBUDGET OPEN; do NOT claim ADR 5min PASS
2) Do NOT re-dispatch duplicate ERRBUDGET if already DISPATCHED
3) After devops READY_FOR_QA on error&lt;1% full hold → Task qc P1-HRM-SCALE-QC-W3-HOLD-ERRBUDGET-RECLOSE
4) Defer T-P95-SUM until ERRBUDGET closed or signed waiver

cấm: revoke RERUN4 45s PASS without VPS-local 45s regression; Phase1/PROD; UF promote; seed; claim HOLD-5MIN CLOSED while ERRBUDGET OPEN
evidence: docs/qa/evidence/qc-p1-hrm-scale-w3-hold-stability-20260717.md
```
