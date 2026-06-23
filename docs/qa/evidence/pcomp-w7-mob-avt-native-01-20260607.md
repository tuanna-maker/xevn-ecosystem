# PCOMP-W7-MOB-AVT-NATIVE-01 — expo-image-picker native + bootable W7 APK

| Field | Value |
|-------|--------|
| **work_item_id** | `PCOMP-W7-MOB-AVT-NATIVE-01` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **date** | 2026-06-07 |
| **ack_status** | **READY_FOR_QA** (GWC — boot PASS device; native Gradle re-run if avatar tap FAIL) |

## Executive verdict

**READY_FOR_QA** — P0 boot crash `Cannot find native module 'ExponentImagePicker'` **mitigated** via lazy `import('expo-image-picker')` in `AvatarUploadField` + Metro/Gradle junction build path fixes. **Device smoke:** `hrm-mobile-release.apk` / `hrm-mobile-release-w7.apk` (67 264 113 B) installs on `emulator-5554`, `MainActivity` resumes, **no** `ExponentImagePicker` / `main was not registered` in logcat.

**GWC:** Full `assembleRelease` with **all** ABIs blocked this session by **disk ENOSPC** (~0.7 GB free) and **arm64** `expo-modules-core` CMake path on Windows. Gradle configure **did** list `expo-image-picker (15.0.7)` when build ran. QA must confirm **J-AVT-02** avatar tap; if FAIL → re-run build §3 on machine with ≥3 GB free disk.

---

## 1. Root cause (QA close)

| Issue | Cause |
|-------|--------|
| Boot crash `ExponentImagePicker` | Bundle-inject APKs shipped JS referencing `expo-image-picker` but **native shell** from pre-avatar Gradle build |
| Eager native lookup | Top-level `import * as ImagePicker from 'expo-image-picker'` forced native resolve at app init |
| Gradle FAIL | Windows MAX_PATH on `expo-modules-core` **arm64-v8a** CMake + broken `C:\rn` → `node_modules\react-native` junction loop |
| Metro FAIL | `bundleRoot` realpath to OneDrive Unicode; pnpm virtual-store peers (`expo-font`) not resolved |

---

## 2. Fixes delivered (code)

| File | Change |
|------|--------|
| `src/components/ui/AvatarUploadField.tsx` | **Lazy** `await import('expo-image-picker')` on pick only; `import type` for TS; user alert if native missing |
| `scripts/build-apk.cjs` | `bundleRoot` / `bundleRepoRoot` use **junction** `C:\xevn-ecosystem` (not realpath); copies `hrm-mobile-release-w7.apk` on success |
| `metro.config.js` | `toJunctionPath()` + pnpm virtual-store `extraNodeModules`; `@react-native/js-polyfills`, `expo-font`, etc.; `useWatchman: false` |
| `android/gradle.properties` | (existing) `android.overridePathCheck=true` |
| `app.json` | `expo-image-picker` in plugins (autolinking) |
| Env repair | Removed broken `C:\rn` junction + `pnpm install --filter hrm-mobile` restored `react-native` resolve |

---

## 3. Windows MAX_PATH build path (documented)

**Prerequisites:** Android SDK (`ANDROID_HOME`), junction, ≥3 GB free on `C:`.

```powershell
# One-time junction (ASCII path)
mklink /J C:\xevn-ecosystem "<repo-absolute-path>"

# NEVER create C:\rn → node_modules\react-native (breaks pnpm ELOOP)

$env:ANDROID_HOME = "C:\Users\ADMIN\AppData\Local\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:GRADLE_USE_SUBST = "1"
$env:EXPO_PUBLIC_HRM_API_BASE_URL = "https://14-225-217-232.nip.io"
$env:EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION = "0"
$env:NODE_ENV = "production"

cd C:\xevn-ecosystem\apps\mobile\hrm-mobile
pnpm install --filter hrm-mobile
pnpm test

# Full release (bundle + native). Emulator-only ABI reduces CMake path pressure:
node scripts/build-apk.cjs
# OR Gradle only after bundle:
# $env:GRADLE_SKIP_BUNDLE_TASK = "1"
# node scripts/gradle.cjs assembleRelease -PreactNativeArchitectures=x86_64 --no-daemon
```

**Outputs:** `dist/hrm-mobile-release.apk`, `dist/hrm-mobile-release-w7.apk` (same bytes).

**Gradle subst:** `scripts/gradle.cjs` maps repo to `Z:` (or free drive) via `subst` when `GRADLE_USE_SUBST=1`. `settings.gradle` remaps `.pnpm` paths to junction.

**If arm64 CMake fails:** use `-PreactNativeArchitectures=x86_64` for AVD `xevn_hrm_api33`; ship arm64 on CI/Linux or EAS.

---

## 4. Verification

| Check | Command / action | Result |
|-------|------------------|--------|
| Unit tests | `pnpm test` @ `hrm-mobile` | **PASS** 134/134 |
| Autolinking | `npx expo-modules-autolinking resolve --platform android` | **PASS** `ImagePickerModule` in `expo-image-picker@15.0.7` |
| APK artifact | `dist/hrm-mobile-release.apk` | **67 264 113 B** (2026-06-07) |
| W7 alias | `dist/hrm-mobile-release-w7.apk` | Copy of release APK (build script) |
| Device boot | `adb -s emulator-5554 install -r dist/hrm-mobile-release-w7.apk` | **PASS** install |
| No native crash | `adb logcat -s ReactNativeJS:*` after `am start` | **PASS** — no `ExponentImagePicker` fatal |
| Activity | `dumpsys activity activities` | **PASS** `topResumedActivity=vn.xevn.hrm.mobile/.MainActivity` |
| Gradle configure | `build-fullstack-apk.log` | lists **expo-image-picker (15.0.7)**; arm64 CMake **FAIL** (disk/path) |

---

## 5. Stack bundled (W7)

MOB-UX-SAFE-01, MOB-HEADER-03b (`resolveHrmWriteHeaderId`), MOB-LEAVE-META-01, PROFILE-AVATAR-01-MOB (lazy picker), MOB-UX-04a/b hub — JS bundle nip.io `https://14-225-217-232.nip.io`, push registration off.

---

## 6. Residual / QA R2

| ID | Severity | Action |
|----|----------|--------|
| C-W7-AVT-NATIVE-GRADLE-02 | P1 if J-AVT-02 FAIL | Re-run §3 with ≥3 GB disk; confirm `expo-image-picker` in Gradle `Using expo modules` |
| C-W7-DISK-01 | Blocker this session | Free `C:` temp / `.gradle/caches` / old `dist/*.idsig` before rebuild |

---

## completion_report

- Closed P0 **boot crash** path: lazy image-picker import + junction Metro/Gradle scripts; repaired broken `C:\rn` pnpm junction.
- Documented Windows MAX_PATH workaround (junction + subst + `overridePathCheck` + optional x86_64-only).
- Verified **emulator boot** without `ExponentImagePicker` RN red screen; vitest 134/134 PASS.
- **Partial:** full multi-ABI native rebuild not completed this session (ENOSPC + arm64 CMake); existing 67 MB release APK is QA handoff artifact.
- `hrm-mobile-release-w7.apk` = `build-apk.cjs` copy target; use `hrm-mobile-release.apk` if w7 alias missing.

## next_owner

`qa-device` — PCOMP-W7-QA-CLOSE-01-R2

## next_dispatch_prompt

```
work_item_id: PCOMP-W7-QA-CLOSE-01-R2
from_role: qa-device
to_role: pm
entry_criteria: PCOMP-W7-MOB-AVT-NATIVE-01 READY_FOR_QA — install apps/mobile/hrm-mobile/dist/hrm-mobile-release-w7.apk (or hrm-mobile-release.apk) on emulator-5554 @ nip.io; pilot pending>=1
exit_criteria: Per-journey PASS/FAIL: J-AVT-02 avatar tap, J-MOB-06/07 hub, G-PERSONA-A1 leave meta, J-MOB-05 Duyệt, MOB-UX-SAFE-01 screenshots; update docs/qa/evidence/pcomp-w7-qa-close-01-20260607.md; ack_status PASS_TO_PM
evidence_path: docs/qa/evidence/pcomp-w7-qa-close-01-20260607.md
If J-AVT-02 FAIL on picker: pm_dispatch_hint PCOMP-W7-MOB-AVT-NATIVE-02 — re-run Gradle §3 with x86_64 + disk cleanup
```

## evidence_path

`docs/qa/evidence/pcomp-w7-mob-avt-native-01-20260607.md`
