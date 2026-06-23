# R-W7-MOB-LEAVE-NAV-01-R3 — GestureHandlerRootView + leave nav fix

| Field | Value |
|-------|-------|
| **work_item_id** | `R-W7-MOB-LEAVE-NAV-01-R3` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **date** | 2026-06-09 |
| **ack_status** | `READY_FOR_QA` |
| **upstream FAIL** | [`pcomp-w7-mob-batch-qa-r3-20260609.md`](pcomp-w7-mob-batch-qa-r3-20260609.md) |

## Root cause (R3)

Device logcat on APK `ADD23308…` (R2) showed **not** a navigation race:

```text
Error: PanGestureHandler must be used as a descendant of GestureHandlerRootView
```

`LeaveRequestsListScreen` / `ManagerApprovalsScreen` mount `SwipeableRow` (MOB-UX-13f) on first paint. App root lacked `GestureHandlerRootView` → React tree crash → **2822 B** blank `action_bar_root` (no tab bar, no stack header). Notifications bell worked because `InAppNotificationsScreen` has no `Swipeable`.

R1/R2 navigation experiments were red herrings; payslip-parity single-hop `TabProfile` navigate is sufficient once gesture root exists.

## Changes

| File | Change |
|------|--------|
| `App.tsx` | Wrap app in `GestureHandlerRootView` (`flex: 1`) |
| `src/navigation/profileStackNav.ts` | Payslip-parity `navigation.navigate(TabProfile, { screen })`; remove InteractionManager / CommonActions.reset |
| `src/navigation/RootNavigator.tsx` | Register `LeaveRequestsList` + `ManagerApprovals` immediately after `Profile`; `headerLargeTitle: true` |
| `src/navigation/__tests__/profileStackNav.test.ts` | R3 contract tests (GH root + single-hop nav) |

## Verification

| Gate | Command | Result |
|------|---------|--------|
| Unit tests | `pnpm test:hrm-mobile` | **435/435** PASS |
| qa-device APK | `pnpm run android:apk:qa-device` (junction `C:\xevn-ecosystem`, `GRADLE_USE_SUBST=1`) | BUILD SUCCESSFUL |
| Login smoke | `node scripts/qa-mobile-login-intent.mjs` | `home_reached: true` |
| **adb J-MOB-25** | `node scripts/tmp-leave-nav-r3-adb.mjs` | **PASS** — see device matrix |

### APK artifact

| Field | Value |
|-------|-------|
| Path | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| Size | 69,148,549 bytes (~65.96 MiB) |
| SHA-256 | `EA9BD74F3DA158F6E36391FF4EC148391BD1BA10EF7907D798D4843F38C291F5` |
| Prior FAIL APK | `ADD233085F57CE8DBD87F29E3D63CA6408E0D8E35F55671B4640763CD4FA3B02` — superseded |

### Device matrix (emulator-5554, self adb)

| Check | Result | Evidence |
|-------|--------|----------|
| `uat.nv0001@xe.vn` login | **PASS** | `qa-mobile-login-intent.mjs` exit 0 |
| `home-action-tile-time_off` | **PASS** | `r-w7-mob-leave-nav-01-r3-screens/r3-leave-list.xml` **39,047 B** |
| `leave-requests-list-screen` | **PASS** | resource-id in uiautomator |
| `leave-balance-header` | **PASS** | Còn lại **8** / Đã dùng **3** |
| Blank 2822 B regression | **PASS** | `leaveBlank: false` |
| Duyệt tile @ employee persona | **N/A** | `home-action-tile-approve` absent on `uat.nv0001` grid; ManagerApprovals shares same GH fix |

```json
{
  "leaveBlank": false,
  "leaveListScreen": true,
  "balanceHeader": true,
  "numericBalance": true,
  "xmlBytes": 39047,
  "pass": true
}
```

## QA focus (retest)

1. `adb shell pm clear vn.xevn.hrm.mobile` + install APK SHA `EA9BD74F…`.
2. `node scripts/qa-mobile-login-intent.mjs` — `uat.nv0001@xe.vn`.
3. **J-MOB-25** — `home-action-tile-time_off` → list + balance 8/3.
4. **J-MOB-11** — Đăng ký nghỉ → sick leave → `leave-attachment-picker`.
5. **Manager** — on manager persona APK/account, `home-action-tile-approve` → inbox not blank.
6. **J-MOB-16** — Đội nhóm regression.

## Handoff

```yaml
completion_report: |
  R-W7-MOB-LEAVE-NAV-01-R3 closed. Root cause PanGestureHandler without GestureHandlerRootView on
  SwipeableRow screens (not nav timing). App.tsx GH root; profileStackNav payslip-parity single hop;
  vitest 435/435; qa-device APK SHA EA9BD74F; emulator adb PASS leave-requests-list-screen +
  leave-balance-header 8/3 (39k XML). ManagerApprovals fixed by same GH root; Duyệt tile N/A on uat.nv0001 employee grid.
next_owner: qa-device
next_dispatch_prompt: |
  Operate as qa-device per `.cursor/agents/qa-device.md` for PCOMP-W7-MOB-BATCH-QA-R3 retest on R-W7-MOB-LEAVE-NAV-01-R3.
  Install APK SHA EA9BD74F3DA158F6E36391FF4EC148391BD1BA10EF7907D798D4843F38C291F5 from apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk;
  adb shell pm clear vn.xevn.hrm.mobile; qa-mobile-login-intent uat.nv0001@xe.vn; wait 12s;
  J-MOB-25 home-action-tile-time_off → leave-requests-list-screen + leave-balance-header 8/3;
  J-MOB-11 sick-leave leave-attachment-picker; manager persona Duyệt tile if in matrix;
  G4 CheckIn FAB + MOB-UX-15d + J-MOB-16 regression;
  evidence docs/qa/evidence/pcomp-w7-mob-batch-qa-r3-20260609.md; ack READY_FOR_QC or FAIL_TO_PM.
evidence_path: docs/qa/evidence/r-w7-mob-leave-nav-01-r3-20260609.md
ack_status: READY_FOR_QA
pm_dispatch_hint: qa-device PCOMP-W7-MOB-BATCH-QA-R3 — leave nav R3 APK EA9BD74F; adb self-PASS J-MOB-25
```
