# PCOMP-W7-MOB-PROFILE-FULL-01-BUILD — local qa-device APK (Profile Plane B FIX)

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-MOB-PROFILE-FULL-01-BUILD` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **date** | 2026-07-28 |
| **ack_status** | **READY_FOR_QA** |
| **U65** | zero-seed — no `pnpm seed:*` |
| **HOLD_DEPLOY** | yes — local Hermes/APK only; no store / VPS / :8088 |
| **NOT** | Phase1 DONE / PROD-READY |
| **source wave** | `docs/qa/evidence/pcomp-w7-mob-profile-full-01-20260728.md` |
| **journeys** | **J-MOB-12** · regression **J-MOB-17** · home → Profile |

---

## Why rebuild

Prior qa-device SHA `5908260E5AF95E4CDD5904EB8CFE2D7AB9D49239D7DBA06049BDCC63341A8D7D` (directory BUILD) was built **before** Profile Plane B FIX on `fetchEmployeeById` + ProfileScreen catalog (`resolveDirectoryQueryCompanyId`). Device gate for W7-6 requires a binary that includes that FIX.

---

## APK publish (canonical)

| Field | Value |
|-------|-------|
| **Absolute path (junction)** | `C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk` |
| **Absolute path (ASCII twin)** | `C:\xevn-apk\hrm-mobile-qa-device.apk` (same SHA) |
| **Gradle output** | `C:\xevn-ecosystem\apps\mobile\hrm-mobile\android\app\build\outputs\apk\release\app-release.apk` |
| **Repo-relative** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| **Bytes** | `71594850` (68.28 MiB) |
| **SHA-256** | `5A5F627D53C5A4386BBA1A2499F82122F0AA5AF9BDF79214760EFDAD37A89184` |
| **mtime** | 2026-07-28 11:14:15 (+07) |
| **BUILD_TARGET** | `qa-device` (`EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN=1`, `EXPO_PUBLIC_ENABLE_QA_DEEP_LINK=1`) |
| **ABI** | multi (`arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64`) |
| **Supersedes** | `5908260E5AF95E4CDD5904EB8CFE2D7AB9D49239D7DBA06049BDCC63341A8D7D` |

### Binary newer than prior

| Check | Result |
|-------|--------|
| SHA ≠ `5908260E…` | **PASS** (`5A5F627D…9184`) |
| mtime 2026-07-28 ~11:14 | **PASS** |
| Bytes ≠ prior `71594412` | **PASS** (`71594850`) |
| Bundle `resolveDirectoryQueryCompanyId` | **True** |
| Bundle `fetchEmployeeById` | **True** |
| Bundle `DynamicProfileForm` | **True** |
| Bundle `settings-catalogs` | **True** |
| Bundle `phone_number` | **True** |
| Hermes bundle size | `5,242,004` B (mtime 11:13:10) |

---

## Build notes

| Item | Status |
|------|--------|
| Junction `C:\xevn-ecosystem` | Present → OneDrive repo |
| Junction `C:\rn74` | Present → react-native 0.74.5 |
| `GRADLE_PATH_RN_DIR` | `C:\rn74` (expo-modules-core cmake MAX_PATH mitigation) |
| Command | `pnpm run android:apk:qa-device` @ `C:\xevn-ecosystem\apps\mobile\hrm-mobile` |
| Result | **BUILD SUCCESSFUL in 1m 9s** · exit 0 · 57 executed / 1030 up-to-date |
| Emulator | Not killed (per entry); install may use physical or existing `xevn_api34` |

---

## Install (qa-device)

```powershell
Get-FileHash -Algorithm SHA256 "C:\xevn-apk\hrm-mobile-qa-device.apk"
# MUST equal 5A5F627D53C5A4386BBA1A2499F82122F0AA5AF9BDF79214760EFDAD37A89184
# MUST ≠ 5908260E5AF95E4CDD5904EB8CFE2D7AB9D49239D7DBA06049BDCC63341A8D7D

adb devices
adb install -r -g "C:\xevn-apk\hrm-mobile-qa-device.apk"
adb shell pm clear vn.xevn.hrm.mobile

# Emulator if already up:
adb -s emulator-5554 install -r -g "C:\xevn-apk\hrm-mobile-qa-device.apk"
adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile
```

Login: `uat.nv0001@xe.vn` / `xevn-uat-2026` @ pilot API (U65 zero-seed).

---

## QA matrix pointer (U65)

See source evidence `pcomp-w7-mob-profile-full-01-20260728.md` § QA device matrix:

1. Home → **Hồ sơ** → **Thông tin** → `dynamic-profile-form` + SĐT / Giới tính / Mã NV  
2. Network GET employee: `company_id=` **slug** (not LE UUID)  
3. Mã NV not editable (AC-ESS-02)  
4. Edit SĐT → Lưu → PATCH **202** `HRM-EMP-202` → reload sticks  
5. Tabs Công việc / Tài liệu (J-MOB-17)  
6. Avatar path still works  
7. Directory colleague ≠ self ESS  

**cấm:** seed `custom_fields`; Phase1/PROD claim.

---

## Handoff

```yaml
work_item_id: PCOMP-W7-MOB-PROFILE-FULL-01-BUILD
from_role: dev-mobile
to_role: qa-device
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/pcomp-w7-mob-profile-full-01-build-20260728.md
apk_path: C:\xevn-apk\hrm-mobile-qa-device.apk
sha256: 5A5F627D53C5A4386BBA1A2499F82122F0AA5AF9BDF79214760EFDAD37A89184
completion_report: |
  Built local qa-device APK with 2026-07-28 Profile Plane B FIX
  (resolveDirectoryQueryCompanyId on fetchEmployeeById + catalog).
  SHA 5A5F627D… supersedes directory-era 5908260E….
  Bundle markers: resolveDirectoryQueryCompanyId, fetchEmployeeById,
  DynamicProfileForm, settings-catalogs, phone_number.
  HOLD_DEPLOY · U65 · NOT Phase1/PROD.
residual: |
  Device L2.5 J-MOB-12 required before TODO [x].
  Emulator system-images residual from directory build may still apply
  if AVD missing — physical device OK.
next_owner: qa-device
next_dispatch_prompt: |
  PCOMP-W7-MOB-PROFILE-FULL-01-QA — qa-device. Install
  C:\xevn-apk\hrm-mobile-qa-device.apk
  SHA-256 5A5F627D53C5A4386BBA1A2499F82122F0AA5AF9BDF79214760EFDAD37A89184
  (must ≠ 5908260E…). U65 zero-seed; HOLD_DEPLOY; NOT Phase1/PROD.
  Journeys J-MOB-12 + J-MOB-17: login uat.nv0001@xe.vn → Home → Hồ sơ →
  Thông tin → dynamic-profile-form; Network GET /employees/:id company_id=
  slug/main not LE UUID; Mã NV RO; edit SĐT → Lưu → PATCH 202 HRM-EMP-202;
  tabs Công việc/Tài liệu OK. Evidence
  docs/qa/evidence/pcomp-w7-mob-profile-full-01-qa-20260728.md;
  ack PASS_TO_PM or FAIL with screenshot + pm_dispatch_hint.
```
