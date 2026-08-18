# QC Gate — P1-HRM-SCALE-QC-W3-HOLD-5MIN (ADR §5.5 endurance adjudication)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-SCALE-QC-W3-HOLD-5MIN` |
| **date** | `2026-07-17` / adjudicated `2026-07-18` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **GO WITH CONDITIONS** (W3 overall **unchanged** from RERUN4 — **not** Phase 1 / **not** PROD) |
| **evidence_path** | `docs/qa/evidence/qc-p1-hrm-scale-w3-hold-5min-20260717.md` |
| **source_devops** | `docs/qa/evidence/p1-hrm-scale-do-w3-hold-5min-20260717.md` |
| **authoritative_raw** | `docs/qa/evidence/_p1-hrm-scale-do-w3-hold-5min-t-conc-raw-20260717.json` |
| **console** | `docs/qa/evidence/_p1-hrm-scale-do-w3-hold-5min-console-20260717.txt` |
| **prior_gate** | `docs/qa/evidence/qc-p1-hrm-scale-w3-rerun4-20260717.md` (**GWC** — 45s hard gates PASS) |
| **adr_ref** | `docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md` §5.5 T-CONC |
| **capacity_SoT** | **VPS-local** `http://127.0.0.1:3101/api/hrm` only |
| **u65** | zero-seed · GET-only · **no** UF promote |

## Verdict

**GO WITH CONDITIONS** for Scale W3 NFR **overall** — **RERUN4 stands**. This wave adjudicates **endurance only** and does **not** close or revoke prior hard-gate PASS.

| Decision | QC |
|----------|-----|
| Revoke RERUN4 45s hard-gate PASS (1000 VU / 0% err / list p95 1481 ms)? | **NO** |
| Close `COND-SCALE-W3-HOLD-5MIN`? | **NO** — remains **OPEN** |
| Claim full ADR T-CONC (1000 VU × 5 min)? | **NO** |
| Phase 1 DONE / PROD-READY / UF promote? | **NO** |

### Why RERUN4 is not revoked

| Probe | Hold | Error | List p95 | Capacity claim |
|-------|-----:|------:|---------:|----------------|
| **QC RERUN4 / DO-W4** (hard gates) | **45 s** | **0%** | **1481 ms** | Bounded NFR **PASS** — remains SoT for 45s concurrency |
| **DO-W3-HOLD-5MIN** (this wave) | **300 s intent** → abort ~**109 s** | **7.49%** | **1545 ms** (partial window) | Endurance **FAIL** — separate condition |

Failing a longer hold proves an **endurance / upstream-availability cliff**, not that the 45s VPS-local hard gates were false. QC **forbids** treating HOLD-5MIN FAIL as a re-open of RERUN4 hard gates without a **new VPS-local 45s regression** that itself fails.

## Source evidence audit

| Check | Result |
|-------|--------|
| DevOps MD present + readable | **PASS** |
| Raw JSON present (`t_conc_met=false`, `abort_triggered`, 502 counts) | **PASS** |
| Console confirms `stage_hold_ms=300000`, abort, post-stage 502 | **PASS** |
| Method = VPS-local LB `:3101` (not WAN) | **PASS** |
| Post-test stack recovered 200 (devops report) | **PASS** (from DO MD) |
| Non-xevn undisturbed | **PASS** (from DO MD) |
| U65 zero-seed / GET-only | **PASS** |

### Measured FAIL window (authoritative raw)

| Metric | Target | Measured | QC |
|--------|--------|----------|-----|
| Hold duration | ≥300 s | **~109.35 s** then abort | **FAIL** |
| Error rate | &lt;1% | **7.49%** (5088/67911) | **FAIL** |
| 5xx / 502 | — | **6.59%** / **4475×502** | **FAIL** |
| 429 | — | **0%** | OK |
| List p95 | &lt;2s | **1545 ms** | PASS on samples collected (does **not** salvage hold) |
| Summary p95 | &lt;1s | **1491 ms** | **MISS** — separate residual |
| `t_conc_met` | true | **false** | **FAIL** |
| Cliff class | — | nginx **`no live upstreams`** → client **502** | **PRODUCT/NFR endurance** |

## Adjudication matrix vs RERUN4 GWC

| Criterion | RERUN4 (45s) | HOLD-5MIN (300s intent) | QC disposition |
|-----------|--------------|-------------------------|----------------|
| Concurrent 1000 VU | PASS | Attempted | Unchanged for 45s SoT |
| Error &lt;1% | PASS 0% | FAIL 7.49% | Hold condition OPEN |
| List p95 &lt;2s | PASS 1481 ms | 1545 ms (partial) | 45s PASS retained |
| Hold = ADR 5 min | CONDITION | **Confirmed FAIL** | `COND-SCALE-W3-HOLD-5MIN` **OPEN** |
| Summary p95 &lt;1s @1000 | CONDITION 1183 ms | **1491 ms** | `COND-SCALE-W3-T-P95-SUM-1000` **OPEN** (separate) |
| `COND-SCALE-W3-TIMEOUT-600` | **CLOSED** | n/a | **Remains CLOSED** |
| Overall W3 gate | **GWC** | Endurance residual confirmed | **GWC retained** |

## L2.5 J-* journeys

| Journey ID | Account | Click path | Expected | Actual | Verdict |
|------------|---------|------------|----------|--------|---------|
| N/A — NFR read-only endurance probe | script token | API load via LB only | No UF promotion | No browser L2.5 | **NOT PROMOTED** |

## Read-only matrix

| Module / hot path | C | R | U | D | Negative case | Verdict |
|-------------------|---|---|---|---|---------------|---------|
| HRM Employees list via LB (45s SoT) | N/A | 1000 VU **PASS** (RERUN4) | N/A | N/A | — | **GWC retained** |
| HRM Employees list via LB (5 min hold) | N/A | Abort ~109s / 502 cliff | N/A | N/A | `no live upstreams` | **CONDITION OPEN** |
| HRM Employees summary @1000 | N/A | p95 1491 ms | N/A | N/A | T-P95-SUM | **CONDITION OPEN** |

## Classification (ENV vs PRODUCT vs PROCESS)

- **PRODUCT/NFR (endurance cliff — OPEN):** Sustained 1000 VU ≥5 min fails: rolling error &gt;5% abort ~109s, **4475×502**, LB **`no live upstreams while connecting to upstream`**. Class = **upstream availability under long hold** (nginx fail marking / Nest replica death), not WAN client noise.
- **PRODUCT/NFR (hard gates — CLEARED, retained):** RERUN4 VPS-local **45s** @1000 VU: 0% err, list p95 &lt;2s — **not revoked**.
- **PRODUCT/NFR (latency residual — OPEN, separate):** `COND-SCALE-W3-T-P95-SUM-1000` — summary p95 **1491 ms** this run (was 1183 ms @45s). Does **not** alone decide hold-5min; keep as distinct residual.
- **ENV:** Pre-test health 200; post-cliff recovery 200 — stack recoverable. Not ENV-only failure.
- **PROCESS:** `verify:qc:evidence-pack` on source DO MD = **3/8** (missing command_table / journey_l25 / crud_or_matrix) — **recurring NFR false-negative**; gate integrity rests on DO MD + named raw JSON + RERUN4 prior gate (same policy as RERUN4). Not used to force product NO-GO of overall W3 GWC.

## Residual / conditions (GWC)

| ID | Sev | Owner | Status | Required action | Exit evidence |
|----|-----|-------|--------|-----------------|---------------|
| `COND-SCALE-W3-HOLD-5MIN` | **P2 NFR** | **devops** | **OPEN** (confirmed FAIL) | Fix endurance cliff (502 / no-live-upstreams under long hold: nginx `max_fails`/`fail_timeout`, replica health, pool/headroom as proven) → re-run **1000 VU × ≥300s** VPS-local `:3101` with err &lt;1% | New raw+console + QC re-close |
| `COND-SCALE-W3-T-P95-SUM-1000` | **P2 NFR** | **dev-be** / devops | **OPEN** (separate) | Reduce summary p95 @1000 toward **&lt;1s** **or** signed waiver owner+expiry | Re-probe or waiver |
| RERUN4 45s hard gates | — | — | **PASS retained** | Do **not** revoke without VPS-local 45s regression FAIL | — |
| `COND-SCALE-W3-TIMEOUT-600` | — | — | **CLOSED** | Unchanged | RERUN4 |
| Standing claim limit | **P0 governance** | **pm** | Active | May state NFR GWC: **1000 VU / 45s / 0% err / list p95&lt;2s** — **must not** claim ADR 5min T-CONC PASS, Phase 1, or PROD | SERVICE_READINESS wording |
| UF / J-* | — | — | **No promote** | — | — |

### Residual owner confirmation (in-flight)

Bus already has:

| work_item_id | Role | Status | QC note |
|--------------|------|--------|---------|
| **`P1-HRM-SCALE-DO-W3-HOLD-STABILITY`** | **devops** | **DISPATCHED** (pm 2026-07-18T00:13:30) | **Confirmed residual owner** for 502 / no-live-upstreams mid-hold → fix then re-run 1000×5min |
| `COND-SCALE-W3-T-P95-SUM-1000` | defer / dev-be | OPEN | After hold stability or waiver — **not** blocking this adjudication |

QC does **not** open a duplicate stability dispatch; PM already owns the chain.

## Gate decision

| Criterion | QC result |
|-----------|-----------|
| Source DO FAIL evidence integrity | **PASS** (audited) |
| Keep overall W3 **GO WITH CONDITIONS** | **YES** |
| Revoke RERUN4 45s hard PASS | **NO** |
| `COND-SCALE-W3-HOLD-5MIN` | **OPEN** |
| `COND-SCALE-W3-T-P95-SUM-1000` | **OPEN** (separate; 1491 ms) |
| Full ADR 5min T-CONC | **NO** |
| UF / J-* promote | **NO** |
| Phase 1 / PROD claim | **NO** |
| Next residual owner | **devops** `P1-HRM-SCALE-DO-W3-HOLD-STABILITY` (already DISPATCHED) |

## Evidence-pack note

NFR probe packs routinely fail `verify:qc:evidence-pack` on `journey_l25` / `crud_or_matrix` / `command_table` (out-of-slice). Source DO pack **3/8** — same class as RERUN4 process note. Gate integrity = DO MD + raw JSON + prior RERUN4 GWC file.

## Forbidden claims

- NOT Phase 1 DONE
- NOT PROD-READY
- NOT full ADR T-CONC PASS (1000 VU × 5 min)
- NO UF / J-* promote from this probe
- NO seed
- NO revoke of RERUN4 45s hard-gate PASS without VPS-local 45s regression FAIL

## Handoff packet

- **completion_report:** QC adjudicated DO-W3-HOLD-5MIN **FAIL_TO_PM** (abort ~109s, err **7.49%**, **4475×502**, nginx **no live upstreams**). Overall Scale W3 remains **GO WITH CONDITIONS** per RERUN4 — **45s hard gates NOT revoked**. `COND-SCALE-W3-HOLD-5MIN` **OPEN**. `COND-SCALE-W3-T-P95-SUM-1000` **OPEN** separately (summary p95 **1491 ms**). Residual owner confirmed: **devops** `P1-HRM-SCALE-DO-W3-HOLD-STABILITY` already DISPATCHED. Not Phase 1 / not PROD; no UF promoted.
- **next_owner:** `pm` (monitor devops stability; after READY_FOR_QA / PASS → QC re-close hold condition)
- **evidence_path:** `docs/qa/evidence/qc-p1-hrm-scale-w3-hold-5min-20260717.md`
- **ack_status:** **PASS_TO_PM**

### next_dispatch_prompt

```text
work_item_id: P1-HRM-SCALE-PM-W3-HOLD-5MIN-INTAKE
from_role: qc
to_role: pm
subagent_type: pm

QC P1-HRM-SCALE-QC-W3-HOLD-5MIN = GO WITH CONDITIONS retained (RERUN4 45s hard PASS NOT revoked).
COND-SCALE-W3-HOLD-5MIN OPEN (abort ~109s, 7.49% err, 502 no-live-upstreams).
COND-SCALE-W3-T-P95-SUM-1000 OPEN separate (summary p95 1491ms).
Residual owner CONFIRMED in-flight: devops P1-HRM-SCALE-DO-W3-HOLD-STABILITY.

Actions:
1) Update TEAM_WORKING_NOW / bus: HOLD-5MIN QC GWC note; do NOT claim ADR 5min PASS
2) Do NOT re-dispatch duplicate stability if DO-W3-HOLD-STABILITY still DISPATCHED
3) After devops READY_FOR_QA on 1000×5min re-probe → Task qc P1-HRM-SCALE-QC-W3-HOLD-5MIN-RECLOSE
4) Defer T-P95-SUM until hold closed or signed waiver

cấm: revoke RERUN4 45s PASS without VPS-local 45s regression; Phase1/PROD; UF promote; seed
evidence: docs/qa/evidence/qc-p1-hrm-scale-w3-hold-5min-20260717.md
```
