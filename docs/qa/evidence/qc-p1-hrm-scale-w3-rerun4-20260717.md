# QC Gate — P1-HRM-SCALE-QC-W3-RERUN4 (T-CONC re-gate — VPS-local DO-W4 SoT)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-SCALE-QC-W3-RERUN4` |
| **date** | `2026-07-17` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **GO WITH CONDITIONS** (bounded NFR concurrency — **not** Phase 1 / **not** PROD) |
| **evidence_path** | `docs/qa/evidence/qc-p1-hrm-scale-w3-rerun4-20260717.md` |
| **source_evidence** | `docs/qa/evidence/p1-hrm-scale-do-w4-20260717.md` |
| **authoritative_raw** | `docs/qa/evidence/_p1-hrm-scale-do-w4-t-conc-raw-20260717.json` (`t_conc_met=true`, `max_passing_vu=1000`) |
| **supersedes_ceiling** | `qc-p1-hrm-scale-w3-rerun3-20260717.md` — RERUN3 NO-GO ceiling **400 VU** was based on **WAN Windows→:3101** probe noise (console artifact); **not** capacity SoT |
| **prior_gates** | W3 baseline 50 → rerun 200 → rerun2 400 → **RERUN3** (WAN FAIL@600) → **RERUN4** (VPS-local PASS@1000) |
| **adr_ref** | `docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md` §5.5 T-CONC / §6 W3 |
| **deploy_ref** | DO-W4: ≥2 `hrm-be` (`:3001`+`:3011`) + `hrm-api-lb` least_conn `:3101`; `PG_POOL_MAX` 20+20; `node dist/main` |
| **capacity_SoT** | **VPS-local** `http://127.0.0.1:3101/api/hrm` only |
| **portal_url** | `PORTAL_DEV_URL=http://14.225.217.232:8088` · LB probe SoT `http://127.0.0.1:3101/api/hrm` (VPS-local); public LB `http://14.225.217.232:3101/api/hrm` (spot-check only — **not** capacity SoT) |

## Verdict

**GO WITH CONDITIONS** for **NFR T-CONC staged proof** on Dev8088 under the **VPS-local LB path**, with explicit hold-duration and summary-p95 residuals.

### Reconciliation vs RERUN3 (critical)

| Artifact | Path / class | QC weight |
|----------|--------------|-----------|
| RERUN3 console | `_p1-hrm-scale-do-w4-t-conc-console-20260717.txt` — Windows **WAN** → public `:3101`; 600 VU `errorRate=0.175` `status=0` | **NOT capacity SoT** — client/WAN noise (DO-W4 Progress log discarded this path) |
| RERUN3 verdict | NO-GO ceiling **400 VU**; `COND-SCALE-W3-TIMEOUT-600` OPEN; next DO-W5 PG | **SUPERSEDED for ceiling** by this gate |
| DO-W4 official + raw | VPS-local `127.0.0.1:3101`; stages **400/600/800/1000 all PASS**; `t_conc_met=true` | **Authoritative capacity SoT** for RERUN4 |

**WAN Windows→:3101 is not capacity SoT.** Any future probe from off-box clients that reports high `status=0` while VPS-local LB remains green must be classified **ENV/client path**, not product capacity FAIL, unless VPS-local re-probe also fails.

### Adjudication matrix (ADR §5.5 weighed)

| Criterion | ADR target | Measured (VPS-local @1000 VU) | QC |
|-----------|------------|-------------------------------|-----|
| Concurrent VU | **1000** | **1000** (`max_passing_vu=1000`) | **PASS** |
| Error rate | **&lt; 1%** | **0%** (28880/28880 OK; 0×429; 0×5xx) | **PASS** |
| List p95 (`T-P95-LIST`) | **&lt; 2s** | **1481 ms** | **PASS** |
| Hold duration (`T-CONC`) | **5 min** sustained | **45 s** / stage | **CONDITION** — short of ideal; does **not** void error/list gates on this evidence |
| Summary p95 (`T-P95-SUM`) | **&lt; 1s** | **1183 ms** | **CONDITION** — miss @1000 only (≤800 summary p95 ≤785 ms PASS) |
| 600 VU timeout cliff | closed | **0% error**, list p95 **739 ms** | **`COND-SCALE-W3-TIMEOUT-600` CLOSED** |

**Hard GO criteria for this bounded NFR slice:** error budget + list p95 at **1000 VU** on VPS-local LB — **met**. Full ADR ideal (5 min hold + summary p95 &lt;1s @1000) — **not fully met** → **GWC**, not unconditional GO.

**Forbidden claims:** NOT Phase 1 DONE · NOT PROD-READY · **no** UF / J-* promote from NFR probe · no seed.

## Topology confirmation (exit #1 — spot-check 2026-07-17)

| Endpoint | Status | QC |
|----------|-------:|-----|
| `http://14.225.217.232:3101/api/hrm/` (LB) | **200** | **CONFIRMED LIVE** |
| `http://14.225.217.232:3001/api/hrm/` (hrm-be) | **200** | **CONFIRMED LIVE** |
| `http://14.225.217.232:3011/api/hrm/` (hrm-be-2) | **200** | **CONFIRMED LIVE** |
| `http://14.225.217.232:8088/` (portal) | **200** | **CONFIRMED LIVE** |

| Criterion | Evidence | QC |
|-----------|----------|-----|
| ≥2 hrm-be + nginx least_conn | DO-W4 topology + spot-check 200×4 | **PASS** |
| Pool split 20+20 / `node dist/main` | DO-W4 evidence | **PASS** (from DO) |
| Probe via LB | Raw `hrm_base=http://127.0.0.1:3101/api/hrm` | **PASS** |

## T-CONC measurement matrix (VPS-local LB — authoritative)

Source: `_p1-hrm-scale-do-w4-t-conc-raw-20260717.json` · hold **45000 ms** / stage · GET-only list `page_size=50` + summary.

| VU | Requests | Error rate | 429 | 5xx | list p95 (ms) | summary p95 (ms) | RPS | Error-budget | List p95 | QC |
|----:|---------:|-----------:|----:|----:|--------------:|-----------------:|----:|:-------------|:---------|:---|
| **400** | 16083 | **0%** | 0% | 0% | **450** | 449 | 348.5 | **PASS** | **PASS** | PASS |
| **600** | 21809 | **0%** | 0% | 0% | **739** | 511 | 473.6 | **PASS** | **PASS** | PASS — prior cliff **CLOSED** |
| **800** | 26528 | **0%** | 0% | 0% | **923** | 785 | 575.5 | **PASS** | **PASS** | PASS |
| **1000** | 28880 | **0%** | 0% | 0% | **1481** | **1183** | 622.9 | **PASS** | **PASS** | PASS list/error; summary **MISS** T-P95-SUM |

| Aggregate | Value |
|-----------|--------|
| `t_conc_met` | **true** |
| `max_passing_vu` / `measured_ceiling_vu` | **1000** |
| `blocked_reason` | `null` |
| Post-test health LB | **200** |

## Before vs after (RERUN3 → RERUN4)

| Metric | QC RERUN3 (WAN console) | **QC RERUN4 (VPS-local raw)** |
|--------|-------------------------|--------------------------------|
| Capacity SoT | WAN Windows→`:3101` (noise) | **VPS-local `127.0.0.1:3101`** |
| Max passing VU | **400** (superseded) | **1000** |
| 600 VU | FAIL 17.5% `status=0` | **PASS 0% err**, list p95 739 ms |
| 1000 VU | NOT REACHED | **PASS 0% err**, list p95 1481 ms |
| `COND-SCALE-W3-TIMEOUT-600` | OPEN | **CLOSED** |
| DO-W5 PG headroom | NEXT P0 | **SUPERSEDED** (timeout cliff cleared; optional only if 5min hold or sum p95 re-open) |
| T-CONC promotion | NO-GO | **GWC** (45s hold + T-P95-SUM residual) |

## L2.5 J-* journeys

| Journey ID | Account | Click path | Expected | Actual | Verdict |
|------------|---------|------------|----------|--------|---------|
| N/A — NFR read-only probe | `ceo@xe.vn` token (script) | API load via LB only | No UF promotion | No browser L2.5 in this work item | **NOT PROMOTED** |

## Read-only matrix

| Module / hot path | C | R | U | D | Negative case | Verdict |
|-------------------|---|---|---|---|---------------|---------|
| HRM Employees list via LB | N/A | ≤1000 VU **PASS** (45s hold) | N/A | N/A | WAN client noise discarded | **GWC T-CONC** |
| HRM Employees summary via LB | N/A | ≤800 VU p95 OK; @1000 **1183 ms** | N/A | N/A | T-P95-SUM miss @1000 | **CONDITION** |

## Classification (ENV vs PRODUCT vs PROCESS)

- **PRODUCT/NFR capacity (cleared for hard gates):** VPS-local LB proves **1000 VU**, error **0%**, list p95 **1481 ms &lt;2s** under **45s** holds. Prior 600-VU timeout cliff **CLOSED**.
- **PRODUCT/NFR residual (conditions):** (1) Hold **45s ≠ ADR 5min** — sustained endurance unproven. (2) **T-P95-SUM** **1183 ms &gt;1s** @1000 VU.
- **ENV (non-blocking):** Topology spot-check 200×4. WAN Windows→`:3101` classified **client path noise** — must not drive capacity NO-GO when VPS-local SoT PASS.
- **PROCESS:** RERUN3 file retained (historical); RERUN4 is additive. `verify:qc:evidence-pack` NFR false-negative (UF/CRUD/J-*) remains recurring P2 — adjudicate out-of-slice for this NFR gate.
- **Governance:** DO-W5 PG headroom **superseded** as P0 for timeout@600; may reopen only if optional 5min re-probe fails or PG saturation proven under longer hold.

## Residual / conditions (GWC)

| ID | Sev | Owner | Required action | Exit evidence |
|----|-----|-------|-----------------|---------------|
| `COND-SCALE-W3-HOLD-5MIN` | **P2 NFR** | **devops** (optional) | Optional re-probe **1000 VU × ≥5 min** hold via VPS-local `:3101`; if FAIL, reopen capacity cliff with new ceiling | New raw+console + QC note |
| `COND-SCALE-W3-T-P95-SUM-1000` | **P2 NFR** | **dev-be** / devops (optional) | Reduce summary p95 @1000 toward **&lt;1s** (query/cache/index) **or** signed waiver owner+expiry if product accepts list-primary SLA | Re-probe summary p95 or waiver record |
| `COND-SCALE-W3-TIMEOUT-600` | — | — | **CLOSED** this gate | RERUN4 + DO-W4 VPS raw |
| DO-W5 PG headroom | — | — | **SUPERSEDED** as P0 (timeout cliff cleared) | — |
| Standing claim limit | **P0 governance** | **pm** | May state **NFR GWC**: VPS-local LB **1000 VU / 45s / 0% err / list p95&lt;2s** — **must not** claim full ADR T-CONC 5min PASS, Phase 1 DONE, or PROD-READY | ADR §6 + SERVICE_READINESS wording |
| UF / J-* | — | — | **No promote** | — |

## Gate decision

| Criterion | QC result |
|-----------|-----------|
| Topology 2× + LB live (spot-check) | **PASS** |
| Capacity SoT = VPS-local (WAN discarded) | **PASS — stated** |
| Error &lt;1% @1000 + list p95 &lt;2s (45s hold) | **PASS** |
| Hold = ADR 5min | **CONDITION** (`COND-SCALE-W3-HOLD-5MIN`) |
| T-P95-SUM &lt;1s @1000 | **CONDITION** (`COND-SCALE-W3-T-P95-SUM-1000`) |
| `COND-SCALE-W3-TIMEOUT-600` | **CLOSED** |
| Full unconditional T-CONC GO | **NO** — GWC only |
| UF / J-* promote | **NO** |
| Phase 1 / PROD claim | **NO** |
| ADR updated (this gate) | **PASS** — §Status / §Evidence / §6 W3 RERUN4 |

## Evidence-pack note

NFR probe packs routinely fail `verify:qc:evidence-pack` on `journey_l25` / `crud_or_matrix` (out-of-slice). Gate integrity rests on DO-W4 MD + named raw JSON + topology spot-check — **not** UF browser matrix.

## PM dispatch hint

`pm_dispatch_hint: P1-HRM-SCALE-QC-W3-RERUN4 = GWC — close COND-SCALE-W3-TIMEOUT-600; supersede DO-W5 P0; optional COND-SCALE-W3-HOLD-5MIN + COND-SCALE-W3-T-P95-SUM-1000; update SERVICE_READINESS concurrency wording; no UF promote; not Phase1/PROD.`

## Handoff packet

- **completion_report:** QC re-gated T-CONC after DO-W4 **VPS-local** SoT. Topology **CONFIRMED LIVE** (3101/3001/3011/8088 = 200). Authoritative raw: **400→1000 all PASS**, `t_conc_met=true`, list p95 **1481 ms**, error **0%**. RERUN3 NO-GO ceiling 400 **superseded** (WAN noise). **`COND-SCALE-W3-TIMEOUT-600` CLOSED.** Verdict **GO WITH CONDITIONS** — hold **45s vs ADR 5min**; **T-P95-SUM 1183 ms** @1000. DO-W5 PG headroom **superseded**. Not Phase 1 / not PROD; no UF promoted.
- **next_owner:** `pm`
- **evidence_path:** `docs/qa/evidence/qc-p1-hrm-scale-w3-rerun4-20260717.md`
- **ack_status:** **PASS_TO_PM**

### next_dispatch_prompt

```text
work_item_id: P1-HRM-SCALE-PM-W3-GWC-CLOSE
from_role: pm
to_role: pm
subagent_type: pm
entry_criteria: QC P1-HRM-SCALE-QC-W3-RERUN4 GO WITH CONDITIONS — VPS-local LB 1000 VU PASS (0% err, list p95 1481ms, 45s holds); COND-SCALE-W3-TIMEOUT-600 CLOSED; DO-W5 PG-HEADROOM SUPERSEDED; WAN not SoT
read_first:
  - docs/qa/evidence/qc-p1-hrm-scale-w3-rerun4-20260717.md
  - docs/qa/evidence/p1-hrm-scale-do-w4-20260717.md
  - docs/qa/evidence/_p1-hrm-scale-do-w4-t-conc-raw-20260717.json
  - docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md §5.5 / §6 W3
actions:
  1) Update TEAM_WORKING_NOW / SERVICE_READINESS: NFR GWC concurrency = 1000 VU VPS-local 45s holds — do NOT claim full ADR 5min T-CONC PASS, Phase1 DONE, or PROD
  2) Cancel / defer P1-HRM-SCALE-DO-W5-PG-HEADROOM as P0 (superseded) unless optional 5min hold re-probe is scheduled
  3) Optional residual owners: devops COND-SCALE-W3-HOLD-5MIN (1000 VU × 5min VPS-local); dev-be/devops COND-SCALE-W3-T-P95-SUM-1000 (summary p95 1183→&lt;1s) OR signed waiver
  4) Do NOT dispatch UF promote / Phase1 gate from this NFR evidence
cấm: claim Phase1/PROD; promote UF from probe; treat WAN Windows→:3101 as capacity FAIL; reopen TIMEOUT-600 without VPS-local regression; seed
```
