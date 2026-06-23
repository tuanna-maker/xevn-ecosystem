# PCOMP-W4-PROFILE-AVATAR-MOB-JAVT-02 — J-AVT-02 native picker fix

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W4-PROFILE-AVATAR-MOB-JAVT-02` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **date** | 2026-06-09 |
| **ack_status** | **READY_FOR_QA** |
| **pm_dispatch_hint** | `qa-device` J-AVT-02 retest (bundle with ESS-LEAVE-01-R3 if same APK) |

---

## Executive verdict

**READY_FOR_QA** — Root cause fixed: on Android API 33+ (emulator API 33), `requestMediaLibraryPermissionsAsync` returned `granted: false` and blocked `launchImageLibraryAsync` even though the system Photo Picker (`PickVisualMedia`) does not require READ_MEDIA_IMAGES. Refactored picker into `hrmImagePicker.ts` with platform-aware permission gate, Hermes-safe `require()` load, try/catch + `getPendingResultAsync` recovery. Device smoke: More → Hồ sơ → tap avatar → **Android Photo Picker** (`com.google.android.providers.media.module`) visible with Photos/Recent grid.

---

## Root cause (r3-03 residual)

| Layer | Finding |
|-------|---------|
| Prior FAIL | Profile reached (`Chọn ảnh đại diện`); picker sheet absent in UI dump |
| Permission gate | `AvatarUploadField` required `perm.granted` before launch — **false** on API 33 emulator without READ_MEDIA_IMAGES grant |
| Photo Picker API | `expo-image-picker@15` uses `PickVisualMedia` on Android 13+ — launch works **without** legacy storage permission |
| Secondary | Dynamic `import()` less reliable on Hermes release; Ionicons camera badge could trigger font rejection snackbar on profile |
| APK-02 boot | `index.ts` sync `registerRootComponent` — **unchanged** this wave |

---

## Fixes delivered

| File | Change |
|------|--------|
| `src/utils/hrmImagePicker.ts` | **New** — `loadHrmImagePicker()` via `require()`; `shouldRequestMediaLibraryPermission()` skips gate on Android ≥33; `pickHrmImageFromLibrary()` with try/catch + `getPendingResultAsync` |
| `src/components/ui/AvatarUploadField.tsx` | Delegate to `pickHrmImageFromLibrary`; `testID="profile-avatar-pick"`; camera badge uses emoji (no Ionicons on pick path) |
| `src/utils/__tests__/hrmImagePicker.test.ts` | Platform permission gate unit tests |
| `scripts/tmp-pcomp-w4-javt-02-avatar-smoke.mjs` | Dev adb smoke helper |

**Not changed:** `index.ts` (APK-02 sync register fix preserved).

---

## Verification

| Check | Command / action | Result |
|-------|------------------|--------|
| Vitest | `pnpm --filter hrm-mobile test` | **191/191 PASS** |
| TypeScript | `pnpm --filter hrm-mobile type-check` | **PASS** |
| nip.io upload+PATCH | `node scripts/tmp-pcomp-w4-do-avt-file-smoke-20260607.mjs` | **PASS** (POST 201, PATCH 200, GET file 200) |
| Gradle qa-device APK | `pnpm run android:apk:qa-device` @ junction + `GRADLE_USE_SUBST=1` | **BUILD SUCCESSFUL** 1m 30s |
| APK artifact | `dist/hrm-mobile-qa-device.apk` | **71,782,374 B** (68.46 MiB) |
| SHA-256 | — | `77E6CE34D2A234F8D871A4735E6E6C0329F93F3D407F15DB5193DC7E859A0A2E` |
| Device picker smoke | `node scripts/tmp-pcomp-w4-javt-02-avatar-smoke.mjs` | **PASS** exit 0 |
| Picker UI | `docs/qa/evidence/pcomp-w4-javt-02-screens/javt-avatar-picker.xml` | `package="com.google.android.providers.media.module"` · text **Photos** · **Recent** |

---

## Device smoke detail (emulator-5554)

```
adb shell pm clear vn.xevn.hrm.mobile
adb install -r dist/hrm-mobile-qa-device.apk
node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026
More tab → Hồ sơ → tap content-desc="Chọn ảnh đại diện"
→ System photo picker bottom sheet with photo grid
```

Account: `uat.nv0001@xe.vn` / `xevn-uat-2026` @ `https://14-225-217-232.nip.io`

---

## QA retest scope (J-AVT-02 full journey)

1. Install APK above (SHA `77E6CE34…`); `pm clear` before retest.
2. Login → More → Hồ sơ → tap avatar → confirm picker opens.
3. Select photo → crop → save → verify PATCH `avatar_url` + Home greeting shows photo.
4. Optional: bundle with ESS-LEAVE-01-R3 on same APK.

---

## completion_report

- **Closed:** J-AVT-02 picker-not-opening on API 33+ — permission gate bypass for Photo Picker; robust picker module loader; device smoke PASS on fresh Gradle qa-device APK.
- **Closed:** nip.io upload + PATCH `avatar_url` API contract verified (unchanged mobile client path).
- **Closed:** Vitest 191/191 + tsc PASS; APK-02 `index.ts` boot fix untouched.
- **Open (QA):** Full J-AVT-02 journey — select image → upload → display on Home/leave hero (device E2E).

## next_owner

`qa-device`

## next_dispatch_prompt

```
work_item_id: PCOMP-W4-PROFILE-AVATAR-MOB-JAVT-02-QA
from_role: qa-device
to_role: pm
lane: execution
entry_criteria: dev-mobile READY_FOR_QA — install apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk SHA 77E6CE34D2A234F8D871A4735E6E6C0329F93F3D407F15DB5193DC7E859A0A2E on emulator-5554 @ nip.io; adb pm clear before retest
action:
1. J-AVT-02: Login uat.nv0001@xe.vn → More → Hồ sơ → tap avatar → picker visible (com.google.android.providers.media.module)
2. Select photo → save → verify avatar on profile + Home greeting
3. Update PROGRAM_JOURNEY_MAP J-AVT-02 if PASS
4. May bundle with ESS-LEAVE-01-R3 on same APK
exit_criteria: evidence docs/qa/evidence/pcomp-w4-profile-avatar-mob-javt-02-qa-20260609.md; ack_status PASS_TO_PM or FAIL with layer
evidence_path: docs/qa/evidence/pcomp-w4-profile-avatar-mob-javt-02-qa-20260609.md
pm_dispatch_hint: if PASS → qc J-AVT-02 gate; if FAIL upload layer → dev-mobile residual
```

## evidence_path

`docs/qa/evidence/pcomp-w4-profile-avatar-mob-javt-02-20260609.md`
