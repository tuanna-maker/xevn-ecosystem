# Evidence — PO-HRM-ATT-LEAVE-FUNNEL-FE-01

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-ATT-LEAVE-FUNNEL-FE-01` |
| from_role | dev-fe |
| to_role | pm → **qa** `PO-HRM-ATT-LEAVE-FUNNEL-QA-01` |
| lane | execution · HRM web FE |
| parent | `PO-HRM-ATT-LEAVE-FUNNEL-BE-01` READY_FOR_QA · Option A GET records display-ready |
| change_mode | **ADD** · preserve_default · code_memory **APPEND** |
| date | 2026-08-06 |
| ack_status | **READY_FOR_QA** |
| honesty | **`attendance_uat_ready=false`** · U65 zero-seed · WAIVE_L2 · must_keep J-HRM-06b/06c |

---

## spec_read_ack

| Artifact | Sections |
|----------|----------|
| `docs/program/specs/PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md` | §4 **F-ATT-LEAVE-FUNNEL-03** · §6 must_keep · §7 AC-ATT-LV-SHEET-01..03 |
| `docs/qa/evidence/po-hrm-att-leave-funnel-be-01.md` | GET records EXPAND `status_label` / `leave_type_label` / soft FK |
| AS-IS Weekly | `useWeeklyAttendanceSummary` → `listAttendanceRecords` only · `buildWeeklyAttendanceRows` / `recordToShift` |
| AS-IS Bản ghi | `AttendanceRecordsTable` → `useAttendanceRecords` → `toUiRecord` / `getStatusBadge` |

---

## Closed this seat

1. **Type contract** — `HrmAttendanceRecord` ADD optional `status_label`, `leave_request_id`, `leave_type`/`leave_type_key`, `leave_type_label`.
2. **Pure binder** — `attendanceLeaveDisplay.ts` `resolveAttendanceLeaveDisplayLabel` (status_label · leave_type_label when distinct).
3. **Weekly** — `recordToShift` uses display-ready labels when `status=leave` (no hardcode-only «Nghỉ phép» ignore BE).
4. **Bản ghi** — `toUiRecord` passthrough leave fields; `getStatusBadge` prefers BE labels; harness `data-testid` / `data-status` / `data-leave-request-id`.
5. **Storm / Option C** — **no** `listLeaveRequests` / `/leave-requests` on weekly or records path; **no** new poll / `refetchInterval`; weekly still single RQ `listAttendanceRecords`.
6. **CODE-MEMORY APPEND** on aggregator · hook · weekly hook · records table · new leave display module.
7. **Vitest** — 27/27 PASS (leave display + aggregator funnel + records hook guard).
8. **Forbidden honored** — no `apps/api/**` · no seed · no invent ladder N · no `attendance_uat_ready=true` · no Option C FE leave join.

---

## Files touched

| Path | Change |
|------|--------|
| `apps/web/hrm/src/integrations/hrmApi.ts` | `HrmAttendanceRecord` display-ready fields |
| `apps/web/hrm/src/lib/attendanceLeaveDisplay.ts` | **NEW** label resolver |
| `apps/web/hrm/src/lib/attendanceLeaveDisplay.test.ts` | **NEW** vitest |
| `apps/web/hrm/src/lib/attendanceDashboardAggregator.ts` | weekly + table row leave bind |
| `apps/web/hrm/src/lib/attendanceDashboardAggregator.test.ts` | leave cell + Bản ghi row asserts |
| `apps/web/hrm/src/hooks/useAttendanceRecords.ts` | toUiRecord passthrough |
| `apps/web/hrm/src/hooks/useAttendanceRecords.test.ts` | source guard no leave join |
| `apps/web/hrm/src/hooks/useWeeklyAttendanceSummary.ts` | CODE-MEMORY APPEND (storm lock) |
| `apps/web/hrm/src/components/attendance/AttendanceRecordsTable.tsx` | badge bind + testids |

---

## Verify

```text
pnpm exec vitest run src/lib/attendanceLeaveDisplay.test.ts src/lib/attendanceDashboardAggregator.test.ts src/hooks/useAttendanceRecords.test.ts --reporter=dot
→ Test Files: 3 passed · Tests: 27 passed
```

---

## Residual

| ID | Item | Owner |
|----|------|-------|
| QA-01 | Browser U65 AC-ATT-LV-SHEET-01..03 + J-HRM-06b storm ≤2 GET/10s regress | **qa** |
| AGG-01 | paid/unpaid leave hours line | HOLD |
| Module UAT | `attendance_uat_ready` | stays **false** |

---

## completion_report

FE Option A bind closed: Weekly + Bản ghi consume GET `/attendance/records` `status_label` / `leave_type_label` when `status=leave`; no leave-requests overlay; no extra poll; CODE-MEMORY APPEND; vitest 27/27. Residual: QA-01 U65 + honesty false.

## next_owner

**qa** — `PO-HRM-ATT-LEAVE-FUNNEL-QA-01`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-ATT-LEAVE-FUNNEL-QA-01
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-ATT-LEAVE-FUNNEL-FE-01 READY_FOR_QA · BE-01 READY_FOR_QA
u65: zero-seed · browser-only · attendance_uat_ready=false
must_keep: J-HRM-06b storm ≤2 GET records+sheets /10s · J-HRM-06c sign · WAIVE_L2 · AC-ATT-SHEET empty honesty · cấm Option C FE leave join

read_first:
1. docs/program/specs/PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01.md §7 AC-ATT-LV-SHEET-01..03
2. docs/qa/evidence/po-hrm-att-leave-funnel-fe-01.md
3. docs/qa/evidence/po-hrm-att-leave-funnel-be-01.md

entry_criteria:
- FE+BE READY_FOR_QA
- Portal/HRM stack L0 up (no seed)

task (U65):
1) AC-ATT-LV-SHEET-01 — login → tạo đơn leave FE → QL duyệt → mở Bảng chấm công sheet kỳ giao → weekly ô thấy Nghỉ phép (+ loại nếu có) → F5 còn → Network GET /attendance/records 2xx · dates ≠ 1970 · cấm GET leave-requests trên weekly
2) AC-ATT-LV-SHEET-02 — cancel/reject sau approve (sheet open) → marker leave biến mất
3) AC-ATT-LV-SHEET-03 — sheet closed + approve overlap → 409 LOCKED (documented) — không im lặng ghi
4) J-HRM-06b regress — ≤2 GET sheets+records /10s sau open weekly (FAIL tức thì nếu storm)
5) LV-02 WAIVED_P1 — cấm 🟢

exit: PASS_TO_PM · evidence docs/qa/evidence/po-hrm-att-leave-funnel-qa-01.md
forbidden: seed · API mutate as UF PASS · claim attendance_uat_ready
```

## ack_status

**READY_FOR_QA**
