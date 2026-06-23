# R-W7-MOB-LEAVE-NAV-01-R4 — Manager approve tile nav fix

| Field | Value |
|-------|-------|
| **work_item_id** | `R-W7-MOB-LEAVE-NAV-01-R4` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **date** | 2026-06-09 |
| **ack_status** | `READY_FOR_QA` |
| **upstream FAIL** | [`p1-g3-jmob-05-strict-r2-20260609.md`](p1-g3-jmob-05-strict-r2-20260609.md) |
| **base APK** | EA9BD74F (R3 GH root — leave list PASS, manager tile still blank) |

## Root cause (R4)

R3 `GestureHandlerRootView` in `App.tsx` fixed **leave list** when no `SwipeableRow` mounted (empty/shimmer-only first paint). **Manager inbox** on `uat.nv0002@xe.vn` loads pending rows immediately → `SwipeableRow` mounted during `TabProfile` cross-tab transition before gesture root + stack paint → **2822 B** blank `action_bar_root` (same class as R1–R3).

Contributing factors:

1. `import 'react-native-gesture-handler'` was **after** `vectorIconFontsGuard` in `index.ts` (RNGH requires first import).
2. `navigateToManagerApprovals` fired nested push synchronously on tab switch.
3. No deferred swipe mount on `ManagerApprovalsScreen` (unlike leave list loading gate).

## Changes

| File | Change |
|------|--------|
| `index.ts` | `react-native-gesture-handler` import **first** |
| `src/hooks/useDeferredSwipeMount.ts` | Defer `SwipeableRow` until `InteractionManager` + double `rAF` after focus |
| `ManagerApprovalsScreen.tsx` | Nested `GestureHandlerRootView`, `testID=manager-approvals-screen`, deferred swipe wrapper, React `key` on rows |
| `profileStackNav.ts` | `navigateToManagerApprovals` double-`rAF` defer before nested push |
| `profileStackNav.test.ts` | R4 contract tests (import order, rAF defer) |
| `mobUx13f.test.ts` | R4 deferred-swipe + GH root assertions |

## Verification

| Gate | Command | Result |
|------|---------|--------|
| Unit tests | `pnpm test:hrm-mobile` | **438/438** PASS |
| TypeScript | `pnpm --filter hrm-mobile run type-check` | PASS |
| qa-device APK | `pnpm --filter hrm-mobile run android:apk:qa-device` (`GRADLE_USE_SUBST=1`) | BUILD SUCCESSFUL |
| **adb nv0002 approve tile** | `node scripts/tmp-r-w7-mob-leave-nav-r4-adb.mjs` | **PASS** |

### APK artifact

| Field | Value |
|-------|-------|
| Path | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| Size | 69,149,722 bytes (~65.96 MiB) |
| SHA-256 | `A00B6433A1C2B4220DA7DD8D84489E81DAF8AF968BEDCAFAB14FDD00F01FB4A7` |
| Prior FAIL APK | `EA9BD74F3DA158F6E36391FF4EC148391BD1BA10EF7907D798D4843F38C291F5` — superseded |

### Device matrix (emulator-5554, self adb)

| Check | Result | Evidence |
|-------|--------|----------|
| `uat.nv0002@xe.vn` deep-link login | **PASS** | `r-w7-mob-leave-nav-01-r4-screens/r4-home.xml` |
| `home-action-tile-approve` tap | **PASS** | tile bounds → tap |
| ManagerApprovals inbox | **PASS** | `r4-approvals.xml` **30,017 B** (≥30k gate) |
| Filter chips | **PASS** | `Tất cả (2)`, `Chỉnh sửa CC (1)`, `Nghỉ phép (1)` |
| Stack header | **PASS** | `Phê duyệt` + back |
| Pending row + Duyệt CTA | **PASS** | `manager-swipe-leave-*`, `content-desc="Duyệt"` |
| Blank 2822 B regression | **PASS** | `blank: false` |

```json
{
  "pass": true,
  "blank": false,
  "xmlBytes": 30017,
  "filterChips": true,
  "apkSha": "A00B6433A1C2B4220DA7DD8D84489E81DAF8AF968BEDCAFAB14FDD00F01FB4A7"
}
```

## QA focus (retest)

1. `adb shell pm clear vn.xevn.hrm.mobile` + install APK SHA `A00B6433…`.
2. `node scripts/tmp-p1-g3-jmob-05-strict-device.mjs` — **P1-G3-JMOB-05-STRICT-R2** full Duyệt → **Thành công** (no 409).
3. Regression: `home-action-tile-time_off` leave list (J-MOB-25), J-MOB-16 team directory.

## Handoff

```yaml
completion_report: |
  R-W7-MOB-LEAVE-NAV-01-R4 closed. Manager approve tile blank 2822B fixed: RNGH first import,
  deferred SwipeableRow mount + nested GH root on ManagerApprovals, double-rAF nav defer.
  vitest 438/438; tsc PASS; qa-device APK SHA A00B6433; emulator adb nv0002 approve tile →
  Phê duyệt inbox 30k XML with filter chips + Duyệt CTA (pending leave row).
next_owner: qa-device
next_dispatch_prompt: |
  Operate as qa-device per `.cursor/agents/qa-device.md` for P1-G3-JMOB-05-STRICT-R2 retest on R-W7-MOB-LEAVE-NAV-01-R4.
  Install APK SHA A00B6433A1C2B4220DA7DD8D84489E81DAF8AF968BEDCAFAB14FDD00F01FB4A7 from apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk;
  adb shell pm clear vn.xevn.hrm.mobile; deep-link uat.nv0002@xe.vn; pending gate leave≥1 or update≥1;
  home-action-tile-approve → ManagerApprovals inbox ≥30k XML; tap Duyệt → Vietnamese Thành công, no 409/HRM-ATT-REQ-203;
  evidence docs/qa/evidence/p1-g3-jmob-05-strict-r2-20260609.md (or R3 rerun filename); ack PASS_TO_PM or FAIL_TO_PM.
evidence_path: docs/qa/evidence/r-w7-mob-leave-nav-01-r4-20260609.md
ack_status: READY_FOR_QA
pm_dispatch_hint: qa-device P1-G3-JMOB-05-STRICT-R2 — R4 APK A00B6433; adb self-PASS nv0002 approve nav; full Duyệt strict retest
```
