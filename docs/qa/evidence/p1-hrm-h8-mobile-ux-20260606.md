# P1-HRM-H8-MOB-UX — Mobile design system & screen polish

**work_item_id:** `P1-HRM-H8-MOB-UX`  
**owner:** dev-mobile  
**date:** 2026-06-06  
**ack_status:** `READY_FOR_QA`

## Scope closed

1. **Design tokens** — `apps/mobile/hrm-mobile/src/theme/tokens.ts` mirrors web-portal `tailwind.config.cjs` (`xevn.primary`, `surface`, `border`, spacing, radius, typography).
2. **Shared UI** — `AppScreenLayout`, `PrimaryButton`, `ListRow`, `StatusBadge`, `SurfaceCard` under `src/components/ui/`.
3. **Screen refactors** (Vietnamese labels, cards, loading/empty/error):
   - `DashboardScreen` — KPI cards, no UC/debug text blocks
   - `LoginScreen` — branded light login; dev fields only in `__DEV__`
   - `ManagerApprovalsScreen` — list cards + approve/reject actions
   - `PayslipListScreen` — `ListRow` + pull-to-refresh
   - `LeaveRequestsListScreen` — filter chips + `ListRow`
4. **Navigation shell** — light theme tab bar + `DefaultTheme` aligned to tokens (`RootNavigator.tsx`, `App.tsx` StatusBar dark).
5. **API integrations unchanged** — no edits to `hrmApiClient`, auth scope, payroll query helpers.

## Verification

| Check | Command | Result |
|-------|---------|--------|
| Unit tests | `pnpm test` (hrm-mobile) | **41/41 PASS** |
| TypeScript | `pnpm run type-check` | **PASS** |
| Token parity | `src/theme/__tests__/tokens.test.ts` | web-portal hex match |

## Manual smoke (QA / qa-device)

**Account:** `uat.nv0001@xe.vn` / `xevn-uat-2026` (or manager persona for approvals)

| Journey | Steps | Expect |
|---------|-------|--------|
| J-MOB-01 Login | Open app → email/password → đăng nhập | Light branded screen; vào tab Trang chủ |
| J-MOB-02 Dashboard | Tab Trang chủ → kéo refresh | KPI cards (Hệ thống, Chấm công, Đơn chờ); không raw UC text |
| J-MOB-04 Payslip | Thêm → Lương → kỳ → danh sách | `ListRow` + empty/loading/error states |
| J-MOB-05 Approvals | Thêm → Phê duyệt (manager) | Card list; Duyệt/Từ chối; success toast tiếng Việt |
| Leave list | Đơn công → Đơn nghỉ | Filter chips; badge trạng thái; tap → detail |

**Residual (out of H8 scope):** Other tabs (Chấm công, Cài đặt, …) still use legacy dark inline styles — functional, not restyled this wave.

## Files touched

- `src/theme/tokens.ts`, `src/theme/__tests__/tokens.test.ts`
- `src/components/ui/*`
- `src/features/dashboard/DashboardScreen.tsx`
- `src/features/auth/LoginScreen.tsx`
- `src/features/attendance/ManagerApprovalsScreen.tsx`
- `src/features/attendance/LeaveRequestsListScreen.tsx`
- `src/features/payroll/PayslipListScreen.tsx`
- `src/navigation/RootNavigator.tsx`, `App.tsx`

---

## QA retest (2026-06-06)

**QA evidence:** [`p1-hrm-h8-mobile-ux-qa-20260606.md`](p1-hrm-h8-mobile-ux-qa-20260606.md)  
**verdict:** `PASS_TO_PM`  
**automation:** `pnpm test` 41/41 exit 0 · `pnpm run type-check` exit 0  
**static UX:** light tokens, KPI cards (no debug), branded login, ListRow on payslips/leave/approvals — all PASS  
**device:** emulator unavailable (`adb devices` empty); J-MOB functional carry-forward R4
