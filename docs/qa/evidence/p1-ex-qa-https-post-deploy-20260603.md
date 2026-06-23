# QA Runtime Evidence — P1-EX-QA-HTTPS-01-RERUN (post VPS deploy)

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QA-HTTPS-01-RERUN` |
| from_role | `qa` |
| to_role | `pm` |
| predecessor | `P1-EX-DEVOPS-VPS-DEPLOY-03` — `docs/ops/evidence/vps-deploy-20260603.md` |
| execution_time_utc | `2026-06-04` (independent QA after VPS deploy `HEAD d2c9715`) |
| environment | `https://14-225-217-232.nip.io` |
| account | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| ack_status | **PASS_TO_PM** |

## Scope (exit criteria)

| # | Criterion | Result |
|---|-----------|--------|
| 1 | `tmp-p1-ex-qa-https-01-probe.mjs` exit **0** on nip.io | **PASS** |
| 2 | L2 **P-CC-01..09** (23 sub-checks) | **23/23 PASS** |
| 3 | L2.5 **J-CC-03**, **J-HRM-01..07**, **J-XBOS-01-tasks** | **7/7 PASS** |
| 4 | No scope **409** on in-scope CEO load paths | **PASS** |
| 5 | Member negative KPI (`du-lich.ceo@xe.vn`) | **409** `SCOPE_CONTEXT_MISMATCH` — expected |

Matrix: `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` · Journeys: `docs/program/PROGRAM_JOURNEY_MAP.md` (API parity L2.5).

**Out of scope this wave:** L1 `test:system:uat`, local `qc:dev-stack`, full browser iframe hydration, L0 Prometheus text format audit.

---

## Command executed

```powershell
Set-Location <repo-root>
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-p1-ex-qa-https-01-probe.mjs
```

**Exit code:** `0`

**Full stdout:**

```text
P1-EX-QA-HTTPS-01 probe — https://14-225-217-232.nip.io

PASS  P-CC-01-login HTTP 201 XBOS-AUTH-200
PASS  P-CC-01-jwt
PASS  P-CC-02 HTTP 200 XBOS-TENANT-200
PASS  P-CC-03 HTTP 200 HRM-EMP-200
PASS  P-CC-04a HTTP 200 HRM-SET-200
PASS  P-CC-04b HTTP 200 HRM-CON-200
PASS  J-CC-03 HTTP 200 XBOS-KPI-202 — KPI rollup companyId=holding + x-company-id main
PASS  P-CC-04c HTTP 200 XBOS-KPI-202
PASS  P-CC-04
PASS  P-CC-05 HTTP 200 HRM-CON-200
PASS  P-CC-06 HTTP 200 HRM-REC-200
PASS  P-CC-07 HTTP 200 HRM-ATT-200
PASS  P-CC-08 HTTP 200 HRM-PAY-200
PASS  P-CC-09 HTTP 200 XBOS-CAT-212
PASS  J-HRM-01
PASS  J-HRM-02
PASS  J-HRM-03
PASS  J-HRM-04
PASS  J-HRM-05
PASS  J-HRM-06
PASS  J-HRM-07
PASS  J-XBOS-01-tasks HTTP 200 XBOS-WF-203
PASS  member-kpi-negative HTTP 409 SCOPE_CONTEXT_MISMATCH — du-lich.ceo@xe.vn — expect 403/409 on group rollup

=== L2 checks: 23/23 PASS ===
=== L2.5 journeys: 7/7 PASS ===
```

---

## L2 — P-CC summary (group CEO)

| ID | Check | HTTP | Code | Verdict |
|----|-------|------|------|---------|
| P-CC-01 | login + JWT `expiresInSec=86400` | 201 | XBOS-AUTH-200 | PASS |
| P-CC-02 | `group-member-units` ≥1 row | 200 | XBOS-TENANT-200 | PASS |
| P-CC-03 | employees list | 200 | HRM-EMP-200 | PASS |
| P-CC-04 | catalogs + contracts + KPI rollup (no 409) | 200 | HRM-SET/HRM-CON/XBOS-KPI | PASS |
| P-CC-05 | insurance list | 200 | HRM-CON-200 | PASS |
| P-CC-06 | recruitment requisitions | 200 | HRM-REC-200 | PASS |
| P-CC-07 | attendance records | 200 | HRM-ATT-200 | PASS |
| P-CC-08 | payroll payslips | 200 | HRM-PAY-200 | PASS |
| P-CC-09 | catalog-governance inbox | 200 | XBOS-CAT-212 | PASS |

**Scope parity:** list→GET employee detail paths for J-HRM-01/02/04/06/07 returned **200** (no list-with-data / detail-404 pattern).

---

## L2.5 — journeys (API proxy)

| Journey | Verdict | Notes |
|---------|---------|-------|
| J-CC-03 | PASS | KPI rollup `companyId=holding` with `x-company-id: main` → **200** |
| J-HRM-01 | PASS | contracts row → employee GET **200** |
| J-HRM-02 | PASS | employees list → profile GET **200** |
| J-HRM-03 | PASS | contract id + employee_id present |
| J-HRM-04 | PASS | insurance → employee GET **200** |
| J-HRM-05 | PASS | requisitions + candidates **200** |
| J-HRM-06 | PASS | attendance → employee GET **200** |
| J-HRM-07 | PASS | payslip → employee GET **200** |
| J-XBOS-01-tasks | PASS | workflow tasks **200**, no 409 |

---

## Regression note (vs prior JWT-only QA)

Prior `P1-EX-QA-HTTPS-P-CC-01-JWT-01` (2026-06-03) reported probe exit **1** with HRM **404/400** residuals. After deploy `570b117` + `d2c9715` and BE probe fixes, this rerun is **full perimeter PASS** — suitable for PM/QC partner-prep gate on HTTPS pilot.

---

## Residual / PM dispatch

| Item | Severity | Owner | Note |
|------|----------|-------|------|
| Browser iframe / CC shell UX | P2 GWC | `dev-fe` | Not exercised this wave — API-only |
| L1 `test:system:uat` | — | `qa` | Separate local stack wave |
| QC re-gate C-JCC03 / W13 | — | `qc` | If PM promotes partner-ready slice |

**ack_status:** **PASS_TO_PM**
