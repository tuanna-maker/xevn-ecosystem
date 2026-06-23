# MOB-P0-WHITE-SCREEN-01 — Mobile blank/white screen (2026-06-16)

## Context

- Sponsor reported: installed `hrm-mobile-qa-device.apk` (SHA256 starts `8CFFD709`) → app opens to blank white screen (no UI).
- Goal: ensure app **never** stays blank on startup; show graceful fallback UI + retry on startup/render failures.

## Reproduction (local)

Environment:
- Windows 10
- Android emulator: `xevn_hrm_api33` (`emulator-5554`, Android 13)

Commands executed:

```bash
adb devices
emulator -list-avds
adb -s emulator-5554 install -r C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk
adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile
adb -s emulator-5554 logcat -c
adb -s emulator-5554 shell am start -W -n vn.xevn.hrm.mobile/.MainActivity
```

Result:
- On emulator, APK **did not reproduce** blank screen; UI rendered normally.
- Captured screenshots:
  - `docs/qa/evidence/mob-white-screen-20260616-emulator-sm.png`
  - `docs/qa/evidence/mob-white-screen-20260616-after-sm.png`

## Crash / log evidence (startup)

- No `FATAL EXCEPTION` observed during emulator launch.
- Observed normal JS boot:
  - `I ReactNativeJS: Running "main" with {"rootTag":...}`

Note:
- A warning `W xevn.hrm.mobile: Entry not found` appears on boot (WebView/trichrome), but app continues to render.

## Root cause class (most likely)

**B) JS runtime error leading to blank UI in release builds** (no red screen).

Rationale:
- Sponsor symptom is **blank white screen** (not a crash back to launcher).
- Emulator did not reproduce, suggesting **device-specific runtime edge** (timing/module init/render error) that can end up as a blank surface in release.

## Fix implemented

Implemented a **top-level `AppErrorBoundary`** that:
- Catches startup/render errors and shows a stable, branded fallback UI (not blank)
- Provides a **“Thử lại”** button that remounts providers and resets intro state

Files:
- `apps/mobile/hrm-mobile/src/components/app/AppErrorBoundary.tsx` (new)
- `apps/mobile/hrm-mobile/App.tsx` (wrap app tree in boundary + retry reset)

## Build output (new APK)

- Built: `pnpm -C apps/mobile/hrm-mobile android:apk:qa-device`
- Output: `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk`
- SHA256: `49B95D0EA2BD9879D32A799DE844676C2BC79D0F4B4E39BD91C4DCA5333EDB2D`

## Verdict

`ack_status: READY_FOR_QA`

## QA Retest suggestion

- Install the new APK above on the sponsor device.
- Verify: app opens with UI (Login/Home). If a runtime error occurs, it shows fallback + retry (not blank white).

