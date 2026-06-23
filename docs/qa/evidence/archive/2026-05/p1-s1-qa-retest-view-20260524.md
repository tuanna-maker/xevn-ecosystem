# P1-S1-QA-RETEST-VIEW — One-pass retest

**work_item_id:** `P1-S1-QA-RETEST-VIEW`  
**date:** 2026-05-24  
**owner:** qa  
**ack_status:** **PASS_TO_PM**

## Environment

| Service | Port | Health |
|---------|------|--------|
| hrm-api | 28001 | 200 |
| xbos-api | 28002 | 200 |
| web-portal | 5175 | 200 |

**Pre-check:** `pnpm run qc:dev-stack` exit 0; `pnpm run qc:fe-be-health` ALL PASS.

## Gate 1 — PHASE1-VIEW-GAPS-BE

**Command:** `pnpm run verify:phase1:view-completeness`  
**Evidence:** `docs/qa/evidence/phase1-view-completeness-20260523.md`

| Probe | HTTP | total | PASS |
|-------|------|------:|:----:|
| employees | 200 | 1100 | PASS |
| contracts | 200 | 1044 | PASS |
| insurance-expiring | 200 | 86 | PASS |
| requisitions | 200 | 20 | PASS |
| attendance | 200 | 2664 | PASS |
| payslips | 200 | 1760 | PASS |
| leave | 200 | 2 | PASS |
| catalogs | 200 | 14 | PASS |
| kpi-rollup | 200 | 0 | PASS |
| dept-templates | 200 | 0 | PASS |

**Result:** **10/10 PASS** (exit 0). Closes **QA01-D-02**, **QA01-D-03**, **QA01-D-04**.

## Gate 2 — QA01-D-01 (L1 system UAT)

**Command:** `pnpm run test:system:uat`  
**Report:** `docs/qa/evidence/system-integration-uat-report.json`

| Metric | Value |
|--------|------:|
| PASS | 37 |
| FAIL | 0 |
| SKIP | 0 |
| **Verdict** | **PASS** |

P6 `db-spot-check-ceo-record` PASS (HLD-0001 aligned). Closes **QA01-D-01**.

## Gate 3 — PHASE1-PRODUCT-COMPLETENESS FE

**Dev evidence:** `docs/qa/evidence/phase1-product-completeness-fe-20260524.md`  
**Account:** `ceo@xe.vn` via portal proxy `http://127.0.0.1:5175`

| Check | Endpoint / criterion | Result |
|-------|----------------------|--------|
| Full insurance list | `GET /api/hrm/contracts-insurance/insurance?company_id=main` | **200** — total **1980** (`HRM-CON-200`) |
| Expiring subset (regression) | `GET …/insurance/expiring?company_id=main&days=90` | **200** — total **86** |
| Full > expiring | 1980 > 86 | **PASS** — FE no longer limited to near-expiry window |
| Catalog effective stats | `GET /api/hrm/settings-catalogs` | **200** — **14** catalogs / **65** effective items |
| Dept templates rail | `GET /api/xbos/dept-system-templates` | **404** (`XBOS-CFG-001`) — expected; FE banner cites `pnpm seed:business-master:settings-md` per dev-fe handoff |
| View audit dept path | `GET /api/xbos/business-master/dept_system_templates/items` | **200** (view-completeness probe) |

**Note:** LinkedDataEmpty amber banners (Insurance / Contracts / Candidates) not browser-automated this pass; API prerequisites met (workforce + satellite data non-empty). Residual: payroll overview mock unchanged (documented in dev-fe evidence).

## Gate 4 — P1-S1-QA-01 partial (HRM embed audit)

**Command:** `pnpm run test:hrm-embed:audit`  
**Evidence:** `docs/qa/evidence/hrm-embed-fe-audit-20260523.md`

| Route | HTTP | Result |
|-------|------|:------:|
| P-CC-03 employees | 200 | PASS |
| P-CC-04a settings | 200 | PASS |
| P-CC-04b contracts | 200 | PASS |
| P-CC-05 contracts | 200 | PASS |
| P-CC-06 recruitment | 200 | PASS |
| P-CC-07 attendance | 200 | PASS |
| P-CC-08 payroll | 200 | PASS |
| FE-hrm-health | 200 | PASS |

**8/8 PASS** (exit 0).

## Defect closure

| ID | Prior | Retest |
|----|-------|--------|
| QA01-D-01 | P6 `UAT0001 not in DB` | **CLOSED** — 37/37 UAT |
| QA01-D-02 | leave-requests **400** | **CLOSED** — leave probe 200 |
| QA01-D-03 | kpi-rollup **409** | **CLOSED** — kpi-rollup 200 |
| QA01-D-04 | dept-templates audit path **404** | **CLOSED** — items alias 200 |

## Verdict summary

| Layer | Result |
|-------|--------|
| View completeness | **PASS** (10/10) |
| L1 UAT | **PASS** (37/37) |
| PRODUCT-COMPLETENESS FE (API) | **PASS** |
| L2 embed audit | **PASS** (8/8) |

**ack_status:** `PASS_TO_PM` — no open defects from this retest scope.
