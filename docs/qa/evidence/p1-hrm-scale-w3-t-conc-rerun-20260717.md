# DevOps NFR — P1-HRM-SCALE-W3-T-CONC re-run (post DO-W2 + BE-W2)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-SCALE-W3-T-CONC-RERUN` (parent `P1-HRM-SCALE-DO-W2-DEPLOY-BE-W2`) |
| **from_role** | `devops` |
| **to_role** | `qc` / `pm` |
| **date** | 2026-07-17 |
| **environment** | VPS Dev8088 `http://14.225.217.232:8088` · HRM API direct `http://14.225.217.232:3001/api/hrm` |
| **persona / auth** | Group CEO `ceo@xe.vn` · `companyId=main` · `tenantId=xevn` |
| **adr_ref** | `docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md` §5.5 **T-CONC** |
| **deploy_ref** | `docs/qa/evidence/p1-hrm-scale-do-w2-20260717.md` · git `2a7a02b` · `PG_POOL_MAX=40` · migration `0016` |
| **prior** | max passing **50 VU** — `p1-hrm-scale-w3-t-conc-20260717.md` / QC NO-GO |
| **scope_claim** | **NFR concurrency probe only** — read-only GET |
| **uf_claim** | **NO** |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **u65** | zero-seed · no DB mutate · no write endpoints |
| **ack_status** | **PASS_TO_PM** (improved ceiling documented; **T-CONC NOT met**) |

---

## Purpose

Re-measure **NFR-CONC-1k** after DO-W2 pool tuning + BE-W2 query-count / index remediation. Document improved capacity ceiling. **Do not** claim T-CONC PASS unless ADR gates hold at 1000 VU.

---

## Method

| Control | Value |
|---------|-------|
| Script | `scripts/load/hrm-t-conc-load.mjs` |
| Traffic | GET-only — alternates `GET /employees?page=1&page_size=50` and `GET /employees/summary` |
| Stages (VU) | `50 → 100 → 200 → 400 → 600 → 800 → 1000` |
| Hold per stage | 45s |
| Think time | 1s |
| Abort | Rolling error &gt; 5%; post-stage health; soft-abort list p95 &gt; 5× 2s |
| Targets | error rate **&lt; 1%**; list p95 **&lt; 2000 ms** |
| Raw artifact | `docs/qa/evidence/_p1-hrm-scale-w3-t-conc-rerun-raw-20260717.json` |

```powershell
$env:PORTAL_DEV_URL="http://14.225.217.232:8088"
$env:HRM_API_BASE="http://14.225.217.232:3001/api/hrm"
$env:T_CONC_STAGES="50,100,200,400,600,800,1000"
$env:T_CONC_STAGE_HOLD_MS="45000"
node scripts/load/hrm-t-conc-load.mjs
```

Login: **OK**. Pre-health: **PASS** (HRM root 200 + employees probe 200).

---

## Results summary

| VU | Requests | Error rate | 429 rate | 5xx rate | p50 (ms) | p95 (ms) | list p95 (ms) | summary p95 (ms) | RPS | Gates (err / p95) | Post-health |
|----|---------:|-----------:|---------:|---------:|---------:|---------:|--------------:|-----------------:|----:|:------------------|:------------|
| 50 | 2050 | **0.00%** | 0% | 0% | 92 | 222 | **257** | 196 | 44.8 | PASS / PASS | PASS |
| 100 | 4090 | **0.00%** | 0% | 0% | 90 | 238 | **260** | 184 | 88.8 | PASS / PASS | PASS |
| 200 | 8082 | **0.00%** | 0% | 0% | 96 | 298 | **313** | 247 | 174.4 | PASS / PASS | PASS |
| 400 | 7568 | **8.93%** | **8.93%** | 0% | 256 | 988 | 1077 | 710 | 289.4 | **FAIL** / PASS | **FAIL** (429) |

Stages **600 / 800 / 1000** not run — aborted after 400 VU post-health 429.

**Failure mode @ 400:** HTTP **429** (platform rate-limit), not pool timeouts (`status=0`). Class shifted from W3 baseline.

---

## Before vs after

| Metric | Prior W3 (2026-07-17) | This re-run |
|--------|----------------------|-------------|
| Max passing VU (both gates) | **50** | **200** |
| 100 VU error rate | 1.50% FAIL | **0.00% PASS** |
| 200 VU list p95 | 2510 ms FAIL | **313 ms PASS** |
| 400 VU | timeouts / health FAIL | **429** rate-limit / health FAIL |
| 429 rate (all stages ≤200) | 0% | 0% |
| T-CONC 1000 | NOT REACHED | **NOT REACHED** |

---

## Gate adjudication (T-CONC)

| Criterion | Verdict | Notes |
|-----------|---------|-------|
| ≥1000 VU sustained, err &lt;1%, list p95 &lt;2s | **FAIL** | Ramp stopped at 400 |
| Max passing VU | **200** | Improved vs prior 50 |
| Stack recovery post-probe | **PASS** | hrm/xbos/portal 200 within ~30s; `pg_pool_waiting_count=0` |
| Claim T-CONC PASS | **NO** | ADR gates unmet |

---

## Residual for QC / next wave

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| Rate-limit cliff @ 400 VU | P1 NFR | devops | Tune `RATE_LIMIT_*` for UAT load windows or DO-W3 replicas behind nginx |
| T-CONC 1000 still open | P0 NFR | pm → devops | Re-probe after rate-limit / replica |
| UF / J-* | — | qa | Not in this probe |

---

## Handoff packet

- **completion_report:** Re-probe after DO-W2+BE-W2: max passing **200 VU** (was 50); 400 VU blocked by **429**; **T-CONC NOT met**. Stack healthy post-test.
- **next_owner:** `qc`
- **evidence_path:** this file + `_p1-hrm-scale-w3-t-conc-rerun-raw-20260717.json` + `p1-hrm-scale-do-w2-20260717.md`
- **ack_status:** **PASS_TO_PM**

### next_dispatch_prompt

```text
work_item_id: P1-HRM-SCALE-QC-W3-RERUN
from_role: pm
to_role: qc
subagent_type: qc
entry_criteria: DO-W2 PASS_TO_PM — pool PG_POOL_MAX=40 + BE-W2 0016 on Dev8088; T-CONC re-probe raw JSON present
read_first:
  - docs/qa/evidence/p1-hrm-scale-do-w2-20260717.md
  - docs/qa/evidence/p1-hrm-scale-w3-t-conc-rerun-20260717.md
  - docs/qa/evidence/_p1-hrm-scale-w3-t-conc-rerun-raw-20260717.json
  - docs/qa/evidence/qc-p1-hrm-scale-w3-20260717.md (prior NO-GO ceiling 50 VU)
  - docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md §5.5 T-CONC
exit_criteria: Re-gate T-CONC — document improved ceiling (max passing 200 VU) vs prior 50; confirm T-CONC still NOT PASS (1000 unmet); residual rate-limit@400 as condition; NOT Phase1/PROD; evidence qc-p1-hrm-scale-w3-rerun-20260717.md
cấm: claim T-CONC PASS without 1000 VU ADR gates; promote UF from NFR probe; seed
```
