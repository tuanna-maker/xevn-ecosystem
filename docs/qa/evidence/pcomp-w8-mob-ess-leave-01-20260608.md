# PCOMP-W8-MOB-ESS-LEAVE-01 — MOB-UX-07 ESS Leave (SET B/C/D)

**work_item_id:** `PCOMP-W8-MOB-ESS-LEAVE-01`  
**from_role:** dev-mobile  
**to_role:** qa  
**ack_status:** `READY_FOR_QA`  
**date:** 2026-06-08  
**spec:** `docs/program/MOBILE_HRM_ESS_UX_BENCHMARK.md` §4.2–4.4  
**persona:** `uat.nv0001@xe.vn` / `xevn-uat-2026` (employee) · manager with pending leave (J-MOB-23..24)

## Scope closed

| Exit # | Deliverable | File(s) |
|--------|-------------|---------|
| 1 | Manager card + inline Decline/Accept + confirm modals + Undo snackbar | `ManagerApprovalsScreen.tsx`, `ManagerLeaveCard.tsx`, `ConfirmActionModal.tsx`, `UndoSnackbar.tsx` |
| 2 | My Leaves tabs Review\|Approved\|Rejected + balance header + empty illustration | `LeaveRequestsListScreen.tsx`, `LeaveBalanceHeader.tsx`, `SegmentedTabBar.tsx`, `EmptyLeaveIllustration.tsx` |
| 3 | Create form balance by type + date range modal + confirm submit | `CreateLeaveRequestScreen.tsx`, `HrmDateRangeField.tsx` |
| 4 | Wire `GET /attendance/leave-balance` | `integrations/hrmLeaveBalance.ts` |
| 5 | Vitest + tsc | see Verification |

## API contract

```http
GET /api/hrm/attendance/leave-balance?company_id={uuid}&employee_id={uuid}&leave_type=annual
```

- List screen: `annual` balance for header cards (`available_days`, `used_days`).
- Create screen step 2: balance refetch on `leave_type` change.

## Journeys (QA L2.5)

| ID | Steps |
|----|-------|
| J-MOB-23 | Manager → Đơn duyệt (More) → filter Nghỉ phép → card per employee → inline Từ chối/Duyệt |
| J-MOB-24 | Tap Duyệt/Từ chối → confirm modal (icon) → success → snackbar «Hoàn tác» 5s |
| J-MOB-25 | Employee → Đơn công → Nghỉ phép → Kỳ nghỉ header + Còn lại/Đã dùng cards |
| J-MOB-26 | Tabs Đang xét \| Đã duyệt \| Từ chối → sections grouped by submission date |
| J-MOB-27 | Empty tab → calendar illustration → «Đăng ký nghỉ» → CreateLeaveRequest |
| J-MOB-28 | Create → step 2 → «Còn lại: X ngày» from leave-balance API |
| J-MOB-29 | Create → step 1 date range modal → step 4 → confirm submit modal |

## Verification

```bash
pnpm --filter hrm-mobile test
pnpm --filter hrm-mobile run type-check
```

**New tests:**

- `src/integrations/__tests__/hrmLeaveBalance.test.ts`
- `src/utils/__tests__/leaveListGrouping.test.ts`
- `src/components/ui/__tests__/essLeaveUx.test.ts`

**Note:** Shell hooks blocked automated run in dev-mobile session — PM/QA must execute commands above (expect PASS).

## Residual / GWC

| Item | Owner | Notes |
|------|-------|-------|
| Undo API | — | BR-ESS-UNDO-01: Undo shows HR contact alert; no revert endpoint |
| Manager online dot | dev-mobile optional | `online` prop stub `false` until presence API |
| 4-step wizard kept | — | Benchmark allows wizard; step 0 uses range modal polish |

## Regression

- Smart Hub J-MOB-06..09 untouched (`DashboardScreen.tsx`)
- Write header UUID split unchanged (`hrmApiClient.ts`)
