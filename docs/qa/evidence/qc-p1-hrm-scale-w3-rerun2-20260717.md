# QC Gate — P1-HRM-SCALE-QC-W3-RERUN2 (T-CONC re-gate after DO-W3 rate-limit raise)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-SCALE-QC-W3-RERUN2` |
| **date** | `2026-07-17` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/qc-p1-hrm-scale-w3-rerun2-20260717.md` |
| **source_evidence** | `docs/qa/evidence/p1-hrm-scale-do-w3-20260717.md` |
| **raw_artifact** | `docs/qa/evidence/_p1-hrm-scale-do-w3-t-conc-raw-20260717.json` |
| **prior_gates** | `qc-p1-hrm-scale-w3-20260717.md` (NO-GO, 50 VU) → `qc-p1-hrm-scale-w3-rerun-20260717.md` (NO-GO, 200 VU, 429@400) |
| **adr_ref** | `docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md` §5.5 T-CONC / §6 W3 |
| **deploy_ref** | DO-W3: `HRM_RATE_LIMIT_MAX` / `XBOS_RATE_LIMIT_MAX` / `RATE_LIMIT_MAX` = **120000**/60s on Dev8088; `.env` backup `.env.bak-do-w3-20260717224533`; `hrm-be` recreated `--no-deps` |
| **portal_url** | `PORTAL_DEV_URL=http://14.225.217.232:8088` |

## Verdict

**NO-GO for T-CONC 1000-user promotion — WITH condition `COND-SCALE-W3-RATE-LIMIT-400` CLOSED and ceiling re-documented at 400 VU.**

The DO-W3 rate-limit raise (10k → **120000** req/min, verified in-container) cleared the prior 429 cliff exactly as diagnosed: at **400 VU** the re-probe recorded **0.00% error, 0% 429, list p95 944 ms** (< 2 s budget) over 13,693 requests — both ADR gates PASS. Max passing ceiling moves **200 → 400 VU** (progression across the day: 50 → 200 → 400, an 8× improvement from baseline).

**T-CONC (1000 VU, error <1%, list p95 <2s) remains NOT met.** The ramp aborted at **600 VU** on **client timeouts (`status=0`, 14.33% error, list p95 2247 ms)** with **zero** 429 and zero 5xx; stages 800/1000 were never run. The failure class has shifted again — from rate-limit budget (tunable, now closed) to **single `hrm-be` process capacity** at ~300+ RPS. The exact next remediation is horizontal: ≥2 `hrm-be` replicas behind the nginx `least_conn` upstream with a split `PG_POOL_MAX` budget (compose currently blocks this via fixed `container_name` + direct `:3001` host publish).

This is a **bounded NFR verdict only**: **NOT Phase 1 DONE**, **NOT PROD-READY**, and **no UF / J-* row is promoted** — the evidence is a read-only GET load probe, not U65 browser acceptance.

## Command table

| Command | Exit | Verdict | Classification | Notes |
|---------|-----:|---------|----------------|-------|
| `node scripts/load/hrm-t-conc-load.mjs` (stages 400→1000, hold 45s) | 0 | **FAIL (T-CONC)** | PRODUCT/NFR capacity | Raw JSON: `t_conc_met=false`; `max_passing_vu=400`; `measured_ceiling_vu=600`; `blocked_reason: errorRate=0.1433 at 600 VU` |
| `pnpm run verify:qc:evidence-pack -- --evidence "docs/qa/evidence/p1-hrm-scale-do-w3-20260717.md"` | 1 | **FAIL (2/8)** | PROCESS evidence-pack | Failing checks (`journey_l25`, `crud_or_matrix`) are UF/browser-pack requirements **not applicable** to a read-only NFR probe — same adjudication as both prior W3 gates; P2 NFR-profile follow-up already logged (3rd consecutive occurrence) |
| `pnpm run qc:dev-stack` | 1 | FAIL (local) | ENV local-only | Localhost `:28001/:28002/:5173` not running on QC workstation — **not** the probe target; remote Dev8088 spot-checked instead |
| Remote spot-check `GET :3001/api/hrm/` + `GET :8088/` | 0 | **PASS** | ENV recovery | HRM root **200**, portal **200** post-probe; unauthenticated `/employees` returns 401 `HRM-AUTH-001` (auth guard intact — probe used login token) |

## T-CONC measurement matrix (DO-W3 re-probe)

| VU | Requests | Error rate | 429 rate | 5xx | list p95 (ms) | summary p95 (ms) | RPS | Error-budget gate | List p95 gate | Post-health | QC interpretation |
|----:|---------:|-----------:|---------:|----:|--------------:|-----------------:|----:|:------------------|:--------------|:------------|-------------------|
| **400** | 13693 | **0.00%** | **0%** | 0% | **944** | 853 | 296.3 | **PASS** | **PASS** | PASS (200/200) | Prior 429 cliff **cleared** — new measured passing ceiling |
| **600** | 8703 | **14.33%** | 0% | 0% | **2247** | 2045 | 307.0 | **FAIL** | **FAIL** | PASS (200/200) | 1247× `status=0` client timeouts — single-process saturation, **not** rate-limit, **not** DB 5xx |
| 800 / 1000 | — | — | — | — | — | — | — | NOT REACHED | NOT REACHED | — | Ramp aborted after 600-VU error budget breach |

## Before vs after (rerun → rerun2)

| Metric | W3 baseline | DO-W2 rerun | **DO-W3 rerun2 (this gate)** |
|--------|------------|-------------|------------------------------|
| Max passing VU (both ADR gates) | 50 | 200 | **400** |
| 400 VU error / 429 rate | — | 8.93% / 8.93% FAIL | **0.00% / 0% PASS** |
| 400 VU list p95 | — | 1077 ms | **944 ms** |
| Cliff class at ceiling | pool/client timeout | HTTP 429 rate-limit | **client timeout (`status=0`) @600 VU** |
| `COND-SCALE-W3-RATE-LIMIT-400` | — | OPEN (created) | **CLOSED** |
| T-CONC 1000 VU | NOT REACHED | NOT REACHED | **NOT REACHED — still NO-GO** |

## L2.5 J-* journeys

| Journey ID | Account | Click path | Expected | Actual | Verdict |
|------------|---------|------------|----------|--------|---------|
| N/A — NFR read-only probe | `ceo@xe.vn` token | API load only; no browser click path | No UF promotion from probe | No browser L2.5 evidence in this work item | **NOT PROMOTED** |

## Read-only matrix

| Module / hot path | C | R | U | D | Negative case | Verdict |
|-------------------|---|---|---|---|---------------|---------|
| HRM Employees list `GET /employees?page=1&page_size=50` | N/A | ≤400 VU **PASS** | N/A | N/A | timeout saturation @600 VU | **NO-GO T-CONC 1000** / ceiling 400 VU |
| HRM Employees `GET /employees/summary` | N/A | ≤400 VU **PASS** | N/A | N/A | timeout saturation @600 VU | **NO-GO T-CONC 1000** / ceiling 400 VU |

## Classification (ENV vs PRODUCT vs PROCESS)

- **PRODUCT/NFR capacity (open):** T-CONC 1000-user target unmet. Single-instance `hrm-be` on Dev8088 sustains **≤400 concurrent** authenticated read users within ADR gates; 600 VU saturates the single Nest process (~300 RPS) into client timeouts. Remediation class = **horizontal replicas + pool split**, no longer rate-limit or DB-pool.
- **CONDITION CLOSED (not a defect):** `COND-SCALE-W3-RATE-LIMIT-400` — rate-limit budget 120000/min removed the 429 cliff at 400 VU (0% 429, 13,693/13,693 OK). DO-W3 remediation is **effective and validated** against its target class.
- **PROCESS residual (recurring 3rd time):** `verify:qc:evidence-pack` fails `journey_l25`/`crud_or_matrix` on NFR probes — false-negative; verdict stands on raw JSON. QA follow-up to add an NFR-probe profile remains open (P2, escalate as recurring pattern per QC preventive-action mandate).
- **PROCESS observation (workstation):** QC workstation OneDrive path exists in multiple Unicode-normalization variants (`Tài liệu` NFC/NFD trees), splitting evidence files across trees; this gate file is written to both to keep git + verifier consistent. Owner: devops/PM hygiene note, P3 — does not affect the Dev8088 measurement.
- **ENV:** No product ENV blocker — Dev8088 stack healthy post-probe (hrm root 200, portal 200); local `qc:dev-stack` FAIL is workstation-only and out of scope for a remote probe gate.

## Residual / conditions

| ID | Sev | Owner | Required action | Exit evidence |
|----|-----|-------|-----------------|---------------|
| `COND-SCALE-W3-TIMEOUT-600` | **P0 NFR** | **devops** (`P1-HRM-SCALE-DO-W4-REPLICA`) | Enable ≥2 `hrm-be` replicas: remove/relax fixed `container_name`; add `hrm-be-2` (host `3011` or compose scale); wire `deploy/nginx/upstream-replicas.conf` `least_conn`; split `PG_POOL_MAX` (e.g. 20+20, Σ ≤ Postgres headroom); route probe via LB; re-probe 600→800→1000 VU | New raw JSON + QC re-gate |
| `T-CONC 1000 VU` | P0 NFR | pm → devops | Remains **OPEN** until a staged probe reaches 1000 VU within error <1% / list p95 <2s | QC GO on fresh probe |
| Runtime `start:dev` overhead | P1 | devops | Prefer `node dist/main` for load windows (same class as DO-W2 xbos restore) | Included in DO-W4 evidence |
| `verify:qc:evidence-pack` NFR profile | P2 PROCESS (recurring ×3) | qa | Add NFR-probe profile so read-only load evidence is not scored against UF/CRUD/J-* checks | Script update + green run |
| `BE-W3` keyset cursor | deferred | dev-be | Only if list p95 still fails **after** replicas + pool split (ADR Option C) | — |

## Gate decision

| Criterion | QC result |
|-----------|-----------|
| Max passing ceiling re-documented | **PASS** — **400 VU** (was 200; baseline 50) |
| `COND-SCALE-W3-RATE-LIMIT-400` closed | **PASS — CLOSED** (0% 429 @400 VU, gates PASS) |
| T-CONC 1000 VU sustained | **NO-GO** — ramp stopped at 600 VU; 800/1000 not run |
| Error rate <1% at 1000 VU target | **NO-GO** — target never reached; 600 VU error 14.33% (all `status=0`) |
| List p95 <2s | **PASS up to 400 VU** (944 ms); FAIL @600 (2247 ms) |
| Failure-class diagnosis | **PASS** — shifted rate-limit → single-process capacity; next lever = replicas |
| Stack recovery post-probe | **PASS** — Dev8088 hrm/portal 200; non-xevn containers undisturbed |
| U65 integrity | **PASS** — read-only, zero-seed, no write endpoints |
| UF / J-* promotion | **NO** — no UF promoted from probe |
| Phase 1 / PROD claim | **NO** |
| ADR updated (ceiling 400 + gate refs) | **PASS** — §Status/§Evidence/§6 W3 reflect rerun2 |

## PM dispatch hint

`pm_dispatch_hint: P1-HRM-SCALE-DO-W4-REPLICA (P0) — devops enables ≥2 hrm-be replicas behind nginx least_conn with split PG_POOL_MAX and prod-mode runtime, re-probes 600→1000 VU, then fresh QC re-gate (P1-HRM-SCALE-QC-W3-RERUN3). Alternative sponsor decision: cap UAT concurrency at the proven 400-VU ceiling and close T-CONC as bounded. Either way T-CONC stays OPEN until 1000-VU proof or explicit sponsor cap.`

## Handoff packet

- **completion_report:** QC re-gated T-CONC after DO-W3. Rate-limit condition `COND-SCALE-W3-RATE-LIMIT-400` **CLOSED** (0% 429 @400 VU); max passing ceiling re-documented **400 VU** (was 200). **T-CONC 1000-user readiness still NOT proven (NO-GO)** — 600 VU aborts on single-process client timeouts; 800/1000 unrun. New P0 residual `COND-SCALE-W3-TIMEOUT-600` → devops replica wave `P1-HRM-SCALE-DO-W4-REPLICA`. ADR §6 W3 updated with rerun2 gate. Not Phase 1, not PROD; no UF/J-* promoted (read-only NFR probe, U65-clean).
- **next_owner:** `pm` → `devops`
- **evidence_path:** `docs/qa/evidence/qc-p1-hrm-scale-w3-rerun2-20260717.md`
- **ack_status:** **PASS_TO_PM**

### next_dispatch_prompt

```text
work_item_id: P1-HRM-SCALE-DO-W4-REPLICA
from_role: pm
to_role: devops
subagent_type: devops
entry_criteria: QC P1-HRM-SCALE-QC-W3-RERUN2 NO-GO (T-CONC 1000 unmet); COND-SCALE-W3-RATE-LIMIT-400 CLOSED (rate-limit 120000/min live); ceiling 400 VU; 600 VU fails on client timeouts status=0 (0% 429, 0% 5xx) — single hrm-be process saturation ~300 RPS
read_first:
  - docs/qa/evidence/qc-p1-hrm-scale-w3-rerun2-20260717.md
  - docs/qa/evidence/p1-hrm-scale-do-w3-20260717.md (§B replica constraints: fixed container_name, :3001 direct publish, nginx upstream-replicas.conf unused)
  - docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md §5.5 T-CONC / §6 W3
exit_criteria: (1) ≥2 hrm-be replicas live: relax fixed container_name, add hrm-be-2 (host 3011 or compose scale), nginx least_conn via deploy/nginx/upstream-replicas.conf; (2) split PG_POOL_MAX across replicas (e.g. 20+20; Σ ≤ Postgres headroom, raise max_connections first if needed); (3) prefer node dist/main runtime for load window; (4) re-probe staged 400→600→800→1000 VU, 45s+ holds, via LB path; (5) capture per-stage error/429/5xx/list p95 + pg_pool_waiting_count; (6) if 1000 still unmet, document new ceiling + bottleneck class OR escalate sponsor decision to cap UAT at proven ceiling
evidence_path: docs/qa/evidence/p1-hrm-scale-do-w4-20260717.md
next: PASS_TO_PM → dispatch qc P1-HRM-SCALE-QC-W3-RERUN3 re-gate
cấm: seed; claim T-CONC PASS without 1000-VU staged proof (error<1% & list p95<2s); promote UF from probe; disturb non-xevn containers
```
