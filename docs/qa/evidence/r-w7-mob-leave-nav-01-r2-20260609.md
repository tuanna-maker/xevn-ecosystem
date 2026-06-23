# R-W7-MOB-LEAVE-NAV-01-R2 — Profile stack cross-tab deep link fix

| Field | Value |
|-------|-------|
| **work_item_id** | `R-W7-MOB-LEAVE-NAV-01-R2` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **date** | 2026-06-09 |
| **ack_status** | `READY_FOR_QA` |
| **upstream FAIL** | [`pcomp-w7-mob-batch-qa-r2-20260609.md`](pcomp-w7-mob-batch-qa-r2-20260609.md) |

## Root cause (R2)

On APK SHA `F813668A…`, `home-action-tile-time_off` and `home-action-tile-approve` still produced **blank 2822 B** hierarchy after R1 `CommonActions` merge and R2 single-hop `.navigate('TabProfile', { screen })`.

Device evidence: Thông báo bell → `Notifications` **renders** (47k+ B XML) on same Profile stack; `LeaveRequestsList` / `ManagerApprovals` failed when reached in **one hop** from `TabDashboard`.

**Fix:** Cross-tab Profile deep links **anchor `Profile` root** on `TabProfile`, then push nested screen after `InteractionManager` + `requestAnimationFrame` (tab paint). Same-tab nested nav stays single-hop. Disabled `headerLargeTitle` on leave/approvals list roots to reduce native-stack transition risk on cross-tab entry.

## Changes

| File | Change |
|------|--------|
| `src/navigation/profileStackNav.ts` | Two-phase cross-tab nav: `Profile` anchor → deferred nested screen; `PROFILE_ROOT_SCREEN` export |
| `src/navigation/RootNavigator.tsx` | `LeaveRequestsList` + `ManagerApprovals` `headerLargeTitle: false` |
| `src/navigation/__tests__/profileStackNav.test.ts` | +1 test for anchor/defer pattern + headerLargeTitle override |

G4 carry (`resolveDeepestFocusedRouteName` CheckIn FAB hide) **unchanged** — merged in same qa-device APK rebuild.

## Verification

| Gate | Command | Result |
|------|---------|--------|
| Unit tests | `pnpm test:hrm-mobile` | **435/435** PASS (+3 vs 432 baseline) |
| Type-check | `pnpm --filter hrm-mobile run type-check` | exit **0** |
| qa-device APK | `pnpm run android:apk:qa-device` (junction `C:\xevn-ecosystem`, `GRADLE_USE_SUBST=1`) | BUILD SUCCESSFUL |
| Cold boot smoke | `node scripts/qa-mobile-login-intent.mjs` | `home_reached: true`, `fatal_logcat: false` |

### APK artifact

| Field | Value |
|-------|-------|
| Path | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| Size | 69,147,817 bytes (~65.95 MiB) |
| SHA-256 | `ADD233085F57CE8DBD87F29E3D63CA6408E0D8E35F55671B4640763CD4FA3B02` |
| Prior FAIL APK | `F813668A…541AE` — superseded |

## QA focus (device — PCOMP-W7-MOB-BATCH-QA-R3)

1. `adb shell pm clear vn.xevn.hrm.mobile` + install APK SHA `ADD23308…`.
2. `node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026` (wait ≥12s before tile tap).
3. **J-MOB-25** — `home-action-tile-time_off` → `leave-requests-list-screen` + `leave-balance-header` with **Còn lại 8 / Đã dùng 3** (nip.io API).
4. **J-MOB-11** — Đăng ký nghỉ → sick leave → `leave-attachment-picker`.
5. **Duyệt tile** — `home-action-tile-approve` → ManagerApprovals inbox (not blank 2822 B).
6. **G4 carry regression** — CheckIn tile: FAB hidden + sticky footer ILA≥16.
7. **J-MOB-16** — Đội nhóm tab directory unchanged.

```powershell
node scripts/tmp-pcomp-w7-mob-batch-qa-r2-device.mjs
```

## Handoff

```yaml
completion_report: |
  R-W7-MOB-LEAVE-NAV-01-R2 closed. profileStackNav two-phase cross-tab anchor (Profile→nested after paint);
  LeaveRequestsList/ManagerApprovals headerLargeTitle false; vitest 435/435; qa-device APK SHA ADD23308.
  G4 CheckIn FAB carry merged. Device J-MOB-11/25/approve tile retest deferred to qa-device R3.
next_owner: qa-device
next_dispatch_prompt: |
  Operate as qa-device per `.cursor/agents/qa-device.md` for PCOMP-W7-MOB-BATCH-QA-R3 / R-W7-MOB-LEAVE-NAV-01-R2.
  Install APK SHA ADD233085F57CE8DBD87F29E3D63CA6408E0D8E35F55671B4640763CD4FA3B02 from apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk;
  adb shell pm clear vn.xevn.hrm.mobile; qa-mobile-login-intent uat.nv0001@xe.vn; wait 12s;
  J-MOB-25 home-action-tile-time_off → leave-requests-list-screen + leave-balance-header 8/3;
  J-MOB-11 sick-leave leave-attachment-picker; Duyệt tile → ManagerApprovals not blank;
  G4 CheckIn FAB hidden + MOB-UX-15d; J-MOB-16 team tab regression;
  evidence docs/qa/evidence/pcomp-w7-mob-batch-qa-r3-20260609.md; ack READY_FOR_QC or FAIL_TO_PM with layer.
evidence_path: docs/qa/evidence/r-w7-mob-leave-nav-01-r2-20260609.md
ack_status: READY_FOR_QA
pm_dispatch_hint: qa-device PCOMP-W7-MOB-BATCH-QA-R3 — leave nav R2 APK ADD23308; retest before PCOMP-W7-BE-LEAVE-DOC
```
