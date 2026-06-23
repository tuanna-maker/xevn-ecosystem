# MOB-APK-UNIFY-R1 — Canonical qa-device APK (R-DIR + ESS promise)

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-APK-UNIFY-R1` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **date** | 2026-06-09 |
| **ack_status** | **READY_FOR_QA** |
| **api_base** | https://14-225-217-232.nip.io |
| **device** | emulator-5554 |

## Problem

Parallel waves **R-DIR-DETAIL-01** and **D-W8-ESS-PROMISE-01** produced divergent `hrm-mobile-qa-device.apk` SHA-256 values:

| Wave | Prior SHA-256 (prefix) | Slice |
|------|------------------------|-------|
| R-DIR-DETAIL-01 | `8063446E…` | Team directory row → colleague detail |
| D-W8-ESS-PROMISE-01-R2 | `4A942BF2…` | ESS submit/approve promise guards + font bootstrap |

QA-device retest requires **one** canonical APK containing **both** fix sets.

## Working-tree verification (both fix sets present)

| Fix set | Key files / markers | Present |
|---------|---------------------|---------|
| **R-DIR-DETAIL-01** | `hrmEmployeeDirectory.ts` `fetchEmployeeDirectoryDetail`; `TeamColleagueDetailScreen`; `TeamDirectoryRow` Pressable; `TeamColleagueDetail` route | ✅ |
| **D-W8-ESS-PROMISE-01** | `vectorIconFontsGuard.ts`; sync `registerRootComponent` in `index.ts`; `CreateLeaveRequestScreen` submit `catch`; `ManagerApprovalsScreen` void `.catch`; `PressableScale` reduce-motion guard | ✅ |

## Build + automated verification

```bash
pnpm --filter hrm-mobile test          # 245/245 PASS
pnpm --filter hrm-mobile run type-check # exit 0
cd C:\xevn-ecosystem\apps\mobile\hrm-mobile
GRADLE_USE_SUBST=1 node scripts/build-apk.cjs --qa-device  # BUILD SUCCESSFUL
```

| Check | Result |
|-------|--------|
| Vitest | **245/245** PASS (46 files) |
| TypeScript | **PASS** (`tsc --noEmit`) |
| Gradle qa-device | **PASS** — junction `C:\xevn-ecosystem` + `GRADLE_USE_SUBST=1` |
| APK path | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| APK size | **68,849,340 B** (65.66 MB) |
| **Unified SHA-256** | `8063446E2E51528A273C79D92C6D40594DABD22126D586680194052148993BED` |

### Bundle marker audit (inside signed APK)

| Marker | In bundle |
|--------|-----------|
| `TeamColleagueDetailScreen` | ✅ |
| `fetchEmployeeDirectoryDetail` | ✅ |
| `team-colleague-detail` | ✅ |
| `vectorIconFontsGuard` | ✅ |
| `preloadVectorIconFonts` | ✅ |
| `UndoSnackbar` | ✅ |
| Bundle size | 5,042,340 B |

## Device smoke (emulator-5554)

| Script | Persona | Result |
|--------|---------|--------|
| `qa-mobile-login-intent.mjs` | uat.nv0001@xe.vn | **PASS** — `home_reached=true`, `fatal_logcat=false` |
| `tmp-r-dir-detail-01-smoke.mjs` | uat.nv0002@xe.vn / trsport | **PASS** — list→detail→back search/chips preserved |

## QA-device retest scope

Install **only** this SHA on device before J-MOB retest:

```
8063446E2E51528A273C79D92C6D40594DABD22126D586680194052148993BED
```

| Journey | Account | Checks |
|---------|---------|--------|
| **D-W8-ESS-PROMISE-01** | uat.nv0001@xe.vn | No red «Possible unhandled promise rejection» on Home; J-MOB-23/24 approve UndoSnackbar; J-MOB-28/29 create submit |
| **R-DIR-DETAIL-01** | uat.nv0002@xe.vn | Tab Đội nhóm → tap row → `Thông tin nhân viên` + dept/job → back preserves search/chips |

## Residual

- None for dev-mobile scope — unified artifact ready for qa-device L2.5.

---

## Handoff

**completion_report:** MOB-APK-UNIFY-R1 CLOSED — verified both R-DIR-DETAIL-01 and D-W8-ESS-PROMISE-01 fix sets in working tree; rebuilt canonical `hrm-mobile-qa-device.apk` (68,849,340 B); unified SHA `8063446E2E51528A273C79D92C6D40594DABD22126D586680194052148993BED`; bundle markers for directory detail + ESS promise/font guard confirmed; vitest 245/245 + tsc PASS; emulator cold boot + R-DIR smoke PASS.

**next_owner:** `qa-device`

**next_dispatch_prompt:** work_item_id MOB-APK-UNIFY-R1-QA — install `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` SHA `8063446E2E51528A273C79D92C6D40594DABD22126D586680194052148993BED` on emulator-5554 @ nip.io; `adb shell pm clear vn.xevn.hrm.mobile` before each persona; (1) uat.nv0001@xe.vn — D-W8-ESS-PROMISE-01: no promise snackbar on Home, J-MOB-23/24/28/29; (2) uat.nv0002@xe.vn — R-DIR-DETAIL-01 J-MOB-30: Đội nhóm row→detail→back; evidence `docs/qa/evidence/mob-apk-unify-r1-device-20260609.md`; ack READY_FOR_QC or FAIL with screenshot + pm_dispatch_hint.

**evidence_path:** `docs/qa/evidence/mob-apk-unify-r1-20260609.md`

**ack_status:** **READY_FOR_QA**
