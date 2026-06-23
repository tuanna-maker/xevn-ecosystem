# MOB-P0-WHITE-SCREEN-DEVICE-01 — Device triage (2026-06-16)

## Inputs

- APK: `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk`
- Expected SHA256: `8CFFD70940BBDB651AEEA7025E76C9227AAFFE173ECDE2BF57F7C78B1E47544B`
- Emulator device: `emulator-5554` (x86_64)

## Verification

- SHA256 (local file) **MATCH**: `8CFFD70940BBDB651AEEA7025E76C9227AAFFE173ECDE2BF57F7C78B1E47544B`
- `adb install -r` result: **Success**
- Package name installed: `vn.xevn.hrm.mobile`

## Observations (launch)

- App process starts and `MainActivity` becomes **top resumed** (no immediate crash observed on emulator).
- UI hierarchy dump shows **non-empty UI** (Home screen elements like “Trang chủ”, “Tập đoàn XeVN”, tiles “Chấm công / Nghỉ phép / Phiếu lương / Duyệt”, and error banner `HRM-AUTH-001: Không có quyền truy cập`).

## Evidence artifacts

- Screenshot (post-launch): `docs/qa/evidence/mob-white-screen-device-20260616.png`
- UI hierarchy: `docs/qa/evidence/mob-white-screen-device-20260616-uiautomator.xml`
- Logcat (filtered): `docs/qa/evidence/mob-white-screen-device-20260616-logcat2.txt`
- ReactNativeJS excerpt: `docs/qa/evidence/mob-white-screen-device-20260616-reactnativejs.txt`

## Log excerpts (high signal)

From `mob-white-screen-device-20260616-reactnativejs.txt`:

```
06-16 13:58:37.447 W/ReactNativeJS( 4450): Require cycle: src\utils\profileTabs.ts -> src\utils\profileEssFields.ts -> src\utils\profileTabs.ts
06-16 13:58:37.542 W/ReactNativeJS( 4450): Require cycle: src\utils\teamDirectory.ts -> src\utils\teamDirectoryDetail.ts -> src\utils\teamDirectory.ts
06-16 13:58:37.570 I/ReactNativeJS( 4450): Running "main" with {"rootTag":11}
```

## Root-cause category

**NOT reproduced on emulator**: app renders UI and does not crash on launch. This suggests sponsor’s “white screen” may be:

- **Device/ABI-specific crash** (common when release APK misses `arm64-v8a` native libs or has SoLoader/Hermes native loading issues on physical devices), or
- **Runtime JS error / blank root view** on specific OS/device conditions that does not reproduce on x86_64 emulator.

## Recommended next action (handoff)

Reproduce on a **physical arm64 device** and capture launch logcat scoped to the package to confirm whether this is:

- native library load failure (ABI / packaging), or
- React Native JS fatal error / redbox suppressed in release.

## Commands executed (for reproducibility)

```bash
adb devices
adb -s emulator-5554 install -r "apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk"
adb -s emulator-5554 shell pm list packages | findstr /i hrm
adb -s emulator-5554 logcat -c
adb -s emulator-5554 shell am force-stop vn.xevn.hrm.mobile
adb -s emulator-5554 shell monkey -p vn.xevn.hrm.mobile -c android.intent.category.LAUNCHER 1
adb -s emulator-5554 exec-out screencap -p > "docs/qa/evidence/mob-white-screen-device-20260616.png"
adb -s emulator-5554 shell uiautomator dump /sdcard/mob-white-screen.xml
adb -s emulator-5554 pull /sdcard/mob-white-screen.xml "docs/qa/evidence/mob-white-screen-device-20260616-uiautomator.xml"
adb -s emulator-5554 logcat -d -v time | findstr /i "ReactNativeJS" > "docs/qa/evidence/mob-white-screen-device-20260616-reactnativejs.txt"
```

## Handoff contract

- work_item_id: `MOB-P0-WHITE-SCREEN-DEVICE-01`
- from_role: `qa-device`
- to_role: `pm`
- ack_status: `PASS_TO_PM`

