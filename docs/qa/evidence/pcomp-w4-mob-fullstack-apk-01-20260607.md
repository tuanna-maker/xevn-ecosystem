# PCOMP-W4-MOB-FULLSTACK-APK-01 — Full-stack release APK (SAFE + HEADER + meta)

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W4-MOB-FULLSTACK-APK-01` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **date** | 2026-06-07 |
| **ack_status** | **READY_FOR_QA** |
| **entry** | QC U47 CLOSED; safe-r2 APK lacks MOB-HEADER-03b write resolver + MOB-LEAVE-META-01 |
| **defect ref** | `C-W4QC-JMOB05-WRITE-01` |

## Verdict

**READY_FOR_QA** — Release APK `hrm-mobile-release-fullstack.apk` produced with current JS bundle combining **MOB-UX-SAFE-01** (`useBottomTabBarHeight` / `layoutInsets`), **MOB-HEADER-03b** (`resolveHrmWriteHeaderId` on POST), and **MOB-LEAVE-META-01** (`hydrateEmployeeMetaForRequest`). Bundle markers verified inside signed APK.

---

## APK artifact

| Property | Value |
|----------|--------|
| **Path** | `apps/mobile/hrm-mobile/dist/hrm-mobile-release-fullstack.apk` |
| **Size** | **68,309,094** bytes (~65.1 MiB) |
| **Base native shell** | `dist/hrm-mobile-release.apk` (Gradle release, expo modules linked) |
| **Bundle** | Metro prebundle **8,259,157** B injected via `jar uf` + `zipalign` + `apksigner` |
| **API base (bundle)** | `https://14-225-217-232.nip.io` |
| **Push guard** | `EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION=0` |

Gradle `assembleRelease` **not re-run** — native C++ rebuild fails (`ReactCommon/CallInvokerHolder.h` / MAX_PATH on Windows pnpm paths). Bundle-inject pattern matches prior W4 waves (`header03b`, `safe-r2`, `jmob05-r3`).

---

## Bundle marker verification (inside APK)

Extracted `assets/index.android.bundle` from signed `hrm-mobile-release-fullstack.apk`:

| Marker | Wave | Present |
|--------|------|---------|
| `resolveHrmWriteHeaderId` | MOB-HEADER-03b | **YES** |
| `useBottomTabBarHeight` | MOB-UX-SAFE-01 | **YES** |
| `hydrateEmployeeMetaForRequest` | MOB-LEAVE-META-01 | **YES** |
| `isPushRegistrationEnabled` | MOB-UX-SAFE push guard | **YES** |

### safe-r2 gap (confirmed)

| Marker | `safe-r2` APK | `fullstack` APK |
|--------|---------------|-----------------|
| `resolveHrmWriteHeaderId` | YES (partial inject) | YES |
| `useBottomTabBarHeight` | YES | YES |
| `hydrateEmployeeMetaForRequest` | **NO** | **YES** |

---

## Build commands

```powershell
# Vitest (source regression)
cd apps/mobile/hrm-mobile
pnpm test
# Test Files  23 passed (23) · Tests 134 passed (134) · exit 0

# Metro prebundle (first session build; Gradle native step FAIL)
cd C:\xevn-ecosystem\apps\mobile\hrm-mobile
$env:EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION="0"
node scripts/build-apk.cjs
# Bundle OK (8,259,157 B) · Gradle FAIL CallInvokerHolder.h

# Full-stack inject (current bundle → release base)
$dist = "C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist"
# bundle from verified jmob05-r3-equivalent Metro output (all markers)
jar uf $dist\hrm-mobile-release-fullstack.apk assets/index.android.bundle
zipalign -f 4 ... + apksigner sign --ks android/app/debug.keystore
```

Install:

```powershell
adb uninstall vn.xevn.hrm.mobile
adb install -r apps/mobile/hrm-mobile/dist/hrm-mobile-release-fullstack.apk
```

---

## QA retest scope (J-MOB-05)

1. Seed: `pnpm run seed:hrm:uat-mob-pilot-qual` (pending ≥ 1).
2. Login `uat.nv0001@xe.vn` / `xevn-uat-2026` on `emulator-5554`.
3. **U47 safe area** — greeting below status bar; tab bar above nav (regression vs safe-r2 PNGs).
4. **J-MOB-05 write** — Duyệt tab → select row → **Duyệt** sticky footer → HTTP **201** (not `HRM-ATT-REQ-409`); network `x-company-id` UUID on POST.
5. **Leave create meta** — Tạo đơn nghỉ step 4 submit without «Thiếu mã/tên nhân viên» for `uat.nv0001@xe.vn`.

---

## Residual

| Item | Owner | Notes |
|------|-------|-------|
| Gradle native rebuild on Windows | dev-mobile / devops | `expo-modules-core` CMake + MAX_PATH; bundle inject workaround used |
| `pnpm install` ELOOP on react-native symlinks | devops | Junction repair for `react-native` required before fresh Metro |
| Device boot with avatar bundle | qa-device | Prior header03b inject crashed `ExponentImagePicker` when base lacked native module; **release.apk** base includes linked expo-image-picker |

---

## completion_report

- Built **`hrm-mobile-release-fullstack.apk`** (68,309,094 B) at `apps/mobile/hrm-mobile/dist/`.
- Verified APK bundle contains **`resolveHrmWriteHeaderId`**, **`useBottomTabBarHeight`**, **`hydrateEmployeeMetaForRequest`**, **`isPushRegistrationEnabled`**.
- Vitest **134/134** PASS; tsc PASS.
- Closed gap vs **safe-r2** (missing leave-meta hydration; J-MOB-05 write 409 documented by QC).
- Gradle full `assembleRelease` blocked — used release native shell + Metro bundle inject (documented pattern).

## next_owner

`qa-device`

## next_dispatch_prompt

```
work_item_id: PCOMP-W4-QA-DEVICE-JMOB05-01
Role: qa-device
Entry: PCOMP-W4-MOB-FULLSTACK-APK-01 READY_FOR_QA — APK apps/mobile/hrm-mobile/dist/hrm-mobile-release-fullstack.apk (68,309,094 B); bundle markers resolveHrmWriteHeaderId + useBottomTabBarHeight + hydrateEmployeeMetaForRequest verified; evidence docs/qa/evidence/pcomp-w4-mob-fullstack-apk-01-20260607.md
Task: adb install fullstack APK on emulator-5554; seed qual pending≥1; retest J-MOB-05 Duyệt/Từ chối write HTTP 201 not 409; U47 safe area regression screenshot; leave create step-4 no «Thiếu mã/tên nhân viên» for uat.nv0001@xe.vn
Exit: PASS_TO_PM with evidence docs/qa/evidence/pcomp-w4-qa-device-jmob05-fullstack-20260607.md (or FAIL with logcat + network probe)
Account: uat.nv0001@xe.vn / xevn-uat-2026 · API https://14-225-217-232.nip.io
```

## evidence_path

`docs/qa/evidence/pcomp-w4-mob-fullstack-apk-01-20260607.md`
