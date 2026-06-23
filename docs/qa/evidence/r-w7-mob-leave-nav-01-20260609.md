# R-W7-MOB-LEAVE-NAV-01 — Home time_off tile → LeaveRequestsList

| Field | Value |
|-------|-------|
| **work_item_id** | `R-W7-MOB-LEAVE-NAV-01` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **date** | 2026-06-09 |
| **ack_status** | `READY_FOR_QA` |
| **upstream FAIL** | [`pcomp-w7-mob-batch-qa-20260609.md`](pcomp-w7-mob-batch-qa-20260609.md) |

## Root cause

1. **Nested navigation** — `navigate('TabProfile', { screen: 'LeaveRequestsList' })` from `TabDashboard` could leave Profile stack in a blank intermediate state after UX09 IA (leave under Profile stack, not root tab).
2. **QA home lock race** — `useQaMatrixHomeLock` called `TabActions.jumpTo('TabDashboard')` every **800ms for 6s** after sign-in. Batch QA taps `home-action-tile-time_off` ~9s post deep-link; when auth hydrated late, lock fought tab switch → empty hierarchy (2822 B XML, no tab bar).

## Fix

| File | Change |
|------|--------|
| `src/navigation/profileStackNav.ts` | **NEW** — `CommonActions.navigate` with `merge: true`, `initial: false` for `TabProfile` → `LeaveRequestsList` / create / detail |
| `DashboardScreen.tsx` | `time_off` tile + hub paths use `navigateToLeaveRequestsList` |
| `FabPrimaryActionSheet.tsx` | create leave uses `navigateToCreateLeaveRequest` |
| `ProfileScreen.tsx` | quick-action leave uses shared helper |
| `useQaMatrixHomeLock.ts` | Replace 6s interval with 3 one-shot pins (0 / 500 / 1500ms) |
| `LeaveBalanceHeader.tsx` | `testID="leave-balance-header"` |
| `LeaveRequestsListScreen.tsx` | `testID="leave-requests-list-screen"` |

## Verification

| Gate | Command | Result |
|------|---------|--------|
| Unit tests | `pnpm test:hrm-mobile` | **432/432** PASS (+3 `profileStackNav.test.ts`) |
| Type-check | `pnpm --filter hrm-mobile run type-check` | exit **0** |
| qa-device APK | `pnpm run android:apk:qa-device` (junction `C:\xevn-ecosystem`, `GRADLE_USE_SUBST=1`) | BUILD SUCCESSFUL |

### APK artifact

| Field | Value |
|-------|-------|
| Path | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| Size | 69,148,785 bytes (~65.95 MiB) |
| SHA-256 | `7C7A75FB7A057F7694B2126B3F243DF9BE52CABE6FDAAD54E88F72F623EF3B77` |
| Prior FAIL APK | `676E097F…B382AD0` — superseded |

## QA focus (device — J-MOB-11 / J-MOB-25)

1. `adb shell pm clear vn.xevn.hrm.mobile` + install APK above.
2. `node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026`
3. Tap `home-action-tile-time_off` (Nghỉ phép) → expect `leave-requests-list-screen` + `leave-balance-header` with **Còn lại / Đã dùng** (API 8/3 @ nip.io).
4. Tap **Đăng ký nghỉ** → wizard step 2+; sick leave shows `leave-attachment-picker`.
5. Regression: payroll tile → `TabPayslip`; team tab J-MOB-16 unchanged.

## Handoff

```yaml
completion_report: |
  R-W7-MOB-LEAVE-NAV-01 closed. profileStackNav CommonActions merge fix + QA home-lock race removed.
  Vitest 432/432; qa-device APK SHA 7C7A75FB. Device smoke deferred (no emulator attached in dev session).
  Residual: J-MOB-12 profile seed (dev-be), attachment BE after UI reachable.
next_owner: qa-device
next_dispatch_prompt: |
  Operate as qa-device per `.cursor/agents/qa-device.md` for PCOMP-W7-MOB-BATCH-QA-R2 / R-W7-MOB-LEAVE-NAV-01.
  Install APK SHA 7C7A75FB7A057F7694B2126B3F243DF9BE52CABE6FDAAD54E88F72F623EF3B77 from apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk;
  adb shell pm clear vn.xevn.hrm.mobile; qa-mobile-login-intent uat.nv0001@xe.vn;
  J-MOB-11 home-action-tile-time_off → leave list + balance 8/3 + sick-leave leave-attachment-picker;
  J-MOB-25 balance header numeric; J-MOB-16 directory regression;
  evidence docs/qa/evidence/pcomp-w7-mob-batch-qa-r2-20260609.md; ack READY_FOR_QC or FAIL_TO_PM with layer.
evidence_path: docs/qa/evidence/r-w7-mob-leave-nav-01-20260609.md
ack_status: READY_FOR_QA
pm_dispatch_hint: qa-device PCOMP-W7-MOB-BATCH-QA-R2 — leave nav fix landed; retest J-MOB-11/25 before PCOMP-W7-BE-LEAVE-DOC
```
