# P1-HRM-H8B-MOB-TABS — Remaining tab screens light theme

**work_item_id:** `P1-HRM-H8B-MOB-TABS`  
**owner:** dev-mobile  
**date:** 2026-06-06  
**ack_status:** `READY_FOR_QA`

## Scope closed

Light professional UI on remaining mobile tabs — aligned with H8 design tokens (`src/theme/tokens.ts`) and shared components (`AppScreenLayout`, `ListRow`, `PrimaryButton`, `StatusBadge`, `SurfaceCard`, new `FormField` + `DetailRow`).

| Screen | Changes |
|--------|---------|
| `CheckInScreen` | AppScreenLayout, employee chips, FormField, PrimaryButton; removed dark/UC debug styling |
| `AttendanceHistoryScreen` | ListRow + StatusBadge, pull-to-refresh, empty/error states |
| `SettingsScreen` | SurfaceCard scope block, FormField, nav ListRows, PrimaryButton actions |
| `ProfileScreen` | SurfaceCard form, loading/refresh, save PrimaryButton |
| `ContractsScreen` | SectionList with ListRow + status badges |
| `OperationsScreen` | Tab chips, ListRow actions (task done / service approve-reject) |
| `CreateLeaveRequestScreen` | Grouped SurfaceCard form sections |
| `CreateUpdateRequestScreen` | Grouped SurfaceCard form sections |
| `LeaveRequestDetailScreen` | AppScreenLayout + StatusBadge + DetailRow cards |
| `UpdateRequestDetailScreen` | AppScreenLayout + StatusBadge + DetailRow cards |

**New shared UI:** `FormField.tsx`, `DetailRow.tsx` under `src/components/ui/`.

**Unchanged:** All API paths, auth scope, `hrmApiClient`, offline queue, JWT/header logic.

## Verification

| Check | Command | Result |
|-------|---------|--------|
| Unit tests | `pnpm test` (hrm-mobile) | **41/41 PASS** exit 0 |
| TypeScript | `pnpm run type-check` | **PASS** exit 0 |

## Manual smoke (QA / qa-device)

**Account:** `uat.nv0001@xe.vn` / `xevn-uat-2026` (manager: approvals/operations persona)

| Journey | Steps | Expect |
|---------|-------|--------|
| J-MOB-03 Check-in | Tab Chấm công → chọn NV → Ghi nhận | Light form; success alert; không dark theme |
| J-MOB-03 History | Chấm công → Lịch sử | ListRow cards + badge; pull refresh |
| Settings | Thêm → Cài đặt | Light cards; scope info; nav ListRows |
| Profile | Cài đặt → Hồ sơ | Form cards; save PATCH unchanged |
| Contracts | Thêm → Hợp đồng | Section headers + ListRow |
| Operations | Thêm → Vận hành (manager) | Tabs; task create; approve/reject buttons |
| Leave create | Đơn nghỉ → + Tạo | Grouped form; POST unchanged |
| Leave detail | Tap list row | StatusBadge + detail cards |
| Update create/detail | Đơn công flow | Same light pattern |

**Residual (out of H8B scope):** `ScopeScreen`, `UpdateRequestsScreen`, `PayrollSummaryScreen`, `PayslipDetailScreen`, `InAppNotificationsScreen` still legacy dark inline styles — functional, not restyled this wave.

## Files touched

- `src/components/ui/FormField.tsx`, `DetailRow.tsx`
- `src/features/attendance/CheckInScreen.tsx`
- `src/features/attendance/AttendanceHistoryScreen.tsx`
- `src/features/attendance/CreateLeaveRequestScreen.tsx`
- `src/features/attendance/CreateUpdateRequestScreen.tsx`
- `src/features/attendance/LeaveRequestDetailScreen.tsx`
- `src/features/attendance/UpdateRequestDetailScreen.tsx`
- `src/features/settings/SettingsScreen.tsx`
- `src/features/profile/ProfileScreen.tsx`
- `src/features/contracts/ContractsScreen.tsx`
- `src/features/operations/OperationsScreen.tsx`
