# P1-HRM-H8C-MOB-REST — Remaining legacy dark screens light theme

**work_item_id:** `P1-HRM-H8C-MOB-REST`  
**owner:** dev-mobile  
**date:** 2026-06-06  
**ack_status:** `READY_FOR_QA`

## Scope closed

Light professional UI on the last 5 legacy dark screens — aligned with H8/H8B design tokens (`src/theme/tokens.ts`) and shared components (`AppScreenLayout`, `ListRow`, `PrimaryButton`, `StatusBadge`, `FormField`, `DetailRow`, `SurfaceCard`).

| Screen | Changes |
|--------|---------|
| `ScopeScreen` | AppScreenLayout scroll; membership ListRows + StatusBadge "Đang dùng"; empty state |
| `UpdateRequestsScreen` | Light chips + ListRow list; header nav actions; loading/error/empty parity with LeaveRequestsList |
| `PayrollSummaryScreen` | ListRow period cards + status badges; pull-to-refresh; loading shell |
| `PayslipDetailScreen` | AppScreenLayout + StatusBadge + SurfaceCard/DetailRow; vi-VN amount formatting |
| `InAppNotificationsScreen` | SurfaceCard sections; PrimaryButton actions; ListRow inbox; pull-to-refresh via AppScreenLayout |

**Unchanged:** All API paths, auth scope, `hrmApiClient`, offline queue, JWT/header logic, `selectMembership` flow.

## Verification

| Check | Command | Result |
|-------|---------|--------|
| Unit tests | `pnpm test` (hrm-mobile) | **41/41 PASS** exit 0 |
| TypeScript | `pnpm run type-check` | **PASS** exit 0 |
| Legacy dark grep | `rg '#0f172a' apps/mobile/hrm-mobile/src` | **0 matches** |

## Manual smoke (QA / qa-device)

**Account:** `uat.nv0001@xe.vn` / `xevn-uat-2026`

| Journey | Steps | Expect |
|---------|-------|--------|
| Scope | Cài đặt → Phạm vi | Light ListRow cards; tap switch membership; badge on active |
| J-MOB-07 Update list | Đơn công tab / UpdateRequests | Filter chips; ListRow; tap → detail unchanged |
| J-MOB-04 Payroll | Thêm → Lương → kỳ → phiếu | PayrollSummary ListRows; PayslipDetail cards + amounts |
| J-MOB-13 Notifications | Cài đặt → Thông báo | Summary cards; refresh; inbox mark-read PATCH |

**Residual:** None for H8C scope — all mobile screens now use light tokens.

## Files touched

- `src/features/auth/ScopeScreen.tsx`
- `src/features/attendance/UpdateRequestsScreen.tsx`
- `src/features/payroll/PayrollSummaryScreen.tsx`
- `src/features/payroll/PayslipDetailScreen.tsx`
- `src/features/notifications/InAppNotificationsScreen.tsx`
