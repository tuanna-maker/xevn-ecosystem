# QC Gate — P1-HRM-SCALE-QC-W3

- work_item_id: `P1-HRM-SCALE-QC-W3`
- date: `2026-07-17`
- from_role: `qc`
- to_role: `pm`
- ack_status: **PASS_TO_PM**
- evidence_path: `docs/qa/evidence/qc-p1-hrm-scale-w3-20260717.md`
- source_evidence: `docs/qa/evidence/p1-hrm-scale-w3-t-conc-20260717.md`
- raw_artifact: `docs/qa/evidence/_p1-hrm-scale-w3-t-conc-raw.json`
- adr_ref: `docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md` §5.5 T-CONC / §6 W3
- portal_url: `PORTAL_DEV_URL=http://14.225.217.232:8088`

## Verdict

**NO-GO for T-CONC promotion.**

The HRM concurrency gate **does not prove 1000-user readiness**. The highest stage that passed both ADR gates is **50 VU**. At **100 VU**, the error budget broke at **1.50%**. At **200 VU**, both error and list latency gates failed, with list p95 **2510 ms**. The **400 VU** stage aborted with client timeouts and transient post-stage health failure; the stack recovered afterward.

This is a bounded NFR verdict only. It is **NOT Phase 1 DONE**, **NOT PROD-READY**, and promotes **no UF/J-* user flow** because the evidence is a read-only API load probe, not U65 browser acceptance.

## Command table

| Command | Exit | Verdict | Classification | Notes |
|---------|-----:|---------|----------------|-------|
| `node scripts/load/hrm-t-conc-load.mjs` | 0 | **FAIL** | PRODUCT/NFR capacity | Script completed safely; `t_conc_met=false`; max passing VU = 50 |
| `pnpm run verify:qc:evidence-pack -- --evidence "docs/qa/evidence/p1-hrm-scale-w3-t-conc-20260717.md"` | 1 | **FAIL** | PROCESS evidence-pack | Source evidence has metrics/remediation but lacks formal `## Residual` heading; QC still used it as source data and records residuals here |
| VPS post-recovery smoke: portal + HRM root + metrics | 0 | **PASS** | ENV recovery | Source evidence records `:8088` 200, HRM root 200, metrics 200 after 400 VU abort |

## T-CONC Measurement Matrix

| VU | Error rate | 429 rate | 5xx rate | List p95 | Gate result | QC interpretation |
|----:|-----------:|---------:|---------:|---------:|-------------|-------------------|
| 25 | 0.00% | 0% | 0% | 363 ms | **PASS** | Below target, healthy |
| 50 | 0.19% | 0% | 0% | 495 ms | **PASS** | **Measured passing ceiling** |
| 100 | 1.50% | 0% | 0% | 872 ms | **FAIL** | Error budget broken |
| 200 | 1.73% | 0% | 0% | 2510 ms | **FAIL** | Error and list p95 broken |
| 400 | 15.58% | 0% | 0% | 10533 ms | **FAIL / aborted** | Timeout saturation and transient health failure |

## L2.5 J-* journeys

| Journey ID | Account | Click path | Expected | Actual | Verdict |
|------------|---------|------------|----------|--------|---------|
| N/A — NFR read-only probe | `ceo@xe.vn` auth token | API load only; no browser click path | No UF promotion from probe | No browser L2.5 evidence executed in this work item | **NOT PROMOTED** |

## Read-only matrix

| Module / D-row | C | R | U | D | Negative case | Verdict |
|----------------|---|---|---|---|---------------|---------|
| HRM Employees hot path | N/A | `GET /employees?page=1&page_size=50` | N/A | N/A | timeout saturation at 100+ VU | **NO-GO T-CONC** |
| HRM Employees Summary | N/A | `GET /employees/summary` | N/A | N/A | timeout saturation under higher stages | **NO-GO T-CONC** |

## Classification (ENV vs PRODUCT)

- **PRODUCT/NFR capacity defect:** T-CONC target unmet. Current stack cannot claim 1000 concurrent authenticated HRM users; measured passing ceiling is **50 VU**.
- **ENV residual:** Local `pnpm run qc:fe-be-health` in source evidence failed because the agent host stack was not running; QC does **not** use that local ENV failure as product NO-GO. VPS target recovered after the aborted 400 VU stage.
- **Process residual:** Source evidence-pack verifier failed one check (`residual_section`). This QC evidence records the missing residual/owner table and keeps the NFR verdict bounded.

## Residual

| ID | Owner | Required action | Exit evidence |
|----|-------|-----------------|---------------|
| `P1-HRM-SCALE-DO-W2` | `devops` | Tune HRM API / PostgreSQL pool, add `pg_pool_waiting_count` visibility, document runbook delta | `docs/qa/evidence/p1-hrm-scale-do-w2-20260717.md` or equivalent DevOps evidence |
| `P1-HRM-SCALE-BE-W2` | `dev-be` | Add/verify covering indexes and reduce repeated COUNT/query pressure on list hot path | BE evidence with migration/EXPLAIN and regression tests |
| `P1-HRM-SCALE-W3-T-CONC-RERUN` | `devops` + `qa` + `qc` | Re-run staged probe after DO-W2 + BE-W2 remediation with stages `50,100,200,400,600,800,1000`; hold target per ADR | New raw JSON + QC re-gate evidence |

## Gate Decision

| Criterion | QC result |
|-----------|-----------|
| T-CONC 1000 VU sustained | **NO-GO** |
| Error rate < 1% at target | **NO-GO**; failed from 100 VU |
| List p95 < 2s at target | **NO-GO**; failed at 200+ VU |
| 429/rate-limit diagnosis | **PASS diagnostic**; 0% 429, so bottleneck is not rate-limit bucket |
| Stack recovery after probe | **PASS with caution**; recovered after transient 400 VU failure |
| U65 integrity | **PASS**; read-only, no seed, no write endpoints |
| UF/J-* promotion | **NO**; no UF promoted from probe |

## PM dispatch hint

`pm_dispatch_hint: P1-HRM-SCALE-DO-W2 + P1-HRM-SCALE-BE-W2 — close pool/index/query residuals, then re-run T-CONC and dispatch P1-HRM-SCALE-QC-W3-RERUN.`

## Handoff packet

- **completion_report:** QC audited W3 concurrency evidence and raw JSON. T-CONC is **NO-GO**; max passing stage is **50 VU**. 1000-user readiness is not proven. No UF/J-* row is promoted from this probe. Residual owners are DevOps (`P1-HRM-SCALE-DO-W2`) and Dev-BE (`P1-HRM-SCALE-BE-W2`), followed by a re-probe and QC re-gate.
- **next_owner:** `pm`
- **evidence_path:** `docs/qa/evidence/qc-p1-hrm-scale-w3-20260717.md`
- **ack_status:** **PASS_TO_PM**

### next_dispatch_prompt

```text
work_item_id: P1-HRM-SCALE-BE-W2
from_role: pm
to_role: dev-be
subagent_type: dev-be
entry_criteria: QC P1-HRM-SCALE-QC-W3 NO-GO; T-CONC max passing VU=50; 100 VU error=1.50%; 200 VU list p95=2510ms; DO-W2 devops pool tuning already dispatched
read_first: docs/qa/evidence/qc-p1-hrm-scale-w3-20260717.md; docs/qa/evidence/p1-hrm-scale-w3-t-conc-20260717.md; docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md §5.4-§6 W2
exit_criteria: covering index/query-count remediation evidence; EXPLAIN or equivalent list hot-path proof; regression tests for stable ORDER BY/scope; READY_FOR_QA/PASS_TO_PM with re-probe entry notes
evidence_path: docs/qa/evidence/p1-hrm-scale-be-w2-20260717.md
cấm: seed; direct DB fake acceptance; claim T-CONC PASS without re-probe; regress scope parity/list ordering
```
