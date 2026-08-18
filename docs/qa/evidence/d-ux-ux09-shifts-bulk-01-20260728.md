# D-UX-UX09-SHIFTS-BULK-01 — Shifts bulk toolbar (UX-09)

**Date:** 2026-07-28  
**Role:** dev-fe  
**change_mode:** ADD  
**ack_status:** READY_FOR_QA  
**U65:** no seed · HOLD_DEPLOY  
**Entry:** QA-UX-D5-01 PASS_TO_PM · UX-09 unlock

## Spec / intent

- UX-09 (`docs/program/UX-UI-ERP-ANALYSIS.md`): Shifts table có checkbox nhưng không có bulk action bar → flexibility giả.
- Synthesis R2 Cursor: `docs/program/UX-UI-ERP-REMAINING-SYNTHESIS.md` — sau UX-03 CLOSED.
- Rule: list có checkbox **chỉ khi** có bulk toolbar (Delete + clear).

## Closed

| Area | Change |
|------|--------|
| Helper | `apps/web/hrm/src/lib/shiftSelection.ts` — toggle / select-all / isAllVisibleSelected |
| Unit | `shiftSelection.test.ts` **3/3 PASS** |
| Hook | `useWorkShifts.bulkDeleteShifts` — sequential DELETE + toast |
| UI | `Attendance.tsx` Shifts — wire checkbox; toolbar «Đã chọn N / Bỏ chọn / Xóa (N)» khi `selectedShifts.length > 0`; AlertDialog bulk + single delete |
| Footer | Count = `filteredShiftsData.length` (bỏ hardcode 120) |
| i18n | `attPage.shifts*` + `hk.workShift.bulkDelete*` (vi + en) |
| CODE-MEMORY | APPEND VI trên Attendance |
| Smoke | `Attendance.ux09-bulk.smoke.test.ts` **2/2** + Attendance.smoke **1/1** + UX-03 debounce **2/2** |

## must_keep (không regression — không sửa)

| Guard | Status |
|-------|--------|
| Clock-In wizard C1 | Untouched logic; source smoke asserts `CLOCK_IN_ATTENDANCE_TYPE` / `openClockInWizard` |
| UX-03 search debounce | `shiftsSearchQuery` + `debouncedShiftsSearch` kept |
| Payroll mount / `taxSettlementFloatingUi` C1 | Payroll not touched |
| SalaryComponentsTab Zod+RHF (D5) | Payroll not touched |

## Verify commands

```bash
pnpm --filter vite_react_shadcn_ts exec vitest run \
  src/lib/shiftSelection.test.ts \
  src/pages/Attendance.ux09-bulk.smoke.test.ts \
  src/pages/Attendance.smoke.test.ts \
  src/hooks/useDebouncedValue.test.ts
# → 8 passed
```

## Residual (optional / out of scope)

- P2: dead dialog in Payroll if still present — **note only**, not expanded this WI.
- Filter Status/Office trên Shifts vẫn cosmetic (out of UX-09).
- Bulk Archive/Export — no API; Delete only (matches Contracts/Insurance pattern).
- U65 empty work-shifts: QA có thể BLOCKED-DATA cho mutate; vẫn verify toolbar hiện khi chọn (nếu có row từ FE Add) hoặc wire checkbox empty-state.

## Handoff

- `completion_report`: UX-09 Shifts checkbox wired + bulk delete toolbar + AlertDialog; helper + hook + vitest 8/8; must_keep C1/UX-03/Payroll untouched.
- `next_owner`: qa
- `ack_status`: READY_FOR_QA
- `evidence_path`: docs/qa/evidence/d-ux-ux09-shifts-bulk-01-20260728.md

## next_dispatch_prompt

```text
work_item_id: QA-UX-UX09-01
from_role: pm
to_role: qa
lane: execution
entry_criteria: D-UX-UX09-SHIFTS-BULK-01 READY_FOR_QA @ docs/qa/evidence/d-ux-ux09-shifts-bulk-01-20260728.md; U65 zero-seed; browser-only; HOLD_DEPLOY
read_first:
  - docs/qa/evidence/d-ux-ux09-shifts-bulk-01-20260728.md
  - docs/program/UX-UI-ERP-ANALYSIS.md UX-09
exit_criteria:
  - UF: login ceo@xe.vn → Chấm công → Ca làm việc → checkbox chọn ≥1 row → toolbar «Đã chọn N» + «Xóa (N)» hiện; Bỏ chọn ẩn toolbar
  - Confirm AlertDialog trước bulk/single delete; FE sau 2xx + F5 (nếu có data từ FE Add — cấm seed)
  - must_keep: Clock-In wizard C1; UX-03 search debounce; Payroll mount / taxSettlementFloatingUi C1; SalaryComponentsTab Add Zod+RHF
  - evidence_path: docs/qa/evidence/qa-ux-ux09-01-20260728.md
  - ack_status: PASS_TO_PM hoặc FAIL_TO_PM
cấm: seed · API fake · deploy
```
