# MOB-P0-WHITE-SCREEN-01-QA-RET — Emulator cold-start retest (2026-06-16)

| Field | Value |
|------|-------|
| **work_item_id** | `MOB-P0-WHITE-SCREEN-01-QA-RET` |
| **from_role** | `pm` |
| **to_role** | `qa` |
| **target** | Android emulator `emulator-5554` (x86_64) |
| **APK path** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| **expected APK SHA256** | `49B95D0EA2BD9879D32A799DE844676C2BC79D0F4B4E39BD91C4DCA5333EDB2D` |
| **APK package** | `vn.xevn.hrm.mobile` |

## 0) Preconditions check — APK exists and matches SHA256

Result:

- SHA256: `49B95D0EA2BD9879D32A799DE844676C2BC79D0F4B4E39BD91C4DCA5333EDB2D` ✅
- `adb` available ✅
- Connected device: `emulator-5554` ✅

## 1) Install + cold start

Executed:

1) `adb -s emulator-5554 install -r -g hrm-mobile-qa-device.apk` ✅ (Success)
2) `adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile` ✅
3) Cold launch via launcher intent ✅
4) Screenshot capture + logcat capture ✅

Screenshots:

- `docs/qa/evidence/mob-white-screen-20260616-splash-or-login.png` (cold start, ~25s)
- `docs/qa/evidence/mob-white-screen-20260616-60s-login-or-home.png` (cold start, ~60s)

## 2) Verification — no blank screen

PASS criteria (work_item):
- App reaches **Login/Home** and does **not** remain blank.

Observed:
- App renders the **XeVN HRM login screen** (title + email/password fields + “Đăng nhập” button).
- No evidence of a persistent white/blank screen during initial splash-to-login window.

Decision:
- **PASS** (startup did not result in a blank screen)

## 3) Optional check — try to trigger recoverable “Thử lại”

Goal:
- Confirm the app can show a recoverable fallback UI containing the text “Thử lại” when startup/render fails.

Attempts:

1) Airplane mode simulation attempt:
   - Tried to broadcast `android.intent.action.AIRPLANE_MODE`.
   - Emulator rejected the broadcast with `SecurityException: Permission Denial`.
   - Result: still reached the normal login UI; no “Thử lại” surfaced.
   - Screenshot: `docs/qa/evidence/mob-white-screen-20260616-airplane-try-lai.png`

2) Offline attempt via `svc`:
   - Disabled Wi-Fi and mobile data using `adb shell svc wifi disable` + `adb shell svc data disable`.
   - Result: still reached the normal login UI; no “Thử lại” surfaced on startup/login screen.
   - Screenshot: `docs/qa/evidence/mob-white-screen-20260616-offline-try-lai.png`

Why not feasible to fully confirm “Thử lại”:
- In these runs, the app successfully renders the login screen even when network connectivity is disabled.
- The UI containing “Thử lại” did not appear during splash/login rendering; likely requires triggering a specific recoverable error path after user action (e.g., submitting login) which is not automated in this work item.

## 4) Logcat excerpt (launch-time)

Source: `docs/qa/evidence/mob-white-screen-20260616-logcat.txt`

Notable error/warning lines seen during RN startup (while UI still renders login):

```txt
06-16 14:20:16.815  7359  7359 E unknown:ReactNative: Unable to launch logbox because react was unable to create the root view
06-16 14:20:17.671  7359  7359 E unknown:NativeViewHierarchyManager: ViewManager for tag 205 could not be found.
```

## 5) completion_report

- Confirmed APK SHA256 matches the provided value.
- Installed and cold-started APK on `emulator-5554`.
- App does **not** stay blank on startup; login UI renders in all cold-start trials.
- Optional “Thử lại” fallback could not be deterministically surfaced during splash/login without further UI actions; emulator airplane-mode broadcast was blocked by permissions and offline still rendered login.

## 6) next_owner

`pm` (PASS_TO_PM for this work item; if PM wants “Thử lại” specifically verified, request a follow-up device-flow test that includes login-submit error triggering).

## 7) next_dispatch_prompt

```text
Role: qa
work_item_id: MOB-P0-WHITE-SCREEN-01-QA-RET
to_role: pm
Ask for follow-up only if we must explicitly verify “Thử lại” after a recoverable startup failure:
- include steps that trigger the intended recoverable path (likely after login-submit) and capture UI text evidence.
```

## 8) ack_status

`PASS_TO_PM`

