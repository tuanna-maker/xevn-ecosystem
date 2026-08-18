# D-UX-UX03-DEBOUNCE-01 — Shifts + Contracts search debounce

**Date:** 2026-07-28  
**Role:** dev-fe  
**change_mode:** FIX  
**ack_status:** READY_FOR_QA  
**U65:** no seed · HOLD_DEPLOY  
**Root:** `C:\xevn-ecosystem` (junction → workspace)

## Spec / intent

- UX-03 (`docs/program/UX-UI-ERP-ANALYSIS.md`): Shifts search placeholder-only → wire + debounce 300ms; Contracts same efficiency pattern.
- Patch source: `docs/qa/evidence/ux03-shifts-search.patch` (Claude paused Attendance concurrency — Cursor apply).

## Closed

| Area | Change |
|------|--------|
| Helper | `apps/web/hrm/src/hooks/useDebouncedValue.ts` — generic 300ms debounce + cleanup |
| Unit test | `useDebouncedValue.test.ts` — delay + reset-on-retype (**2/2 PASS**) |
| Shifts | `Attendance.tsx` — `shiftsSearchQuery` + Input `value`/`onChange`; filter code/name/unit via `debouncedShiftsSearch` → `filteredShiftsData` |
| Contracts | Already had onChange (not placeholder-only) — added debounce on **filter** path only; Input still instant |
| CODE-MEMORY | APPEND VI on Attendance + Contracts + helper |

## must_keep verified (grep / no touch)

| Guard | Status |
|-------|--------|
| Clock-In wizard C1 (`CLOCK_IN_ATTENDANCE_TYPE`, `openClockInWizard`) | Untouched logic |
| `taxSettlementFloatingUi` | Not in Attendance; Payroll path not touched |
| Sheets / weekly placeholder search Inputs | Left as-is (out of UX-03 Shifts scope) |
| x-bos-core / seed / deploy | Forbidden — not touched |

## Verify commands

```bash
pnpm --filter vite_react_shadcn_ts exec vitest run src/hooks/useDebouncedValue.test.ts
# → 2 passed
```

## Residual

- Sheets / weekly attendance search Inputs still placeholder-only (out of this WI).
- UX-09 Shifts bulk toolbar still pending (after UX-03 CLOSED).

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: QA-UX-UX03-01
from_role: pm
to_role: qa
lane: execution
entry_criteria: D-UX-UX03-DEBOUNCE-01 READY_FOR_QA; U65 zero-seed; browser-only; HOLD_DEPLOY
read_first:
  - docs/qa/evidence/d-ux-ux03-debounce-01-20260728.md
  - docs/program/UX-UI-ERP-ANALYSIS.md UX-03
exit_criteria:
  - UF smoke Shifts: login ceo@xe.vn → Chấm công → Ca làm việc → gõ search → Input phản hồi tức thì; sau ~300ms bảng lọc theo mã/tên/đơn vị; xóa keyword → list đầy đủ
  - UF smoke Contracts: Hợp đồng → search → Input tức thì; filter debounce ~300ms theo tên NV / mã HĐ / phòng
  - must_keep: Clock-In wizard C1 vẫn mở từ tab Chấm công; không regression Payroll taxSettlementFloatingUi
  - evidence_path: docs/qa/evidence/qa-ux-ux03-01-20260728.md
  - ack_status: PASS_TO_PM hoặc FAIL_TO_PM
cấm: seed · API fake · deploy
```

## Handoff

- `completion_report`: Shifts search wired + debounce 300ms + client filter; Contracts debounce on filter; helper + vitest 2/2.
- `next_owner`: qa
- `ack_status`: READY_FOR_QA
- `evidence_path`: docs/qa/evidence/d-ux-ux03-debounce-01-20260728.md
