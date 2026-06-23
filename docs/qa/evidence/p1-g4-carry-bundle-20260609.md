# P1-G4-CARRY-BUNDLE — MOB-PARTNER-QC carry closure

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-G4-CARRY-BUNDLE` |
| **owner** | dev-mobile |
| **date** | 2026-06-09 |
| **ack_status** | **READY_FOR_QA** |
| **prior QC** | `qc-mob-partner-01-20260609.md` GWC carry rows |

## Scope closed

### CARRY-G4-01 / R3-CHECKIN-FAB-01 — Hide center FAB on CheckIn

**Root cause:** `CheckInFabOverlay` sits outside `Tab.Navigator`; shallow `useNavigationState` returned tab key `TabAttendance` instead of leaf `CheckIn`, so `shouldHideCheckInFab` never fired on device.

**Fix:**

- `resolveDeepestFocusedRouteName()` in `checkInFab.ts` — recursive walk Main → Tab → AttendanceStack leaf.
- `CheckInFabOverlay` uses `useNavigationState(resolveDeepestFocusedRouteName)`; returns `null` when route is `CheckIn`.
- Vitest nested-state case: Main/TabAttendance/CheckIn → hide; TeamDirectory → show.

### MOB-UX-15d — `check_in_out` Vietnamese labels

Bundled verification (shipped in prior wave; regression re-run):

| Wire token | Vietnamese |
|------------|------------|
| `check_in_out` | Giờ vào và ra |
| `check_in` | Giờ vào |
| `check_out` | Giờ ra |

Wired paths: `UpdateRequestsScreen`, `UpdateRequestDetailScreen`, `ManagerApprovalsScreen`, `inboxNotificationCopy`, `dashboardHub`, `profileTask`.

## APK artifact

| Field | Value |
|-------|-------|
| Path | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| Size | 69,150,021 bytes (~65.94 MiB) |
| SHA-256 | `F813668A86D6FF62628AAFC1ADB3A824E86224B9C2BF348CEF37367F230541AE` |
| Build | `GRADLE_USE_SUBST=1` junction `C:\xevn-ecosystem`; `android:apk:qa-device` full Gradle (no jar-patch) |

## Verification

| Command | Result |
|---------|--------|
| `pnpm test:hrm-mobile` | exit **0** — **433/433** |
| `pnpm run verify:mobile:layout` | exit **0** |
| `pnpm run test:mobile:user-copy` | exit **0** (23 TSX + scopeError 4/4) |
| `pnpm --filter hrm-mobile run type-check` | exit **0** |
| `qa-mobile-login-intent.mjs` | skipped — no adb device in dev shell |

## Files touched (this bundle)

- `apps/mobile/hrm-mobile/src/navigation/checkInFab.ts` — `resolveDeepestFocusedRouteName`
- `apps/mobile/hrm-mobile/src/components/navigation/CheckInFabOverlay.tsx` — deepest route resolver
- `apps/mobile/hrm-mobile/src/navigation/__tests__/checkInFab.test.ts` — R3-CHECKIN-FAB-01 nested state
- `apps/mobile/hrm-mobile/src/theme/__tests__/mobUx16d.test.ts` — overlay wiring assert

## QA device matrix (mandatory)

Account: `uat.nv0001@xe.vn` / `xevn-uat-2026` @ nip.io qa-device APK above.

| Journey / check | Pass criteria |
|-----------------|---------------|
| **R3-CHECKIN-FAB-01** | FAB → Chấm công → uiautomator **no** `check-in-fab` on CheckIn; `check-in-sticky-footer` visible |
| **R-15a-COPY-01** | Manager inbox / Thông báo subtitle contains «Giờ vào và ra» — **not** `check_in_out` |
| **J-MOB-05** | Duyệt row «Chỉnh sửa chấm công · Giờ vào và ra» |
| ILA CheckIn | Target **16/20** (was 15/20 with FAB competition) |

Install: `adb install -r apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` then `adb shell pm clear vn.xevn.hrm.mobile` before retest.

## Residual

- Device ILA scorecard confirm CheckIn **16/20** on SHA `F813668A…`.
- BE FCM `push-outbound.service.ts` may still emit raw `update_type` — out of mobile scope.
- CARRY-G4-03..11 (Settings device spot, J-MOB-05 strict seed, persona 13e/f/g) — separate QA waves.

## Handoff

```yaml
completion_report: |
  P1-G4-CARRY-BUNDLE closed dev scope: R3-CHECKIN-FAB-01 deepest-route FAB hide + MOB-UX-15d
  check_in_out label regression verified. Fresh qa-device APK SHA F813668A…541AE.
  vitest 433/433; verify:mobile:layout + test:mobile:user-copy PASS; tsc PASS.
  Device smoke deferred — no emulator attached in dev shell.
next_owner: qa-device
next_dispatch_prompt: |
  work_item_id P1-G4-CARRY-BUNDLE-QA — retest MOB-PARTNER-QC carry on APK SHA
  F813668A86D6FF62628AAFC1ADB3A824E86224B9C2BF348CEF37367F230541AE @ emulator-5554.
  Entry: docs/qa/evidence/p1-g4-carry-bundle-20260609.md; account uat.nv0001@xe.vn / xevn-uat-2026 @ nip.io.
  Exit: (1) uiautomator on CheckIn — assert absent testID check-in-fab, present check-in-sticky-footer;
  (2) manager Duyệt or Thông báo row — subtitle «Giờ vào và ra» not check_in_out;
  (3) ILA CheckIn score ≥16/20; ack PASS_TO_PM or FAIL with layer + screenshot path.
evidence_path: docs/qa/evidence/p1-g4-carry-bundle-20260609.md
ack_status: READY_FOR_QA
pm_dispatch_hint: qa-device P1-G4-CARRY-BUNDLE-QA — FAB hide + 15d copy on SHA F813668A…
```
