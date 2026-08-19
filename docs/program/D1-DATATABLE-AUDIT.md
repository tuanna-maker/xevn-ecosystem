# D1 — Mixed DataTable Audit (UX-UI-ERP-AUDIT-01)

| Field | Value |
|-------|-------|
| **work_item_id** | `D1-DATATABLE-AUDIT-01` |
| **Date** | 2026-07-28 |
| **Scope** | apps/web/hrm/src — all plain <table> in HRM pages |
| **Severity** | P1 — a11y + sort gap; workaround: use Employees/Contracts tables |

## Findings

| Location | Lines | Pattern | Action bar / Sort? | Recommended fix |
|----------|------:|---------|-------------------|----------------|
| `Attendance.tsx` | 1205–1260 | Plain table — employee selector (leave days summary) | Checkbox bulk select present, bulk action bar MISSING (UX-09 linked) | Replace with AttendanceRecordsTable + bulk toolbar; or delete if summary unnecessary |
| `Attendance.tsx` | 1341–1365 | Plain table — rule version download list | Download button; no sort needed | Acceptable exception — static content, < 10 rows |
| `Attendance.tsx` | 1776–1830 | Plain table — rules column editor | Inline edit checkbox; no sort | Switch to DataTable with editable cell; or keep plain + write justification |
| `Payroll.tsx` | TBD | Tax settlement table possible | Not audited this run | Follow-up grep required |

## Decision

D1 is NOT "replace every table". Rule:
- Plain table OK for: static content, download list, < 10 rows, no sort/filter/bulk.
- DataTable required for: dynamic server data, > 10 rows, sort/filter/bulk action.

Attendance 1341 (download list) → mark acceptable.
Attendance 1205 (employee selector) → needs bulk toolbar or extract to AttendanceRecordsTable.
Attendance 1776 (rules columns) → needs justification note.

## Next

- [ ] Owner: Claude-PM — grep Payroll.tsx for plain table pattern
- [ ] Cursor-PM — if UX-09 (Shifts bulk toolbar) ships, ensure DataTable + XToolbar used
- [ ] BA-DUAL-PLANE delta — if tab IA collapse changes data shape

**Status:** OPEN — waiting Cursor synthesis table.
