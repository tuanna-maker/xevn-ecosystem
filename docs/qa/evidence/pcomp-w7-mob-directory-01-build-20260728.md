# PCOMP-W7-MOB-DIRECTORY-01-BUILD — local qa-device APK (Plane B FIX)

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-MOB-DIRECTORY-01-BUILD` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **date** | 2026-07-28 |
| **ack_status** | **READY_FOR_QA** |
| **U65** | zero-seed — no `pnpm seed:*` |
| **HOLD_DEPLOY** | yes — local Hermes/APK only; no store / VPS / :8088 |
| **NOT** | Phase1 DONE / PROD-READY |
| **source wave** | `docs/qa/evidence/pcomp-w7-mob-directory-01-20260728.md` |
| **journeys** | **J-MOB-16** · **J-MOB-30** |

---

## Why rebuild

Prior device SHA `D1E095F32F737617D2FD0A347B91E6BDADCDD708A4DAB2A378F5933A9AAFE201` (2026-07-19 search wave) **does not** include 2026-07-28 Plane B FIX (`resolveDirectoryQueryCompanyId`).

---

## APK publish (canonical)

| Field | Value |
|-------|-------|
| **Absolute path (junction)** | `C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk` |
| **Absolute path (ASCII twin)** | `C:\xevn-apk\hrm-mobile-qa-device.apk` (same SHA) |
| **Gradle output** | `C:\xevn-ecosystem\apps\mobile\hrm-mobile\android\app\build\outputs\apk\release\app-release.apk` |
| **Repo-relative** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| **Bytes** | `71594412` (68.28 MiB) |
| **SHA-256** | `5908260E5AF95E4CDD5904EB8CFE2D7AB9D49239D7DBA06049BDCC63341A8D7D` |
| **mtime** | 2026-07-28 10:47:00 (+07) |
| **BUILD_TARGET** | `qa-device` (`EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN=1`, `EXPO_PUBLIC_ENABLE_QA_DEEP_LINK=1`) |
| **ABI** | multi (`arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64`) |
| **Supersedes** | `D1E095F32F737617D2FD0A347B91E6BDADCDD708A4DAB2A378F5933A9AAFE201` |

### Binary newer than prior

| Check | Result |
|-------|--------|
| SHA ≠ `D1E095F3…` | **PASS** (`5908260E…8D7D`) |
| mtime 2026-07-28 | **PASS** |
| Bundle marker `resolveDirectoryQueryCompanyId` | **True** (Hermes `index.android.bundle` 5,241,796 B) |

---

## Build notes (SDK + MAX_PATH)

| Item | Status |
|------|--------|
| `platforms;android-34` | Reinstalled via `sdkmanager` (disk clean had wiped `platforms/`) |
| `build-tools` / NDK 26.1 / cmake | Present |
| `system-images` | **Still missing** after disk clean — emulator AVD recreate blocked until reinstall (see residual) |
| First assemble FAIL | CMake/ninja `Filename longer than 260` — `REACT_NATIVE_DIR` resolved to OneDrive Unicode realpath |
| Fix | Junction `C:\rn74` → RN package; `scripts/gradle.cjs` patches `expo-modules-core` to prefer `GRADLE_PATH_RN_DIR` |
| Command | `pnpm run android:apk:qa-device` @ `C:\xevn-ecosystem\apps\mobile\hrm-mobile` |
| Result | **BUILD SUCCESSFUL in 11m 5s** · exit 0 |

### Reinstall (if emulator needed — BLOCKED until then)

```powershell
$sdk = "$env:LOCALAPPDATA\Android\Sdk"
$sdkmanager = "$sdk\cmdline-tools\latest\bin\sdkmanager.bat"
1..80 | ForEach-Object { "y" } | & $sdkmanager --licenses
& $sdkmanager --install "system-images;android-34;google_apis;x86_64"
# then recreate AVD / start emulator-5554
```

Physical device install does **not** require system-images.

---

## Install (qa-device)

```powershell
Get-FileHash -Algorithm SHA256 "C:\xevn-apk\hrm-mobile-qa-device.apk"
# MUST equal 5908260E5AF95E4CDD5904EB8CFE2D7AB9D49239D7DBA06049BDCC63341A8D7D

# Physical device (preferred while system-images missing):
adb devices
adb install -r -g "C:\xevn-apk\hrm-mobile-qa-device.apk"
adb shell pm clear vn.xevn.hrm.mobile

# Emulator (only after system-images reinstall):
adb -s emulator-5554 uninstall vn.xevn.hrm.mobile
adb -s emulator-5554 install -r -g "C:\xevn-apk\hrm-mobile-qa-device.apk"
adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile
```

Login: `uat.nv0001@xe.vn` / `xevn-uat-2026` @ pilot API (U65 zero-seed).  
Assert Network: directory `company_id` = Plane B slug / `main` — **not** LE UUID.

---

## Handoff

```yaml
work_item_id: PCOMP-W7-MOB-DIRECTORY-01-BUILD
from_role: dev-mobile
to_role: qa-device
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/pcomp-w7-mob-directory-01-build-20260728.md
apk_path: C:\xevn-apk\hrm-mobile-qa-device.apk
sha256: 5908260E5AF95E4CDD5904EB8CFE2D7AB9D49239D7DBA06049BDCC63341A8D7D
completion_report: |
  Built local qa-device APK with 2026-07-28 Plane B directory FIX.
  SHA 5908260E… supersedes D1E095F3…. Bundle has resolveDirectoryQueryCompanyId.
  HOLD_DEPLOY · U65 · NOT Phase1/PROD.
residual: |
  Android SDK system-images still wiped — emulator AVD blocked until sdkmanager
  system-images;android-34;google_apis;x86_64. Use physical device or reinstall images.
next_owner: qa-device
next_dispatch_prompt: |
  PCOMP-W7-MOB-DIRECTORY-01-QA — qa-device. Install C:\xevn-apk\hrm-mobile-qa-device.apk
  SHA-256 5908260E5AF95E4CDD5904EB8CFE2D7AB9D49239D7DBA06049BDCC63341A8D7D (must ≠ D1E095F3…).
  U65 zero-seed; HOLD_DEPLOY; NOT Phase1/PROD.
  Journeys J-MOB-16 + J-MOB-30: login uat.nv0001@xe.vn → Đội nhóm → search ≥2 chars →
  empty R2 copy → row→detail→back. DevTools/Network: GET /api/hrm/employees?view=directory
  company_id = slug/main (not LE UUID). Evidence docs/qa/evidence/pcomp-w7-mob-directory-01-qa-20260728.md;
  ack PASS_TO_PM or FAIL with screenshot + pm_dispatch_hint.
```
