# QC Gate — P1-HRM-SCALE-QC-W3-RERUN3 (T-CONC re-gate after DO-W4 replicas + LB)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-SCALE-QC-W3-RERUN3` |
| **date** | `2026-07-17` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/qc-p1-hrm-scale-w3-rerun3-20260717.md` |
| **source_evidence** | `docs/qa/evidence/p1-hrm-scale-do-w4-20260717.md` |
| **console_artifact (authoritative metrics)** | `docs/qa/evidence/_p1-hrm-scale-do-w4-t-conc-console-20260717.txt` |
| **named_raw (stale / superseded run — see Classification)** | `docs/qa/evidence/_p1-hrm-scale-do-w4-t-conc-raw-20260717.json` |
| **prior_gates** | `qc-p1-hrm-scale-w3-20260717.md` (50 VU) → rerun (200 VU) → **rerun2** (400 VU, rate-limit CLOSED) |
| **adr_ref** | `docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md` §5.5 T-CONC / §6 W3 |
| **deploy_ref** | DO-W4: ≥2 `hrm-be` (`:3001`+`:3011`) + `hrm-api-lb` least_conn `:3101`; `PG_POOL_MAX` 20+20; `node dist/main`; probe via LB |
| **portal_url** | `PORTAL_DEV_URL=http://14.225.217.232:8088` · LB `http://14.225.217.232:3101/api/hrm` |

## Verdict

**NO-GO for T-CONC 1000-user promotion — WITH DO-W4 topology remediation CONFIRMED LIVE and ceiling re-affirmed at 400 VU (latency improved).**

DO-W4 delivered what RERUN2 required: **2× `hrm-be`** behind **`hrm-api-lb` `:3101` least_conn**, pool split **20+20**, both on **`node dist/main`**, probe routed **via LB**. QC spot-check (2026-07-17): `:3101` / `:3001` / `:3011` / `:8088` all **HTTP 200**. LB balance ~50/50 is documented in DO-W4 Prometheus counters.

**Ceiling still max passing 400 VU** (both ADR gates). At **400 VU**: error **0%**, 429 **0%**, list p95 **582 ms** (improved vs DO-W3 **944 ms**). At **600 VU**: error **17.5%** (`status=0` timeouts ×2340), 429 **0%**, list p95 **1755 ms** (still &lt;2s p95 gate but **error-budget FAIL**) — ramp aborted; **800/1000 not run**.

**`COND-SCALE-W3-TIMEOUT-600` remains OPEN.** Replicas cleared the single-process hypothesis as the sole blocker: aggregate RPS only rose ~300→~360 while 600 VU still cliffs on client timeouts. Bottleneck class = **shared Postgres / query / handler saturation under concurrent load**, not missing LB wiring and not rate-limit.

**T-CONC (1000 VU, error &lt;1%, list p95 &lt;2s) is still NOT PASS.** No UF / J-* promoted. **NOT Phase 1 DONE**, **NOT PROD-READY**.

**Next P0 (picked from ADR — no sponsor A/B):** `P1-HRM-SCALE-DO-W5-PG-HEADROOM` — measure PG under 600 VU (`pg_stat_activity`, CPU, `max_connections`, waiting), raise DB headroom if needed, then re-probe. **Defer 4× replicas until PG headroom proven.** Promote `BE-W3` keyset only if list p95 fails after DB headroom (at 600 VU list p95 still passes &lt;2s). Document proven UAT ceiling **400 VU** as standing GWC condition until 1000-VU proof or explicit capacity waiver with owner+expiry.

## Command table

| Command | Exit | Verdict | Classification | Notes |
|---------|-----:|---------|----------------|-------|
| DO-W4 load `hrm-t-conc-load.mjs` via LB stages 400→1000 | 0 (abort @600) | **FAIL (T-CONC)** | PRODUCT/NFR capacity | Console: `max_passing_vu=400`; `t_conc_met=false`; 600 VU `errorRate=0.175` all `status=0` |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-scale-do-w4-20260717.md` | 1 | **FAIL (2/8)** | PROCESS evidence-pack | Same NFR-profile false-negative (`journey_l25`, `crud_or_matrix`) as prior W3 gates — adjudicate out-of-slice |
| QC remote spot-check `:3101` `:3001` `:3011` `:8088` | 0 | **PASS** | ENV topology live | All **200** — replicas + LB confirmed reachable post-DO-W4 |
| `pnpm run qc:dev-stack` | — | SKIP | ENV local-only | Probe target is Dev8088 remote; local stack not required for this gate |

## Topology confirmation (exit #1)

| Criterion | Evidence | QC |
|-----------|----------|----|
| ≥2 hrm-be replicas | DO-W4: `xevn-hrm-be-dev` `:3001` + `xevn-hrm-be-2-dev` `:3011`; spot-check both 200 | **CONFIRMED** |
| nginx least_conn LB | `hrm-api-lb` host `:3101`; probe `HRM_API_BASE=…:3101/api/hrm`; ~50/50 Prometheus split | **CONFIRMED** |
| `PG_POOL_MAX` 20+20 | DO-W4 in-container `POOL1=20` `POOL2=20` | **CONFIRMED** (from DO evidence) |
| `node dist/main` | Both replicas `start:prod` | **CONFIRMED** (from DO evidence) |
| Probe via LB | Console + raw path use `:3101` | **CONFIRMED** |

## T-CONC measurement matrix (DO-W4 via LB — console SoT)

| VU | Requests | Error rate | 429 | 5xx | list p95 (ms) | summary p95 (ms) | RPS | Error-budget | List p95 | QC interpretation |
|----:|---------:|-----------:|----:|----:|--------------:|-----------------:|----:|:-------------|:---------|-------------------|
| **400** | 15122 | **0.00%** | **0%** | 0% | **582** | 491 | 327.9 | **PASS** | **PASS** | Ceiling held; latency improved vs 944 ms |
| **600** | 13370 | **17.50%** | **0%** | 0% | **1755** | 1675 | 359.9 | **FAIL** | **PASS** (&lt;2s) | Timeout cliff; `COND-SCALE-W3-TIMEOUT-600` **still OPEN** |
| 800 / 1000 | — | — | — | — | — | — | — | NOT REACHED | NOT REACHED | Aborted after 600 |

## Before vs after (rerun2 → rerun3)

| Metric | DO-W3 / QC rerun2 | **DO-W4 / QC rerun3 (this gate)** |
|--------|-------------------|-------------------------------------|
| Topology | 1× hrm-be `:3001` | **2× + LB `:3101` least_conn** |
| Max passing VU | **400** | **400** (unchanged) |
| 400 VU list p95 | 944 ms | **582 ms** (improved) |
| 600 VU error / list p95 | 14.33% / 2247 ms | **17.50%** / **1755 ms** |
| 429 @400/600 | 0% | **0%** |
| `COND-SCALE-W3-RATE-LIMIT-400` | CLOSED | CLOSED (unchanged) |
| `COND-SCALE-W3-TIMEOUT-600` | OPEN (created) | **OPEN — still** (replicas did not clear) |
| Bottleneck class | single Nest ~300 RPS | **shared capacity / PG-query saturation** (~360 RPS aggregate) |
| T-CONC 1000 | NOT | **NOT** |

## L2.5 J-* journeys

| Journey ID | Account | Click path | Expected | Actual | Verdict |
|------------|---------|------------|----------|--------|---------|
| N/A — NFR read-only probe | `ceo@xe.vn` token | API load via LB only | No UF promotion | No browser L2.5 in this work item | **NOT PROMOTED** |

## Read-only matrix

| Module / hot path | C | R | U | D | Negative case | Verdict |
|-------------------|---|---|---|---|---------------|---------|
| HRM Employees list via LB | N/A | ≤400 VU **PASS** | N/A | N/A | timeout cliff @600 VU | **NO-GO T-CONC 1000** / ceiling **400 VU** |
| HRM Employees summary via LB | N/A | ≤400 VU **PASS** | N/A | N/A | timeout cliff @600 VU | **NO-GO T-CONC 1000** / ceiling **400 VU** |

## Classification (ENV vs PRODUCT vs PROCESS)

- **PRODUCT/NFR capacity (open):** T-CONC 1000 unmet. Proven sustained concurrent read capacity on Dev8088 under ADR gates = **400 VU**. 600 VU fails error budget on client timeouts despite live 2×+LB. Condition `COND-SCALE-W3-TIMEOUT-600` **OPEN**.
- **PRODUCT/NFR remediation CLOSED (topology):** DO-W4 replicas+LB+pool-split+prod runtime — **applied and live** (spot-check PASS). Does **not** close timeout condition.
- **PROCESS residual (artifact integrity):** Named file `_p1-hrm-scale-do-w4-t-conc-raw-20260717.json` contains a **different / failed 400-VU-only** run (`errorRate≈0.90`, `max_passing_vu=null`) that **does not match** DO-W4 markdown or console. Authoritative stage metrics for this gate = **`_p1-hrm-scale-do-w4-t-conc-console-20260717.txt`** + DO-W4 MD table. Owner: devops — restore/overwrite named raw from the successful console run on next wave (P2 PROCESS).
- **PROCESS residual (recurring ×4):** `verify:qc:evidence-pack` fails UF/CRUD checks on NFR probes — verdict stands; NFR-profile still owed (qa, P2).
- **ENV:** Dev8088 topology healthy post-DO-W4 (LB + both replicas + portal 200). No ENV blocker for product NO-GO.

## Residual / conditions

| ID | Sev | Owner | Required action | Exit evidence |
|----|-----|-------|-----------------|---------------|
| `COND-SCALE-W3-TIMEOUT-600` | **P0 NFR** | **devops** (`P1-HRM-SCALE-DO-W5-PG-HEADROOM`) | Under / toward 600 VU: capture `pg_stat_activity`, PG CPU, `max_connections` headroom, `pg_pool_waiting_count` both replicas; raise Postgres/`PG_POOL_MAX` Σ **only if** saturation proven; re-probe 400→600→800→1000 via LB | New console+raw + QC RERUN4 |
| `T-CONC 1000 VU` | P0 NFR | pm → devops | OPEN until 1000 VU ADR gates or signed capacity waiver | QC GO / GWC with owner+expiry |
| Standing GWC note | P1 NFR | pm | Document proven UAT concurrency ceiling **400 VU** on Dev8088 until T-CONC met — **do not** claim 1000-user concurrency | ADR + SERVICE_READINESS wording |
| 4× replicas | deferred | devops | **Only after** PG headroom proven (DO-W4 showed 2× alone insufficient) | — |
| `BE-W3` keyset cursor | deferred | dev-be | **Only if** list p95 still fails ADR after DO-W5 (currently p95 OK @600; error budget is the cliff) | — |
| Named raw JSON restore | P2 PROCESS | devops | Align `_p1-hrm-scale-do-w4-t-conc-raw-20260717.json` to successful console run | File rewrite |
| `verify:qc:evidence-pack` NFR profile | P2 PROCESS (×4) | qa | NFR-probe profile exempting UF/CRUD/J-* | Script + green |

## Gate decision

| Criterion | QC result |
|-----------|-----------|
| Replicas + LB remediation applied (live) | **PASS — CONFIRMED** |
| Ceiling still max passing **400 VU** | **PASS — documented** (latency better @400) |
| `COND-SCALE-W3-TIMEOUT-600` still OPEN | **PASS — confirmed OPEN** |
| T-CONC 1000 VU | **NO-GO — NOT PASS** |
| Claim T-CONC PASS | **FORBIDDEN** |
| UF / J-* promote | **NO** |
| Phase 1 / PROD claim | **NO** |
| ADR updated (this gate) | **PASS** — §Status / §Evidence / §6 W3 |

## PM dispatch hint

`pm_dispatch_hint: P1-HRM-SCALE-DO-W5-PG-HEADROOM (P0) — devops measures/raises Postgres headroom under 600 VU cliff, then re-probes via LB; defer 4× replicas and BE-W3 until PG evidence; standing GWC = proven UAT ceiling 400 VU. Then QC P1-HRM-SCALE-QC-W3-RERUN4.`

## Handoff packet

- **completion_report:** QC re-gated T-CONC after DO-W4. Topology **CONFIRMED LIVE** (2× hrm-be + LB `:3101`, pool 20+20, `node dist/main`; spot-check 200). Ceiling **still 400 VU** with list p95 improved **944→582 ms**. `COND-SCALE-W3-TIMEOUT-600` **still OPEN** (17.5% timeouts @600 despite LB ~50/50). **T-CONC 1000 NOT PASS.** Next P0 = DO-W5 PG headroom (not 4× yet, not BE-W3 yet). Standing GWC: proven UAT concurrency **400 VU**. Not Phase 1 / not PROD; no UF promoted. Named raw JSON stale vs console — PROCESS note for devops.
- **next_owner:** `pm` → `devops`
- **evidence_path:** `docs/qa/evidence/qc-p1-hrm-scale-w3-rerun3-20260717.md`
- **ack_status:** **PASS_TO_PM**

### next_dispatch_prompt

```text
work_item_id: P1-HRM-SCALE-DO-W5-PG-HEADROOM
from_role: pm
to_role: devops
subagent_type: devops
entry_criteria: QC P1-HRM-SCALE-QC-W3-RERUN3 NO-GO (T-CONC 1000 unmet); DO-W4 2×+LB LIVE confirmed; ceiling still 400 VU (list p95 582 ms); COND-SCALE-W3-TIMEOUT-600 OPEN — 600 VU error 17.5% status=0 (0% 429); aggregate RPS ~360; list p95 still <2s @600 so BE keyset deferred
read_first:
  - docs/qa/evidence/qc-p1-hrm-scale-w3-rerun3-20260717.md
  - docs/qa/evidence/p1-hrm-scale-do-w4-20260717.md
  - docs/qa/evidence/_p1-hrm-scale-do-w4-t-conc-console-20260717.txt
  - docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md §5.5 T-CONC / §6 W3
exit_criteria: (1) Under load toward 600 VU capture pg_stat_activity + PG CPU + max_connections headroom + pg_pool_waiting_count on both replicas; (2) if saturated, raise Postgres max_connections / pool Σ with documented headroom math; (3) do NOT scale to 4× replicas until PG headroom proven; (4) re-probe staged 400→600→800→1000 via LB :3101; (5) restore/align named raw JSON to successful run; (6) if 1000 still unmet, document new ceiling + bottleneck class (standing GWC remains proven 400 VU until T-CONC or signed waiver)
evidence_path: docs/qa/evidence/p1-hrm-scale-do-w5-20260717.md
next: PASS_TO_PM → dispatch qc P1-HRM-SCALE-QC-W3-RERUN4
cấm: seed; claim T-CONC PASS without 1000-VU ADR gates; promote UF; ask sponsor A/B in chat; 4× replicas before PG proof
```
