# PO-HRM-UI-BRAND-W4-MOB-A-FE-LOGIN-01 — session clear + FE login chrome (dev-mobile)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-MOB-A-FE-LOGIN-01` |
| **from_role** | `dev-fe` / `dev-mobile` |
| **to_role** | `qa-device` |
| **Date** | 2026-08-05 |
| **Prior QC** | `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qc-01-r3.md` — **C-LOGIN-DEEPLINK** OPEN |
| **Prior QA** | `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01-r3.md` |
| **U65** | zero-seed · **face_live=false** · **remaster_program_done=false** |
| **ack_status** | **READY_FOR_QA** |

## Honesty locks (mandatory)

| Flag | Expected | Claim |
|------|----------|--------|
| **face_live** | false | **false** — no Face LIVE |
| **remaster_program_done** | false | **false** |
| **seed** | none | **none** |
| **qa-login deep link** | assist only | **assist only** — not sole production login |

---

## Root cause (R3)

Cold start on **qa-device** APK after `install -r` **restored SecureStore session** → `RootNavigator` routed to **Main** + **CheckInFabOverlay** (`fab-primary-action-sheet`). QA script `openLogin()` only `force-stop` + `am start` → **no** `login-email` / `branded-login-card` in UI dumps (`login-0.xml`).

Production path remains **email + password** on `LoginScreen` (`POST /auth/mobile/login`). `xevn://qa-login` stays **OBS assist** for qa-device builds (`EXPO_PUBLIC_ENABLE_QA_DEEP_LINK=1`).

---

## Delivery (code)

| Change | Path | Purpose |
|--------|------|---------|
| Login root testID | `LoginScreen.tsx` | `login-screen-root` — adb detects unsigned chrome |
| Logout testID | `SettingsScreen.tsx` | `settings-logout` — in-app session clear for adb |
| QA logout deep link | `qaLoginDeepLink.ts` + `useQaLoginDeepLink.ts` | `xevn://qa-logout` → `signOut()` (qa-device bundle only) |
| R3 device script | `scripts/qa/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r3-device.mjs` | `pm clear` before login matrix; fallback `qa-logout` deeplink |
| Unit tests | `qaLoginDeepLink.test.ts` | `parseQaLogoutDeepLink` + login URL isolation |

**Preserved W4 testIDs (unchanged):** `branded-login-card`, `login-email`, `login-password`, `login-submit`, `login-xevn-logo`, `home-top-bar-brand-accent`, `dashboard-attendance-brand-bar`, `fab-primary-action-sheet`, `brand-dialog-chrome`.

---

## How QA clears session (adb / in-app)

**Package:** `vn.xevn.hrm.mobile`

### A) Fresh login chrome (recommended before MOB-01 / J-MOB-01-login)

```powershell
adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile
adb -s emulator-5554 shell am start -n vn.xevn.hrm.mobile/.MainActivity
```

Expect UI dump: `login-screen-root`, `branded-login-card`, `login-email`, `login-password`, `login-submit`.

### B) qa-device assist — logout deep link (no pm clear)

Requires **qa-device APK** rebuilt after this wave (`pnpm run android:apk:qa-device`):

```powershell
adb -s emulator-5554 shell am start -a android.intent.action.VIEW -n vn.xevn.hrm.mobile/.MainActivity -d "xevn://qa-logout"
```

Then cold start or navigate → login chrome.

### C) In-app logout (U65 FE path)

1. Signed in → tab **Hồ sơ** → **Cài đặt** (`settings-screen`)
2. Tap **Đăng xuất** (`settings-logout`)
3. Confirm login screen testIDs visible

---

## FE login matrix (qa-device R4 entry)

| Step | Action |
|------|--------|
| 1 | SoT APK `hrm-mobile-qa-device.apk` SHA256 **EB65FD6F…** (rebuild if post-FE-login-01) |
| 2 | **pm clear** (§A) or post-logout (§B/C) |
| 3 | `adb input` on `login-email` / `login-password` — persona `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| 4 | Tap `login-submit` → home with `home-top-bar-brand-accent` |
| 5 | **MOB-04** GPS submit → capture POST 2xx (R4 seat, EB65FD6F) |

Pilot API (APK bundle): `http://14.225.217.232:3001` — emulator may use `10.0.2.2:28001` only when dev URL panel exposed (`EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN=1`).

---

## Verification (dev)

| Check | Command | Result |
|-------|---------|--------|
| Deep link parse | `pnpm exec vitest run src/integrations/__tests__/qaLoginDeepLink.test.ts` | **PASS** (local 2026-08-05) |
| QA flags | `src/config/__tests__/qaLogin.test.ts` | **PASS** |

**Not run in this handoff:** full qa-device adb matrix (→ R4 `qa-device` on emulator **EB65FD6F** or new hash after rebuild).

---

## completion_report

- **Closed in dev:** Session-restore blocker documented; **pm clear** + **qa-logout** + **settings-logout** paths; login chrome testIDs; R3 script clears session before UI login loop.
- **Open for QA R4:** Rebuild/install qa-device APK with FE changes; demonstrate **FE-only** login → home; close **C-LOGIN-DEEPLINK**; **MOB-04** POST 2xx on device.
- **must_keep:** Face honesty HOLD; brand testIDs; qa-login not promoted as production login.

---

## next_dispatch_prompt

```text
PM → qa-device | PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R4
entry: READY_FOR_QA po-hrm-ui-brand-w4-mob-a-fe-login-01.md · U65 · emulator-5554
build: pnpm run android:apk:qa-device → install → log SHA256 in evidence header
session: adb shell pm clear vn.xevn.hrm.mobile BEFORE MOB-01 (or xevn://qa-logout on new APK)
exit: (1) XML login-email + branded-login-card + login-screen-root on cold start after clear;
      (2) adb UI login uat.nv0001@xe.vn → home brand testIDs WITHOUT xevn://qa-login as sole PASS;
      (3) MOB-04 GPS POST /attendance/records 2xx proof on pilot :3001;
      (4) Close QC C-LOGIN-DEEPLINK + C-MOB-04 or FAIL with artifacts
evidence: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01-r4.md
ack_status: PASS_TO_PM | FAIL_TO_PM
```

---

## Handoff

| Field | Value |
|-------|--------|
| **next_owner** | `qa-device` |
| **pm_dispatch_hint** | R4 on **EB65FD6F** or post-rebuild hash — FE login + MOB-04 POST 2xx |
| **ack_status** | **READY_FOR_QA** |
