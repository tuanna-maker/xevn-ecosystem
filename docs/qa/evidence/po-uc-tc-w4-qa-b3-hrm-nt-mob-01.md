# Evidence — PO-UC-TC-W4-QA-B3-HRM-NT-MOB-01 (HRM-NT-02 device)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-B3-HRM-NT-MOB-01` |
| **uc_id** | `HRM-NT-02` |
| **from_role** | qa-device |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-04 |
| **u65_zero_seed** | true |
| **hdsd_align** | partial — HDSD path = Cài đặt → Thông báo (in-app inbox); **push POST** fires on sign-in (`AuthContext` / `tryRegisterExpoPushToken`), not a separate «Đăng ký push» button on Notifications screen |
| **persona** | `uat.nv0007@xe.vn` / `xevn-uat-2026` · scope `trsport` · `employee_id` UUID present |
| **device** | `emulator-5554` · AVD `xevn_api34` |
| **APK** | `C:\xevn-apk\hrm-mobile-qa-device.apk` (71,601,145 B) · `adb install -r` exit **0** |
| **residual** | `R-W4-B3-NT02-MOBILE-PUSH-QA` → **FAIL closed** (see verdict) |

> **Cấm honored:** no seed · no Leave L2 · no Phase1/UAT DONE · IM-03 AU untouched.

---

## Verdict

| TC | Result | Notes |
|----|--------|-------|
| **TC-HRM-NT-02-ACT-HP-001** (POST push-tokens 2xx from mobile FE) | **FAIL** | Logcat **0** `POST …/push-tokens`; **0** `HRM-NOTIF-201`. Push registration **not invoked** on pilot/qa-device bundle (`EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION=0` default per `build-apk.cjs` / prior GWC). |
| **TC-HRM-NT-02-OPEN-HP-001** (Settings → Notifications UI) | **PARTIAL** | QA deep-link login **PASS** (home visible). **Cài đặt** screen **PASS**. Automation did not tap **Thông báo** quick-nav row (off-screen / scroll — manual HDSD row exists in `SettingsScreen` `vi.notifications`). In-app **Notifications** = inbox list, not push register CTA. |
| **BE contract** (supplementary — not UAT substitute) | **PASS** | Host probe `POST /api/hrm/notifications/push-tokens` with `platform: expo` → **201** `HRM-NOTIF-201` on `:28001` and VPS `:3001`. Same call with `platform: android` (mobile sends today) → **400** `HRM-VAL-001`. |

**Seat verdict:** **FAIL** — P0 mutate HP not demonstrated on device; **uat_done** remains **false**.

---

## L0 / environment

| Check | Result |
|-------|--------|
| `adb devices` | `emulator-5554` **device** |
| HRM API host login `127.0.0.1:28001` | **201** `HRM-AUTH-200` |
| App runtime API (logcat) | Bundled **`http://14.225.217.232:3001`** (qa deep-link `base_url=10.0.2.2:28001` not observed in `[HRM-MOB]` traces — app used release pilot default) |
| `x-company-id` | **`trsport`** on sample GETs · **no** `main` |

---

## Device steps (U65)

| # | Action | Exit | Observation |
|---|--------|------|-------------|
| 1 | `adb shell pm clear vn.xevn.hrm.mobile` | 0 | Fresh session |
| 2 | `adb logcat -c` | 0 | Clean log |
| 3 | Host login + `xevn://qa-login?…` deep link (`uat.nv0007`) | 0 | Home / dashboard strings present |
| 4 | Tab **Hồ sơ** → **Cài đặt** | 0 | Settings scope card visible |
| 5 | Navigate **Thông báo** (automation) | — | Row not tapped (scroll gap) |
| 6 | Logcat audit 1000 lines | — | **No** `push-tokens` URL |

**Automation:** `scripts/tmp-po-uc-tc-w4-qa-b3-hrm-nt-mob-01-device.mjs` · machine JSON `docs/qa/evidence/_tmp-po-uc-tc-w4-qa-b3-hrm-nt-mob-01-device.json` · exit **2** (FAIL_NO_POST_2XX).

**Screenshot:** `docs/qa/evidence/screens/po-uc-tc-w4-qa-b3-hrm-nt-mob-01/nt02-notifications-screen.png`

---

## Root cause (evidence-backed)

| Layer | Finding |
|-------|---------|
| **Mobile product policy** | Release / qa-device APK builds default **`EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION=0`** — `registerHrmPushToken` returns early; no permission/token/POST chain (see `p1-phase1-fe-mob-push-token-20260604.md`, QC GWC **C-MOBJOB-02**). |
| **Mobile ↔ API contract** | `pushRegistration.ts` sends `platform: android|ios`; DTO requires `expo|fcm` (`register-push-token.dto.ts`) → would **400** even if push enabled without fix. |
| **HDSD vs impl** | NT-02 «register push» is **post-login side effect**, not Notifications screen mutate; inbox screen is NT-01-adjacent read path. |

---

## Residual → PM

| ID | Sev | Owner | Action |
|----|-----|-------|--------|
| **R-W4-B3-NT02-MOB-PUSH-ENABLE** | P0 | **dev-mobile** | Ship qa-device (or NT-02) APK with `EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION=1` + EAS projectId / FCM wiring; path + SHA on bus. |
| **R-W4-B3-NT02-MOB-PLATFORM-DTO** | P0 | **dev-be** + **dev-mobile** | Align POST body: mobile send `platform: expo` (or BE accept `android`→expo map). Regression vitest + device POST 201. |
| **R-W4-B3-NT02-MOB-RETEST** | P1 | **qa-device** | After APK + contract fix: login → grant notification permission → assert logcat `POST …/push-tokens` **2xx** + `HRM-NOTIF-201`; optional Settings → Thông báo scroll retest. |

---

## Handoff

```
ack_status: PASS_TO_PM
work_item_id: PO-UC-TC-W4-QA-B3-HRM-NT-MOB-01
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-mob-01.md
uat_done: false
tc_p0_act_hp: FAIL
next_owner: pm
```

### completion_report

Emulator + qa-device APK available; UAT NV login and Settings partial path exercised under U65. **No** device `POST push-tokens` 2xx — push registration disabled on bundle + platform DTO mismatch if enabled. BE **201** proven only via controlled API probe (`platform: expo`). by-uc HRM-NT-02 stamped **FAIL** (device seat); full UC DoD not met.

### next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-DEV-MOB-NT02-PUSH-ENABLE-01
from_role: pm
to_role: dev-mobile
lane: execution
priority: P0
read_first: apps/mobile/hrm-mobile/src/integrations/pushRegistration.ts · apps/mobile/hrm-mobile/scripts/build-apk.cjs · docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-mob-01.md
entry_criteria: HRM-NT-02 device FAIL — push off + platform android vs DTO expo/fcm
exit_criteria: qa-device APK with EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION=1; POST body platform=expo; install path documented; vitest pushRegistration; ack_status READY_FOR_QA → qa-device PO-UC-TC-W4-QA-B3-HRM-NT-MOB-01-R1
Parallel dev-be: map platform or document API_DESIGN — POST push-tokens accepts mobile wire format.
evidence_path: docs/qa/evidence/po-uc-tc-w4-dev-mob-nt02-push-enable-01.md
```
