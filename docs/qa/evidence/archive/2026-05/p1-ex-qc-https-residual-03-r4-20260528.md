# QC Gate Decision — P1-EX-QC-HTTPS-RESIDUAL-03-R4

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QC-HTTPS-RESIDUAL-03-R4` |
| from_role | `qc` |
| to_role | `pm` |
| execution_date | `2026-05-28` |
| decision | **NO-GO** |
| slice | **P1-EX-HTTPS-RESIDUAL-03** — R4 milestone (HTTPS attendance fallback-zero + auth probes) |
| ack_status | **PASS_TO_PM** |

## Scope audited

QC gate for **R4 milestone** per PM dispatch. Entry: QA runtime retest published with `FAIL_TO_PM`. Exit: GO / GWC / NO-GO for whether R4 closes HTTPS residual slice.

**Verdict basis:** QA R4 artifact only (no QC re-test; QA evidence internally consistent).

**Explicitly not approved:** Program Phase 1 DONE · PROD-READY · full RESIDUAL-03 program exit.

## Evidence consumed

| # | Artifact | Role | Verdict used |
|---|----------|------|--------------|
| 1 | `docs/qa/evidence/p1-ex-qa-https-residual-03-r4-20260528.md` | QA | **Authoritative** — `FAIL_TO_PM` |
| 2 | `docs/qa/evidence/p1-ex-fe-be-https-residual-03-r4-20260528.md` | Dev-FE | Fix context (path-segment guard); unit tests 12/12 |
| 3 | `docs/qa/evidence/p1-ex-qc-https-residual-03-r3-20260528.md` | QC (prior) | NO-GO — QA R3 artifact absent at R3 gate; R4 now supplies runtime proof |

## Gate matrix (R4 mandatory)

| Gate | Expected | Actual (QA R4) | QC verdict |
|------|----------|----------------|------------|
| `fallbackAllCount` before `Kiểm tra lại` | `0` | **8** (7 attendance-related) | **FAIL** |
| `fallbackAllCount` after `Kiểm tra lại` | `0` | **8** | **FAIL** |
| No `127.0.0.1:54321/rest/v1/*` on attendance load | Zero hits | departments, attendance_sheets, work_shifts, attendance_rules, attendance_records, leave_requests | **FAIL** |
| Attendance records probe `GET /api/hrm/attendance/records?company_id=main` | `200` | **200** / `HRM-ATT-200` (before + after retry) | **PASS** |
| Auth 5-list probes (employees, contracts, recruitment, payroll, attendance) | 5/5 `200`, no `HRM-AUTH-001` | **5/5** `200` | **PASS** |
| HRM sync banner | No ERROR | CONNECTED (informational) | **PASS** (informational) |
| Delta vs R3 | Improvement on fallback | **8 → 8** (no improvement) | **FAIL** |

## Decision rationale

**NO-GO** — Under QC evidence discipline, the **mandatory fallback-zero gate** is the P0 closure criterion for `P1-EX-HTTPS-RESIDUAL-03`. QA R4 documents executable runtime proof that R4 FE patch (`hrmDataMode` path-segment guard) did **not** eliminate localhost Supabase traffic on the live HTTPS attendance URL.

Partial green lanes (attendance Nest probe + auth session probes) are **insufficient** to promote residual closure or issue GO WITH CONDITIONS for this slice: prior waves (R1, L25-JOURNEY-01, WAVE-CONSOLIDATE-01) established that `127.0.0.1:54321` fallback on attendance is a **release-blocking P0** until `fallbackAllCount=0`.

### Does R4 close HTTPS residual?

**No.** R4 milestone **does not** close `P1-EX-HTTPS-RESIDUAL-03`. Auth/session regression from earlier R1/R2 waves appears **closed** on R4 evidence (5/5 list probes, attendance records 200); **attendance localhost fallback remains open**.

## Explicit blocker list

| ID | Blocker | Severity | Status at R4 |
|----|---------|----------|--------------|
| **B-RES03R4-01** | `fallbackAllCount=8` before and after `Kiểm tra lại` | P0 | **OPEN** |
| **B-RES03R4-02** | Runtime requests to `127.0.0.1:54321/rest/v1/*` (6 table patterns) | P0 | **OPEN** |
| **B-RES03R4-03** | R4 FE path guard ineffective in deployed runtime | P0 | **OPEN** |
| **B-RES03R4-04** | L2.5 J-HRM attendance journeys on HTTPS not re-proven this wave | P1 | **DEFER** (out of R4 slice) |

### Closed on R4 evidence (partial)

| Item | Status |
|------|--------|
| Attendance records Nest probe (`HRM-ATT-200`) | **CLOSED** |
| Browser-session auth on 5 impacted HRM list endpoints | **CLOSED** |
| QA R3 missing-artifact gap (R3 QC NO-GO B1) | **CLOSED** — R4 QA artifact now exists |

## L2.5 journey coverage audit (U19)

| Journey | R4 wave | QC |
|---------|---------|-----|
| J-HRM-06 (attendance embed) | Not re-executed as click-path | **Not evaluated** — fallback P0 blocks promotion regardless |
| Other J-HRM / P-CC-* | Out of R4 slice | Not evaluated |

**U19 rule applied:** L2 auth/list green without fallback-zero does **not** satisfy RESIDUAL-03 closure.

## Informational — later waves supersede runtime (not this verdict)

Subsequent artifacts in the evidence chain **after** R4 may reflect improved runtime:

| Later artifact | Note |
|----------------|------|
| `docs/qa/evidence/p1-ex-qc-https-residual-03-r5-r1-20260528.md` | **GO WITH CONDITIONS** for attendance pilot after R5 deploy; QA reported `fallbackAllCount` **8 → 0** post-deploy |

This R4 QC verdict remains **NO-GO for the R4 milestone** and must not be retroactively upgraded. PM may reference R5-R1 for **current** attendance-pilot status; R4 documents the failed closure attempt at that revision.

## Required corrective actions (at R4 milestone)

1. **Dev-FE:** Eliminate all attendance-module Supabase fetch branches on HTTPS nested routes (not only `hrmDataMode` guard timing).
2. **DevOps:** Ensure R5+ deploy reaches live bundle before QA re-run.
3. **QA:** Re-publish runtime artifact with before/after `fallbackAllCount` and attendance probe table.
4. **QC:** Re-gate only after QA PASS on fallback-zero mandatory gate.

## completion_report

- **closed_scope:**
  - Audited QA R4 end-to-end against mandatory RESIDUAL-03 gates.
  - Confirmed auth 5-list + attendance records probe **PASS** on R4 evidence.
  - Issued **NO-GO** with explicit blocker IDs; closed R3 “missing QA artifact” gap.
- **residual:**
  - **P1-EX-HTTPS-RESIDUAL-03 not closed at R4** — fallback-zero P0 open (`fallbackAllCount=8`).
  - Program Phase 1 / Production remain **NOT MET** (unchanged).

## Handoff Packet

- **next_owner:** `pm`
- **next_dispatch_prompt:** `Intake QC NO-GO for P1-EX-QC-HTTPS-RESIDUAL-03-R4 (evidence: docs/qa/evidence/p1-ex-qc-https-residual-03-r4-20260528.md). R4 does NOT close HTTPS residual — fallbackAllCount=8. Dispatch dev-fe P1-EX-FE-BE-HTTPS-RESIDUAL-03-R5 to eliminate ALL 127.0.0.1:54321/rest/v1/* on https://14-225-217-232.nip.io/hr/attendance?portal=1&companyId=main; then devops deploy + qa R5 runtime retest + qc re-gate. Do not claim RESIDUAL-03 closed until fallbackAllCount=0 before AND after "Kiểm tra lại".`
- **evidence_path:** `docs/qa/evidence/p1-ex-qc-https-residual-03-r4-20260528.md`
- **ack_status:** `PASS_TO_PM`
