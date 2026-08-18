# Evidence — PO-UC-TC-W4-QA-B3-HRM-NT-MOB-R1 (HRM-NT-02 device retest)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-B3-HRM-NT-MOB-R1` |
| **uc_id** | `HRM-NT-02` |
| **from_role** | qa-device |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-04 |
| **u65_zero_seed** | true |
| **prior_fail** | `docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-mob-01.md` |
| **dev_handoff** | `docs/qa/evidence/po-uc-tc-w4-dev-mob-nt02-push-enable-01.md` |
| **persona** | `uat.nv0007@xe.vn` / `xevn-uat-2026` · scope `trsport` · `employee_id` `b06422c0…` |
| **device** | `emulator-5554` · API 34 x86_64 |
| **APK** | `C:\xevn-apk\hrm-mobile-qa-device.apk` · 71,602,685 B · SHA256 `50C8F7D5912F75A38A2E2107CF2E29286FBFA5D45635A6D8284DEC70BCA2389F` (matches dev-mobile build) |

> **U65:** no seed · no API probe as UAT substitute for device POST · **uat_done** false.

---

## Verdict

| AC / TC | Result | Layer |
|---------|--------|-------|
| **TC-HRM-NT-02-ACT-HP-001** — login → push POST **2xx** + `HRM-NOTIF-201` | **FAIL** | **FCM / native init** |
| QA deep-link login (`uat.nv0007`) | **PASS** | — |
| Notification permission | **PASS** (pre-grant `POST_NOTIFICATIONS`; no deny dialog) | permission |
| APK freshness (SHA vs dev READY) | **PASS** | — |
| `x-company-id` on API traffic | **PASS** (`trsport`; not `main`) | scope |

**Seat verdict:** **FAIL** — push registration chain runs but **no Expo push token** → **no** `POST …/notifications/push-tokens` in logcat. **Not** stale APK / **not** push flag off (prior wave). **uat_done** remains **false**.

---

## L0 / environment

| Check | Command / note | Result |
|-------|----------------|--------|
| `adb devices` | `adb devices -l` | `emulator-5554` **device** · exit **0** |
| APK install | `adb -s emulator-5554 install -r C:\xevn-apk\hrm-mobile-qa-device.apk` | **Success** · exit **0** |
| HRM API (host) | `GET http://127.0.0.1:28001/api/hrm/` | **200** |
| Mobile login (host) | `POST …/auth/mobile/login` uat.nv0007 | **201** |
| App runtime API (logcat) | `[HRM-MOB]` traces | **`http://14.225.217.232:3001`** (pilot default; deep-link `base_url=10.0.2.2:28001` not applied to logged requests) |

---

## Device steps (U65)

| # | Action | Exit | Observation |
|---|--------|------|-------------|
| 1 | `adb shell pm grant … POST_NOTIFICATIONS` | 0 | Permission granted before session |
| 2 | `adb shell pm clear vn.xevn.hrm.mobile` | 0 | Fresh install state |
| 3 | `adb logcat -c` | 0 | Clean buffer |
| 4 | Host login + `xevn://qa-login?…` deep link | 0 | Home strings present (`qa-login-deeplink` **home: true**) |
| 5 | Wait ~5.5s + UI automation (profile/settings) | — | Settings row not found this run (non-blocking for NT-02 POST AC) |
| 6 | Logcat audit (1000 lines) | — | **0** `push-tokens` · **0** `HRM-NOTIF-201` |

**Automation:** `scripts/tmp-po-uc-tc-w4-qa-b3-hrm-nt-mob-01-device.mjs` · machine JSON `docs/qa/evidence/_tmp-po-uc-tc-w4-qa-b3-hrm-nt-mob-01-device.json` · script exit **2** (`FAIL_NO_POST_2XX`).

**Screenshot:** `docs/qa/evidence/screens/po-uc-tc-w4-qa-b3-hrm-nt-mob-01/nt02-notifications-screen.png` (updated pull from final screencap)

---

## Logcat proof (FCM layer)

```
08-04 12:35:33.956  … W FirebaseApp: Default FirebaseApp failed to initialize because no default options were found. This usually means that com.google.gms:google-services was not applied to your gradle project.
08-04 12:35:33.956  … I FirebaseInitProvider: FirebaseApp initialization unsuccessful
```

| Signal | Present |
|--------|---------|
| `[HRM-MOB] POST …/notifications/push-tokens` | **No** |
| `HRM-NOTIF-201` | **No** |
| `FirebaseApp failed` / `google-services` | **Yes** |
| `[HRM-MOB] GET …/notifications/inbox` | **Yes** (inbox only) |

**Interpretation:** Dev-mobile **PUSH_REG=1** + `platform: expo` fix removes prior **flag-off** and **DTO android** blockers. On **API 34 emulator**, `Notifications.getExpoPushTokenAsync` still requires FCM (`google-services.json` / Gradle plugin) — `safeGetExpoPushToken` returns **null** silently → chain stops before POST.

---

## Delta vs MOB-01 (prior FAIL)

| Finding | MOB-01 | R1 (this run) |
|---------|--------|----------------|
| `EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION` | **0** (default release bundle) | **1** on qa-device APK (SHA matches NT02 build) |
| POST body `platform` | `android` → would **400** | Code path not reached (no token) |
| Logcat `push-tokens` | Absent | **Still absent** |
| Root cause class | Product flag + DTO | **FCM native init** on emulator APK |

---

## Residual → PM

| ID | Sev | Owner | Action |
|----|-----|-------|--------|
| **R-W4-B3-NT02-FCM-QA-DEVICE** | P0 | **dev-mobile** (+ **devops** if secrets) | Ship qa-device APK with `google-services.json` + Gradle `google-services` plugin **or** documented emulator FCM setup; optional dev-only QA hook to POST synthetic expo token when `BUILD_TARGET=qa-device` (sponsor-approved, no prod). |
| **R-W4-B3-NT02-BASE-URL-DEEPLINK** | P2 | **dev-mobile** | Deep-link `base_url=10.0.2.2:28001` not observed in `[HRM-MOB]` (app uses pilot `:3001`); align for local HRM seat if required. |
| **R-W4-B3-NT02-MOB-RETEST-R2** | P1 | **qa-device** | After FCM fix: same AC — logcat POST **2xx** + `HRM-NOTIF-201`. |

---

## Handoff

```
ack_status: PASS_TO_PM
work_item_id: PO-UC-TC-W4-QA-B3-HRM-NT-MOB-R1
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-mob-01-r1.md
uat_done: false
tc_p0_act_hp: FAIL
fail_layer: FCM / google-services (not permission, not stale APK)
next_owner: pm
by_uc: HRM-NT-02 execution stamp updated §9
```

### completion_report

Retest on **emulator-5554** with **fresh NT02 qa-device APK** (SHA256 verified). UAT NV deep-link login **PASS**; notification permission **granted**; scope header **trsport**. **No** device `POST push-tokens` **2xx** — Firebase/FCM not initialized on bundle (`google-services` missing). Prior push-flag and DTO issues addressed in dev handoff but **device HP still FAIL**. **uat_done** false.

### next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-DEV-MOB-NT02-FCM-QA-DEVICE-01
from_role: pm
to_role: dev-mobile
lane: execution
priority: P0
entry_criteria: PO-UC-TC-W4-QA-B3-HRM-NT-MOB-R1 FAIL layer FCM — PUSH_REG=1 APK installed; FirebaseApp init fail; 0× POST push-tokens
exit_criteria: qa-device APK obtains Expo push token on emulator-5554 OR sponsor-approved QA-only POST path; google-services wired; rebuild path + SHA on bus; ack_status READY_FOR_QA → qa-device PO-UC-TC-W4-QA-B3-HRM-NT-MOB-R2
read_first: docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-mob-01-r1.md · apps/mobile/hrm-mobile/android · pushRegistration.ts
evidence_path: docs/qa/evidence/po-uc-tc-w4-dev-mob-nt02-fcm-qa-device-01.md
cấm: seed; claim UAT DONE
```

**If PM prefers gate-only:** dispatch **qc** with GWC — NT-02 device **FAIL** FCM; BE contract already proven `platform: expo` **201** on prior MOB-01 probe (supplementary only).
