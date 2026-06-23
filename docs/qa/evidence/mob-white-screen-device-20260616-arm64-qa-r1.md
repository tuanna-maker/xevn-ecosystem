# MOB-P0-WHITE-SCREEN-DEVICE-02-QA-R1 — Arm64 physical device retest (2026-06-16)

| Field | Value |
|------|-------|
| **work_item_id** | `MOB-P0-WHITE-SCREEN-DEVICE-02-QA-R1` |
| **from_role** | `pm` |
| **to_role** | `qa-device` |
| **target** | Physical **arm64** device — uninstall → install fresh APK → cold launch (detect white screen) |
| **expected APK SHA256** | `1AAF23494C52887986213896F26CAE74FE40B5EFC0A77D5D0F4AFDDB8F0CBB9B` |

## 0) Preconditions check — APK exists and matches SHA256

```powershell
Set-Location "C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem"
$apk="apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk"
Get-FileHash $apk -Algorithm SHA256 | Format-List
Get-Item $apk | Format-List Name,Length,LastWriteTime
```

Result:

- SHA256: `1AAF23494C52887986213896F26CAE74FE40B5EFC0A77D5D0F4AFDDB8F0CBB9B` ✅
- APK size: `74,557,711` bytes

## 1) adb environment + connected devices

```powershell
adb version
adb devices -l
```

Result:

- adb: `Android Debug Bridge version 1.0.41` / `Version 37.0.0-14910828`
- Connected:
  - `emulator-5554` (x86_64 emulator)
  - **No physical USB arm64 device detected** ❌

## 2) Physical-device retest steps (NOT EXECUTED — blocker)

Planned commands once a physical arm64 device is visible in `adb devices -l`:

```powershell
adb -s <serial> uninstall vn.xevn.hrm.mobile
adb -s <serial> install -r "apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk"
adb -s <serial> logcat -c

# Cold launch (package/activity may vary; keep logcat running during first launch)
adb -s <serial> shell am start -W -n vn.xevn.hrm.mobile/.MainActivity

# Screenshot + uiautomator dump
adb -s <serial> exec-out screencap -p > docs/qa/evidence/screens/mob-white-screen-device-20260616-arm64-r1.png
adb -s <serial> shell uiautomator dump /sdcard/mob-white-screen-device-20260616-arm64-r1.xml
adb -s <serial> pull /sdcard/mob-white-screen-device-20260616-arm64-r1.xml docs/qa/evidence/screens/

# Scoped logcat capture
adb -s <serial> logcat -d | Select-String -Pattern "AndroidRuntime|ReactNativeJS|SoLoader|UnsatisfiedLinkError|vn.xevn.hrm.mobile" > docs/qa/evidence/screens/mob-white-screen-device-20260616-arm64-r1.log.txt
```

## Blocker

- **Cannot execute physical arm64 retest** because **no physical device is connected/visible via adb** (only `emulator-5554` present).

## completion_report

- Confirmed APK exists and SHA256 matches the dev handoff.
- Attempted to begin device retest, but adb shows **no physical arm64 device** connected — cannot uninstall/install/cold-launch on target hardware.

## next_owner

`pm` (to arrange physical arm64 device connection or provide remote device serial access)

## next_dispatch_prompt

```text
Role: qa-device
work_item_id: MOB-P0-WHITE-SCREEN-DEVICE-02-QA-R2
from_role: pm
to_role: qa-device
entry_criteria:
- Physical arm64 device is connected via USB and appears in `adb devices -l` (not emulator).
- USB debugging authorized (device state = "device", not "unauthorized").
- APK path unchanged: apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk
- SHA256: 1AAF23494C52887986213896F26CAE74FE40B5EFC0A77D5D0F4AFDDB8F0CBB9B
tasks:
- Uninstall old app, install APK, cold-launch; collect screenshot + uiautomator + scoped logcat.
exit_criteria:
- PASS no white screen to login/home OR FAIL with fatal stack trace + device model/ABI.
evidence_path: docs/qa/evidence/mob-white-screen-device-20260616-arm64-qa-r2.md
ack_status: FAIL
```

## ack_status

**FAIL**

