# Sprint 0 pilot QA — full matrix

**work_item_id:** `P1-S0-QA-01`  
**program:** `PHASE1-SCRUM-S0` · sprint `S0`  
**qa_owner:** qa  
**date:** 2026-05-23T00:22Z  
**environment:** local — HRM `28001`, XBOS `28002`, portal `5175`  
**account:** `ceo@xe.vn` / `Xevn@2026`  
**ack_status:** **`PASS`** (superseded 2026-05-23 PM) — P-CC-06/07 fixed; see `scrum-s0-pilot-retest-20260523.md` + QC L2 **11/11**

## Summary

| Layer | Command / scope | Verdict |
|-------|-----------------|--------|
| L0 | `pnpm run qc:dev-stack` | **PASS** (XBOS 200, portal 200) |
| L0+ | HRM `GET http://127.0.0.1:28001/api/hrm` | **PASS** HTTP 200 |
| L1 | `pnpm run test:system:uat` | **PASS** 37/0/0 — `docs/qa/evidence/system-integration-uat-report.json` |
| L2 | `pnpm run test:pilot:flows` (P-CC-01..04) | **PASS** 7/7 |
| L2 | P-CC-05..08 API proxy probes | **PARTIAL** — 05/08 PASS; **06/07 FAIL** |
| D7 | `HRM-EMBED-D7` regression | **PASS** (no regression) |

## L0 — `pnpm run qc:dev-stack`

```
✓ xbos-api: HTTP 200 ← http://127.0.0.1:28002/api/xbos
✓ web-portal (optional): HTTP 200 ← http://127.0.0.1:5175
```

Exit code **0**.

## L1 — `pnpm run test:system:uat`

```
Verdict: PASS
PASS: 37  FAIL: 0  SKIP: 0
Report: docs/qa/evidence/system-integration-uat-report.json
```

Started `2026-05-22T17:16:58Z` (report timestamp; re-run same session stack).

## L2 — Command Center matrix

### P-CC-01..04 (`test:pilot:flows`)

| ID | Result | Notes |
|----|--------|-------|
| P-CC-01 | **PASS** | `expiresInSec=86400`, `defaultCompanyId=main` |
| P-CC-02 | **PASS** | `group-member-units` HTTP 200, members ≥1 |
| P-CC-03 | **PASS** | `employees?page_size=100` HTTP 200 `HRM-EMP-200` |
| P-CC-04 | **PASS** | catalogs + contracts 200; rollup JWT-aligned **200** `XBOS-KPI-202` (no 409) |

### P-CC-05 — Insurance

| Probe | HTTP | Code | Verdict |
|-------|------|------|---------|
| `settings-catalogs` | 200 | `HRM-SET-200` | **PASS** |
| `contracts-insurance/contracts?company_id=main` | 200 | `HRM-CON-200` | **PASS** (empty+200) |
| `contracts-insurance/insurance/expiring?company_id=main` | 200 | `HRM-CON-200` | **PASS** |

**Route verdict:** **PASS** (API load path; iframe Supabase risk not browser-probed this cycle).

### P-CC-06 — Recruitment — **FAIL**

Portal embed calls `listHrmJobRequisitions` with `company_id=main` (`hrmApiClient.ts`).

| Probe | HTTP | Code | Verdict |
|-------|------|------|---------|
| `recruitment/requisitions?company_id=main` | **400** | `HRM-VAL-001` | **FAIL** — DTO `@IsUUID()` rejects slug `main` |
| `recruitment/requisitions?company_id=10000000-0000-4000-8000-000000000001` | **409** | `SCOPE_CONTEXT_MISMATCH` | Wrong client workaround vs JWT `companyId=main` |

**Expected fix:** `dev-fe` apply `resolveHrmCompanyId()` (same as `listHrmOperationsTasks`) **or** `dev-be` align DTO with payroll (`@IsString` + scope map).

**UI impact:** `HrmWorkspacePanel` recruitment view → `hrmLoadError` / API_LOAD_FAILED (catch on 400).

### P-CC-07 — Attendance — **FAIL**

Same class as P-CC-06 for `listHrmAttendanceRecords`.

| Probe | HTTP | Code | Verdict |
|-------|------|------|---------|
| `attendance/records?company_id=main` | **400** | `HRM-VAL-001` | **FAIL** |
| `attendance/records?company_id=10000000-0000-4000-8000-000000000001` | **409** | `SCOPE_CONTEXT_MISMATCH` | **FAIL** |

**Owner:** `dev-fe` (primary) + optional `dev-be` DTO harmonization.

### P-CC-08 — Payroll

| Probe | HTTP | Code | Verdict |
|-------|------|------|---------|
| `payroll/payslips?company_id=main` | 200 | `HRM-PAY-200` | **PASS** (`total=50`) |

## HRM-EMBED-D7 — regression confirm

| Check | Result |
|-------|--------|
| Prior evidence `docs/qa/evidence/hrm-embed-employee-detail-20260522.md` | Baseline **PASS** |
| `apps/web/hrm` vitest | **PASS** 15/15 (`useEmployee.test.ts` 4/4) |
| `employees?company_id=main` | **PASS** HTTP 200 |
| `employees?company_id=xevn` control | **PASS** HTTP 409 scope |

No regression detected on employee embed API mode.

## Defect register (S0 pilot)

| ID | Route | Severity | Owner | Summary |
|----|-------|----------|-------|---------|
| S0-PILOT-01 | P-CC-06 | **P1** | dev-fe | Recruitment list 400: `company_id=main` not UUID-valid |
| S0-PILOT-02 | P-CC-07 | **P1** | dev-fe | Attendance list 400: same contract mismatch |

## PM handoff

- **ack_status:** `FAIL`
- **Re-test trigger:** After `dev-fe` `READY_FOR_QA` on `listHrmJobRequisitions` / `listHrmAttendanceRecords` scope fix — re-run P-CC-06, P-CC-07 only; regression P-CC-03/04/05/08 + D7.
- **QC:** Full pilot **NO-GO** until P-CC-06 and P-CC-07 PASS (per `business-flow-zero-defect-gate.mdc`).

## Evidence paths

- This file: `docs/qa/evidence/scrum-s0-pilot-20260523.md`
- L1: `docs/qa/evidence/system-integration-uat-report.json`
- L2 script: `scripts/pilot-business-flow-smoke.mjs`
- Matrix: `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md`
- D7 baseline: `docs/qa/evidence/hrm-embed-employee-detail-20260522.md`
