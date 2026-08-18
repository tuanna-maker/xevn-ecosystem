# Evidence — PO-HRM-ATT-LEAVE-FUNNEL-BE-01

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-ATT-LEAVE-FUNNEL-BE-01` |
| from_role | dev-be |
| to_role | pm → **dev-fe** `PO-HRM-ATT-LEAVE-FUNNEL-FE-01` |
| lane | execution · Nest ensureSchema soft FK |
| parent | `PO-HRM-ATT-LEAVE-FUNNEL-DB-01` CONFIRMED · SPEC-01 Option A P0 |
| change_mode | **ADD** · preserve_default · code_memory APPEND |
| date | 2026-08-06 |
| ack_status | **READY_FOR_QA** (FE contract ready; browser UF after FE-01) |
| honesty | **`attendance_uat_ready=false`** · U65 zero-seed · WAIVE_L2 · must_keep J-HRM-06b/06c |

---

## spec_read_ack

| Artifact | Sections |
|----------|----------|
| `docs/program/specs/PO-HRM-ATT-LEAVE-FUNNEL-DB-01.md` | §1–§3 CONFIRMED soft FK · reverse/locked · IX |
| `docs/program/specs/PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md` | §4 F-ATT-LEAVE-FUNNEL-01..04 · §5 conflict · §6 must_keep |
| `docs/qa/evidence/po-hrm-att-leave-funnel-db-01.md` | Unlock BE-01 Option A only · AGG HOLD |
| AS-IS | `leave-requests.service.ts` approve/reject · `attendance.service.ts` ensureSchema · `leave-workflow.bridge.ts` terminal |

---

## Closed this seat

1. **ensureSchema ADD** on `attendance_records`: `leave_request_id UUID NULL`, `leave_type_key TEXT NULL`, partial IX `idx_attendance_records_leave_request_id` — Nest only (AttendanceService + funnel ensure).
2. **F-ATT-LEAVE-FUNNEL-01** — `LeaveAttendanceFunnelService.materializeApprovedLeave` on approve L1 + internal + WF terminal `completed`; expand dates → UPSERT `status=leave` + soft FK.
3. **Conflict / locked** — `present` → **409** `HRM-ATT-LEAVE-FUNNEL-CONFLICT`; sheet `submitted`/`closed` overlap on approve → **409** `HRM-ATT-SHEET-LOCKED`.
4. **F-ATT-LEAVE-FUNNEL-02** — `POST …/leave-requests/:id/cancel` after approved → reverse by `leave_request_id` (clear → pending); closed sheet → **409** `HRM-ATT-SHEET-LOCKED`. SM leave `approved→cancelled` ADD.
5. **F-ATT-LEAVE-FUNNEL-03** — GET `/attendance/records` EXPAND: `leave_request_id`, `leave_type`/`leave_type_key`, `leave_type_label`, `status_label` («Nghỉ phép»); no FE leave join; no extra poll.
6. **F-ATT-LEAVE-FUNNEL-04** — closed/present checks use `expandPayrollAttendanceSheetCompanyIds` (TEXT slug↔UUID parity with leave/sheet).
7. **Jest** — `leave-attendance-funnel.service.spec.ts` + regression leave-requests / attendance.service: **64/64 PASS**.
8. **CODE-MEMORY APPEND** on attendance.service · leave-requests.service · leave-workflow.bridge · funnel service.
9. **Forbidden honored** — no `att_timesheet_line` / AGG · no Option C · no seed · no wipe sign · no `apps/web/**` · `attendance_uat_ready=false`.

---

## Files touched

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/attendance/leave-attendance-funnel.service.ts` | **NEW** materialize/reverse |
| `apps/api/hrm-api/src/attendance/leave-attendance-funnel.service.spec.ts` | **NEW** jest |
| `apps/api/hrm-api/src/attendance/attendance.service.ts` | ensureSchema cols + mapRecord display-ready |
| `apps/api/hrm-api/src/attendance/leave-requests.service.ts` | approve hook + cancelLeaveRequest |
| `apps/api/hrm-api/src/attendance/leave-workflow.bridge.ts` | terminal materialize |
| `apps/api/hrm-api/src/attendance/attendance.controller.ts` | POST cancel |
| `apps/api/hrm-api/src/common/assert-status-transition.ts` | approved→cancelled |
| `apps/api/hrm-api/src/app.module.ts` | provider |

---

## Verify

```text
pnpm exec jest --testPathPatterns=leave-attendance-funnel --testPathPatterns=leave-requests.service.spec --testPathPatterns=attendance.service.spec --no-coverage
→ Test Suites: 3 passed · Tests: 64 passed
```

---

## Residual

| ID | Item | Owner |
|----|------|-------|
| FE-01 | Weekly/Bản ghi bind display-ready leave label; **cấm** FE join leave list; no poll | **dev-fe** |
| AGG-01 | `att_timesheet_line` hours | HOLD |
| OPEN-Q1 | Holiday skip vs marker | ba-process |
| Module UAT | `attendance_uat_ready` | stays **false** |

---

## completion_report

Option A funnel BE closed: soft FK ensureSchema, materialize on approve (L1+WF), reverse on cancel-after-approve, GET records display-ready leave fields, conflict/locked 409 codes, scope TEXT expand, jest 64/64. Residual: FE-01 bind + AGG HOLD + honesty false.

## next_owner

**pm** → **dev-fe** `PO-HRM-ATT-LEAVE-FUNNEL-FE-01` (then qa FUNNEL-QA-01)

## next_dispatch_prompt

```text
work_item_id: PO-HRM-ATT-LEAVE-FUNNEL-FE-01
from_role: pm
to_role: dev-fe
lane: execution
parent: PO-HRM-ATT-LEAVE-FUNNEL-BE-01 READY_FOR_QA · Option A display-ready on GET records
change_mode: ADD · preserve_default · code_memory_required: true · APPEND
u65: zero-seed · attendance_uat_ready=false
must_keep: J-HRM-06b storm ≤2 GET/10s · J-HRM-06c sign · WAIVE_L2 · AC-ATT-SHEET empty honesty · cấm Option C FE leave join

read_first:
1. docs/program/specs/PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md §4 F-ATT-LEAVE-FUNNEL-03 · §6–§7
2. docs/qa/evidence/po-hrm-att-leave-funnel-be-01.md
3. AS-IS weekly / Bản ghi attendance records grid FE

entry_criteria:
- BE GET /attendance/records returns leave_request_id, leave_type, leave_type_label, status_label when status=leave
- Approve echo optional materialized_days — do not require FE poll

task:
1) Weekly + Bản ghi bind status_label / leave_type_label when status=leave (display-ready only)
2) Cấm second GET leave-requests to tô màu ô
3) Cấm thêm poll/invalidate storm beyond existing records query
4) Cancel UX optional if surface exists — reverse is BE
5) Evidence + CODE-MEMORY APPEND

exit: READY_FOR_QA → PO-HRM-ATT-LEAVE-FUNNEL-QA-01 U65 AC-ATT-LV-SHEET-01..03 + 06b regress
forbidden: apps/api/** · seed · invent ladder N · claim attendance_uat_ready
```

## ack_status

**READY_FOR_QA**
