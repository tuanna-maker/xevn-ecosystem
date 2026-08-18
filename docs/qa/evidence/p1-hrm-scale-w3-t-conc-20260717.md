# DevOps NFR — P1-HRM-SCALE-W3-T-CONC (T-CONC staged load)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-SCALE-W3-T-CONC` |
| **from_role** | `devops` |
| **to_role** | `pm` |
| **date** | 2026-07-17 |
| **environment** | VPS Dev8088 `http://14.225.217.232:8088` · HRM API direct `http://14.225.217.232:3001/api/hrm` |
| **persona / auth** | Group CEO `ceo@xe.vn` · `companyId=main` · `tenantId=xevn` (login via portal `/api/xbos/auth/login`) |
| **adr_ref** | `docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md` §5.5 **T-CONC** / §6 W3 |
| **scope_claim** | **NFR concurrency probe only** — read-only GET hot paths |
| **uf_claim** | **NO** — not browser UF / not L2.5 J-* |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **u65** | zero-seed · no DB mutate · no write endpoints |
| **ack_status** | **BLOCKED_TO_PM** |

---

## Purpose

Prove or bound **NFR-CONC-1k** (ADR **T-CONC**): ≥1000 concurrent authenticated users on HRM list/summary hot path with error rate **< 1%** and list p95 **< 2s** sustained. This probe is **API load evidence only** — does not promote UF matrix rows.

---

## Method

| Control | Value |
|---------|-------|
| Script | `scripts/load/hrm-t-conc-load.mjs` |
| Traffic | **GET-only** — alternates `GET /employees?page=1&page_size=50` and `GET /employees/summary` (simulates Employees mount fan-out after W1/W2) |
| Stages (VU) | `25 → 50 → 100 → 200 → 400` |
| Hold per stage | 45s (`T_CONC_STAGE_HOLD_MS=45000`) |
| Think time | 1s between iterations per VU |
| Abort | Rolling error rate > 5% mid-stage; post-stage health check; soft-abort if list p95 > 5× target |
| Targets | error rate **< 1%**; list p95 **< 2000 ms** (ADR T-P95-LIST) |
| Raw artifact | `docs/qa/evidence/_p1-hrm-scale-w3-t-conc-raw.json` |

**Command (executed 2026-07-17):**

```bash
$env:PORTAL_DEV_URL="http://14.225.217.232:8088"
$env:HRM_API_BASE="http://14.225.217.232:3001/api/hrm"
$env:T_CONC_STAGES="25,50,100,200,400"
$env:T_CONC_STAGE_HOLD_MS="45000"
node scripts/load/hrm-t-conc-load.mjs
```

Login: **OK**. Pre-health: **PASS** (HRM root 200 + employees probe 200).

---

## Results summary

| VU | Duration (s) | Requests | Error rate | 429 rate | 5xx rate | p50 (ms) | p95 (ms) | p99 (ms) | list p95 (ms) | summary p95 (ms) | RPS | Gates (err / p95) | Post-health |
|----|-------------:|---------:|-----------:|---------:|---------:|---------:|---------:|---------:|--------------:|-----------------:|----:|:------------------|:------------|
| 25 | 47.1 | 522 | **0.00%** | 0% | 0% | 166 | 340 | 431 | 363 | 293 | 11.1 | PASS / PASS | PASS |
| 50 | 48.9 | 1038 | **0.19%** | 0% | 0% | 154 | 459 | 681 | 495 | 450 | 21.2 | PASS / PASS | PASS |
| 100 | 53.3 | 1932 | **1.50%** | 0% | 0% | 147 | 881 | 10277 | 872 | 894 | 36.2 | **FAIL** / PASS | PASS |
| 200 | 57.2 | 3118 | **1.73%** | 0% | 0% | 428 | 2890 | 10229 | 2510 | 4010 | 54.6 | **FAIL** / **FAIL** | PASS |
| 400 | 66.1 | 2991 | **15.58%** | 0% | 0% | 2253 | 10523 | 30010 | 10533 | 10371 | 45.3 | **FAIL** / **FAIL** | **FAIL** (aborted) |

**Status code breakdown (failure mode):** failures are **`status=0`** (client timeout at 30s) — **not** HTTP 429 or 5xx. Saturation class = **connection / pool / single-replica throughput**, not app rate-limit bucket.

| Metric | ADR target | Observed |
|--------|------------|----------|
| **T-CONC** 1000 VU sustained | error < 1%; list p95 < 2s | **NOT REACHED** — ramp stopped at 400 VU |
| **Max passing VU** (both gates) | ≥ 1000 | **50 VU** |
| **Measured ceiling** | — | **~100–200 VU** (error budget breaks ≥100; latency budget breaks ≥200) |
| **Hard abort** | health preserved | **400 VU** — post-stage health FAIL + mid-stage abort |
| **429** | monitor | **0%** all stages |
| **Recovery** | stack must recover | **PASS** ~15:23 ICT — portal `:8088` 200, HRM `/api/hrm/` 200, metrics 200 |

---

## Gate adjudication (T-CONC)

| Criterion | Verdict | Notes |
|-----------|---------|-------|
| Staged ramp completed safely | **PASS** | Aborted at 400 VU per safety rules; no seed/writes |
| 1000 VU stage executed | **FAIL** | Stages did not include 1000; infra saturated earlier |
| Error rate < 1% at target load | **FAIL** | Exceeded at **100 VU** (1.50%) |
| List p95 < 2s at target load | **FAIL** at **200+ VU** | list p95 2510 ms @ 200 VU |
| Post-test stack health | **PASS** (recovered) | Transient FAIL immediately after 400 VU; recovered within minutes |
| **T-CONC met** | **NO** | `t_conc_met: false` in raw JSON |

**Decision:** **BLOCKED_TO_PM** — pilot VPS **cannot safely claim 1000 concurrent users** on current single hrm-api + pool sizing. **Measured passing ceiling: 50 VU** (full ADR gates). **Operational ceiling before health collapse: ~400 VU** (with unacceptable error/latency).

---

## Saturation / observability notes

- Prometheus `http_requests_total` on VPS shows heavy historical load on `/api/hrm/employees` (7024+) and `/employees/summary` (3884+) — consistent with probe + prior QA.
- **No 429** observed — prior `HRM_RATE_LIMIT_MAX=10000` tuning is not the bottleneck; **timeouts** dominate.
- Failure pattern matches ADR §7 **pool exhaustion / single-replica** risk class.
- Local L0 `pnpm run qc:fe-be-health` **FAIL** (ECONNREFUSED — dev stack not running on agent host); **VPS target used for NFR probe** per ADR Dev8088 pilot.

### Post-recovery smoke (2026-07-17 ~15:23 ICT)

| Endpoint | Result |
|----------|--------|
| `GET http://14.225.217.232:8088/` | **200** |
| `GET http://14.225.217.232:3001/api/hrm/` | **200** |
| `GET http://14.225.217.232:3001/api/hrm/metrics?format=prometheus` | **200** |

---

## Remediation (ordered — does not block W1/W2 FE CLOSED)

| Priority | work_item_id | Owner | Action |
|----------|--------------|-------|--------|
| P0 | `P1-HRM-SCALE-DO-W2` | devops | Tune PG pool (`pg_pool_waiting_count` alert); document in PRODUCTION_ENABLE_RUNBOOK delta |
| P1 | `P1-HRM-SCALE-BE-W2` | dev-be | Covering indexes + reduce double-COUNT on list (ADR W2) |
| P1 | `P1-HRM-SCALE-DO-W3-REPLICA` | devops | Horizontal hrm-api replicas behind proxy; re-run T-CONC after W2 |
| P2 | `P1-HRM-SCALE-BE-W3` | dev-be | Keyset cursor **only if** p95 still fails after pool+index |

**Re-test entry:** After DO-W2 pool + BE-W2 indexes deployed → re-run same script with stages `50,100,200,400,600,800,1000` and **5 min hold** (`T_CONC_STAGE_HOLD_MS=300000`) per ADR literal.

---

## Command table

| Command | Result | Notes |
|---------|--------|-------|
| `node scripts/load/hrm-t-conc-load.mjs` (stages 25–400) | **COMPLETE** exit 0 | Raw JSON written; T-CONC unmet |
| VPS post-recovery smoke (portal + HRM + metrics) | **PASS** | External from agent host |
| `pnpm run qc:fe-be-health` (local) | **FAIL** | Local stack down — not probe target |

---

## Handoff packet

- **completion_report:** Executed read-only staged concurrency probe against VPS Dev8088/HRM:3001. **T-CONC NOT MET.** Max **50 VU** passes error+p95 gates; degradation from **100 VU** (timeouts); **400 VU** abort + transient health FAIL; stack recovered. Zero 429; zero seed/writes. **Does not** claim UF PASS or PROD-READY.
- **next_owner:** `pm` → dispatch `P1-HRM-SCALE-DO-W2` (pool) + optional `P1-HRM-SCALE-QC-W3` after remediation re-test
- **evidence_path:** `docs/qa/evidence/p1-hrm-scale-w3-t-conc-20260717.md`
- **ack_status:** **BLOCKED_TO_PM**

### next_dispatch_prompt (QC NFR gate — conditional on remediation)

```text
work_item_id: P1-HRM-SCALE-QC-W3
from_role: pm
to_role: qc
subagent_type: qc
entry_criteria: P1-HRM-SCALE-W3-T-CONC evidence present; COND-SCALE-W3-CONC open; W1/W2 FE CLOSED
read_first: docs/qa/evidence/p1-hrm-scale-w3-t-conc-20260717.md; docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md §5.5 T-CONC; qc-p1-hrm-scale-w1/w2-20260717.md
exit_criteria: Gate T-CONC evidence — if t_conc_met false → GWC/NO-GO with measured ceiling 50 VU + remediation owners; do NOT claim Phase1/PROD; PASS_TO_PM
evidence_path: docs/qa/evidence/qc-p1-hrm-scale-w3-20260717.md
cấm: seed; promote UF from probe; claim PROD from load test alone
```

### next_dispatch_prompt (capacity remediation — primary)

```text
work_item_id: P1-HRM-SCALE-DO-W2
from_role: pm
to_role: devops
subagent_type: devops
entry_criteria: P1-HRM-SCALE-W3-T-CONC BLOCKED — max_passing_vu=50; timeouts not 429; ADR W2 DO lane OPEN
read_first: docs/qa/evidence/p1-hrm-scale-w3-t-conc-20260717.md; ADR §3.3 §6 W2; docs/ops/PRODUCTION_ENABLE_RUNBOOK.md
exit_criteria: PG pool sized + pg_pool_waiting_count observable under 100 VU smoke; runbook delta; PASS_TO_PM or measured improvement vs 50 VU ceiling
evidence_path: docs/qa/evidence/p1-hrm-scale-do-w2-20260717.md
cấm: seed; docker compose down; disturb non-xevn stacks; claim T-CONC PASS without re-probe
```
