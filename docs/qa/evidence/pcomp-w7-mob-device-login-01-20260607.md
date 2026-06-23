# PCOMP-W7-MOB-DEVICE-LOGIN-01 — hub04b login root-cause + QA deep-link path

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-MOB-DEVICE-LOGIN-01` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **date** | 2026-06-07 |
| **ack_status** | **READY_FOR_QA** |
| **device** | `emulator-5554` |
| **APK** | `apps/mobile/hrm-mobile/dist/hrm-mobile-release-hub04b.apk` (66,851,388 B) |
| **API base** | `https://14-225-217-232.nip.io` |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |

## Verdict

**READY_FOR_QA** — Root-cause for R3-02 «Dev sign-in → launcher» is **qa-device automation**, not auth crash. **Login → Home PASS** on emulator via **`xevn://qa-login` deep link** (bypasses API33 adb TextInput gap).

---

## 1. Logcat / root-cause (C-W7-DEVICE-DEVJWT-02)

| Finding | Detail |
|---------|--------|
| **Not a sign-in crash** | R3-02 `r3-02-logcat.txt` has **no** `FATAL EXCEPTION` in `vn.xevn.hrm.mobile` after Dev sign-in |
| **Launcher = BACK key** | `scripts/tmp-pcomp-w7-qa-hub-r3-02-device.mjs` sends `adb shell input keyevent 4` after filling Bearer token — **Android BACK** exits app → `com.google.android.apps.nexuslauncher` (`manual-post-login.xml`) |
| **Email path blocked** | API33 RN `TextInput` ignores `adb input text` + clipboard paste (`C-W7-DEVICE-LOGIN-01`) — validation alert «Nhập email và mật khẩu.» with placeholder unchanged |
| **Partial dev fill** | Clipboard paste into dev JWT fields also unreliable; empty/partial token → dev validation or BACK before submit |

**Conclusion:** Fix = **device login tooling** (deep link / ADBKeyboard), not session/navigation code change for production users.

---

## 2. Mobile fix — QA deep-link login (no TextInput)

| Change | Path |
|--------|------|
| `EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN=1` + `EXPO_PUBLIC_ENABLE_QA_DEEP_LINK=1` in release bundle | `scripts/build-apk.cjs` |
| `xevn://qa-login?access_token=…&tenant_id=…&company_id=…` → `signIn()` | `src/integrations/qaLoginDeepLink.ts`, `src/hooks/useQaLoginDeepLink.ts`, `App.tsx` |
| Dev JWT backfill from token claims | `LoginScreen.tsx` `enrichDevPayloadFromJwt` |
| Login `testID`s for Appium | `login-email`, `login-password`, `login-submit`, `login-dev-submit` |
| Device script | `scripts/qa-mobile-login-intent.mjs` |

**Deep-link example (after API login):**

```text
adb shell am start -a android.intent.action.VIEW \
  -n vn.xevn.hrm.mobile/.MainActivity \
  -d "xevn://qa-login?access_token=…&tenant_id=xevn&company_id=holding&company_uuid=…&employee_id=…&base_url=https://14-225-217-232.nip.io"
```

Or:

```bash
node scripts/qa-mobile-login-intent.mjs
```

---

## 3. ADBKeyboard / manual fallback (C-W7-DEVICE-LOGIN-01)

When deep link is unavailable (older APK):

1. Install [ADBKeyboard](https://github.com/senzhk/ADBKeyBoard) APK on emulator
2. `adb shell ime enable com.android.adbkeyboard/.AdbIME`
3. `adb shell ime set com.android.adbkeyboard/.AdbIME`
4. `adb shell am broadcast -a ADB_INPUT_TEXT --es msg 'uat.nv0001@xe.vn'`
5. Tab to password field; repeat with `xevn-uat-2026`
6. Tap **Đăng nhập** manually or via uiautomator bounds

**Do not** send `keyevent 4` (BACK) between fill and submit — exits to launcher (R3-02 false crash).

---

## 4. Device verification (exit #3)

| Step | Result |
|------|--------|
| `pnpm test` (hrm-mobile) | **138/138 PASS** |
| Gradle `assembleRelease` + hub04b copy | **BUILD SUCCESSFUL** — 66,851,388 B |
| `adb install -r …/hrm-mobile-release-hub04b.apk` | exit 0 |
| `node scripts/qa-mobile-login-intent.mjs` | **exit 0** — `home_reached: true`, `fatal_logcat: false` |
| UI dump after login | `Trang chủ`, `Xin chào`, `Việc cần làm` present; no login form |

```json
{
  "work_item_id": "PCOMP-W7-MOB-DEVICE-LOGIN-01",
  "login_method": "xevn_qa_login_deep_link",
  "email": "uat.nv0001@xe.vn",
  "home_reached": true,
  "fatal_logcat": false,
  "pass": true
}
```

---

## 5. Residual

| ID | Owner | Note |
|----|-------|------|
| **C-W7QC-DEVICE-01** | `qa-device` | Hub J-MOB-06..09 walk — use deep-link login + R3-03 script |
| Metro `__DEV__=true` in bundle header | `dev-mobile` | export:embed still emits dev flag; QA gates use `EXPO_PUBLIC_*` — track separately |

---

## completion_report

- Closed **C-W7-DEVICE-DEVJWT-02**: launcher exit = QA `keyevent 4` BACK, not app crash.
- Shipped **QA deep-link login** + hub04b APK rebuild (66.85 MB) with QA flags; emulator login → Home **PASS** for `uat.nv0001@xe.vn`.
- Documented **ADBKeyboard** path for manual email login on API33.
- Vitest **138/138** PASS.

## next_owner

`qa-device`

## next_dispatch_prompt

```
work_item_id: PCOMP-W7-QA-HUB-R3-03
from_role: pm
to_role: qa-device
entry_criteria: PCOMP-W7-MOB-DEVICE-LOGIN-01 READY_FOR_QA — hub04b 66,851,388 B @ apps/mobile/hrm-mobile/dist/hrm-mobile-release-hub04b.apk; login via node scripts/qa-mobile-login-intent.mjs (xevn://qa-login); do NOT use keyevent 4 between dev JWT fill and submit
exit_criteria: pm clear + install hub04b; deep-link login PASS; J-MOB-06/07/08/09 + J-AVT-02 + MOB-UX-SAFE-01 device L2.5 walk @ nip.io; evidence pcomp-w7-qa-hub-r3-03-20260607.md; ack_status PASS_TO_PM or FAIL with layer
evidence_path: docs/qa/evidence/pcomp-w7-qa-hub-r3-03-20260607.md
pm_dispatch_hint: if deep-link fails on cold boot wait 25s then retry intent; ADBKeyboard fallback per pcomp-w7-mob-device-login-01-20260607.md §3
```

## evidence_path

`docs/qa/evidence/pcomp-w7-mob-device-login-01-20260607.md`

## ack_status

**READY_FOR_QA**

## pm_dispatch_hint

`qa-device` **PCOMP-W7-QA-HUB-R3-03** hub UI walk **J-MOB-06/07/08/09** using `scripts/qa-mobile-login-intent.mjs` entry.
