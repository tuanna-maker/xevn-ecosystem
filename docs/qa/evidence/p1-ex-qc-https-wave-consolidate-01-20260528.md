# P1-EX-QC-HTTPS-WAVE-CONSOLIDATE-01 — Consolidated QC gate (HTTPS attendance/auth scope)

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QC-HTTPS-WAVE-CONSOLIDATE-01` |
| from_role | `pm` |
| to_role | `qc` |
| date | `2026-05-28` |
| scope | HTTPS pilot slice: auth/browser parity + attendance runtime contract on `/command-center/hrm/attendance` |
| decision | **NO-GO** |
| ack_status | **PASS_TO_PM** |

## Evidence audited

1. `docs/qa/evidence/p1-ex-qa-https-browser-01-r5-r2-20260528.md` (QA auth/browser promotion addendum, `PASS_TO_PM`)
2. `docs/qa/evidence/p1-ex-fe-https-jwt-embed-01-20260528.md` (Dev-FE JWT bridge/fallback handling, `READY_FOR_QA`)
3. `docs/qa/evidence/p1-ex-qa-https-attendance-08-r1-20260528.md` (QA attendance runtime retest, `FAIL_TO_PM`)
4. `docs/qa/evidence/p1-ex-be-https-09-20260527.md` (Dev-BE scope-parity contract investigation/fix pack, `READY_FOR_QA`)

## Consolidated QC verdict

### A) Auth/browser wave (promotion status)
- QA R5-R2 confirms prior blocker (missing deploy artifact) has been reconciled and browser functional checks were promoted.
- Sync path and embed auth behavior for the audited browser scope are acceptable for that narrow path.
- This lane is **conditionally acceptable**.

### B) Attendance runtime wave (blocking)
- QA attendance R1 remains `FAIL_TO_PM` with explicit runtime proof of fallback calls to `127.0.0.1:54321` including `attendance_rules`.
- The wave requirement states no Supabase fallback for attendance runtime; this condition is not met.
- `GET /api/hrm/attendance/update-requests?company_id=main&page_size=50` returns `400 HRM-VAL-001` in the tested shape; FE/BE contract is not closed.

Because consolidated scope for this QC item explicitly includes attendance/auth together, unresolved attendance blocker prevents release promotion of the whole slice.

## Gate table

| Gate criterion | Expected | Actual | Verdict |
|---|---|---|---|
| HTTPS auth/browser parity | Browser wave promoted with reconciled evidence | QA R5-R2 `PASS_TO_PM` | PASS |
| Attendance runtime data path | Nest API path only (no Supabase/local fallback) | Supabase/local fallback still observed (`127.0.0.1:54321`) | **FAIL (P0)** |
| Attendance list contract | update-requests query returns valid list response | `400 HRM-VAL-001` on tested query shape | FAIL |
| Consolidated slice readiness | Auth + attendance both closed | Auth closed, attendance open | **NO-GO** |

## Residual list (explicit)

1. **P0:** Attendance runtime still calls Supabase/local REST fallback (`attendance_rules`, related resources) on HTTPS pilot.
2. **P0:** Attendance `update-requests` API contract mismatch (`400 HRM-VAL-001`) under current FE query shape.
3. **P1:** Dev-BE scope-parity wave (`p1-ex-be-https-09`) is not sufficient to override attendance runtime blocker; requires QA re-validation tied to attendance route after fix.

## completion_report

- Closed scope:
  - Consolidated latest QA auth retest, Dev-FE auth bridge fix evidence, Dev-BE contract investigation, and QA attendance retest.
  - Issued one unified gate recommendation for HTTPS attendance/auth slice.
- Open scope:
  - Attendance runtime path remains non-compliant with mandatory no-fallback rule.
  - Attendance update-requests contract behavior still requires FE/BE closure and QA re-evidence.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: P1-EX-FE-BE-HTTPS-ATTENDANCE-08-R5
from_role: pm
to_role: dev-fe
cc_role: dev-be
ack_status target: READY_FOR_QA

Use these mandatory inputs:
- docs/qa/evidence/p1-ex-qc-https-wave-consolidate-01-20260528.md
- docs/qa/evidence/p1-ex-qa-https-attendance-08-r1-20260528.md
- docs/qa/evidence/p1-ex-fe-https-jwt-embed-01-20260528.md
- docs/qa/evidence/p1-ex-be-https-09-20260527.md

Blocking closure required:
1) Remove/disable attendance Supabase fallback in HTTPS runtime (no 127.0.0.1:54321 hits, especially attendance_rules).
2) Align FE query and BE DTO/validation for /api/hrm/attendance/update-requests so intended list query returns 200.
3) Preserve already-closed browser auth behavior (do not regress R5-R2).

Exit criteria:
- Dev handoff READY_FOR_QA with reproducible evidence.
- QA rerun on /command-center/hrm/attendance?portal=1&companyId=main reports:
  - no Supabase fallback resources,
  - attendance records/update-requests/leave-requests contracts passing expected statuses,
  - ack_status PASS_TO_PM or explicit blocker list.
```

## evidence_path

`docs/qa/evidence/p1-ex-qc-https-wave-consolidate-01-20260528.md`

