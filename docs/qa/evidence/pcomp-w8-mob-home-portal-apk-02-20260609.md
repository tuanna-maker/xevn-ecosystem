# PCOMP-W8-MOB-HOME-PORTAL-APK-02 — Fix Gradle qa-device cold boot (main registration)

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W8-MOB-HOME-PORTAL-APK-02` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **date** | 2026-06-09 |
| **ack_status** | **READY_FOR_QA** |
| **pm_dispatch_hint** | `qa-device` — **PCOMP-W7-QA-HUB-R3-05** rerun with new APK (SHA below) |
| **upstream** | `PCOMP-W7-QA-HUB-R3-05` FAIL · [`pcomp-w7-qa-hub-r3-05-20260609.md`](pcomp-w7-qa-hub-r3-05-20260609.md) |

---

## Executive verdict

**READY_FOR_QA** — Root cause fixed: `index.ts` deferred `registerRootComponent(App)` behind `preloadVectorIconFonts().finally()`, so Hermes release scheduled `"main"` before registration completed → red **«App entry not found»** screen. Fix registers `main` **synchronously**; font preload runs fire-and-forget. Fresh full Gradle `hrm-mobile-qa-device.apk` cold-boots to login on `emulator-5554`; `qa-mobile-login-intent.mjs` reaches Home (`home_reached=true`). **No** jar-patch / inject workaround.

---

## Root cause & fix

| Layer | Before (APK-01) | After (APK-02) |
|-------|-----------------|----------------|
| `index.ts` | `preloadVectorIconFonts().finally(() => registerRootComponent(App))` | `registerRootComponent(App)` sync; `void preloadVectorIconFonts()` |
| Hermes timing | RN runs `"main"` before async preload resolves → permanent error screen | `"main"` registered during bundle init; preload non-blocking |
| D-W8-ESS-PROMISE-01 | Guard + preload preserved | `vectorIconFontsGuard` import first; preload still safe (`.catch`) |

**File changed:** `apps/mobile/hrm-mobile/index.ts`

---

## Artifact

| Property | APK-01 (FAIL boot) | APK-02 (this build) |
|----------|-------------------|---------------------|
| **Path** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` | same |
| **Size** | 69,933,877 B | **71,778,157 B** (68.45 MiB) |
| **SHA-256** | `23FBBE9E4333E8F6B9459D8909DA80168B33BE768C2DFE11D10FCE8126AB285C` | **`96301F435481095523F338C5A4EABA09237A3C1ADE67F66F89665C3E710FB1CF`** |
| **Built** | 2026-06-08T08:18:19 | **2026-06-08T08:43:51** (local) |
| **Package** | `vn.xevn.hrm.mobile` | same |
| **API base** | `https://14-225-217-232.nip.io` | same |
| **QA flags** | `QA_DEEP_LINK=1`, `QA_DEV_LOGIN=1` | same |
| **JS engine** | Hermes | Hermes |

---

## Build method (full Gradle — no jar-patch)

```powershell
$env:ANDROID_HOME = "C:\Users\ADMIN\AppData\Local\Android\Sdk"
$env:GRADLE_USE_SUBST = "1"
$env:EXPO_PUBLIC_HRM_API_BASE_URL = "https://14-225-217-232.nip.io"
$env:EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION = "0"
$env:EXPO_PUBLIC_ENABLE_QA_DEEP_LINK = "1"
$env:EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN = "1"
$env:NODE_ENV = "production"

Set-Location C:\xevn-ecosystem\apps\mobile\hrm-mobile
pnpm run android:apk:qa-device
# Log: build-apk-qa-device-20260609-apk02.log — BUILD SUCCESSFUL in 1m 11s
```

| Step | Result |
|------|--------|
| Vitest | **183/183 PASS** |
| TypeScript | **PASS** |
| Metro `export:embed` | **PASS** |
| Hermes `-emit-binary` | **PASS** |
| `assembleRelease` | **PASS** |

**Not used:** `tmp-patch-apk-bundle.mjs`, `jar uf` bundle inject.

---

## Device smoke (emulator-5554)

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 1 | `pm clear` + install APK-02 | **PASS** | 71,778,157 B |
| 2 | Cold boot — NO «App entry not found» UI | **PASS** | Login/dev JWT form visible; UI dump: no error text |
| 3 | Logcat — functional boot | **PASS** | Transient `Entry not found` WARN ~600ms before `Running "main"`; app recovers (vs APK-01 permanent fail) |
| 4 | `qa-mobile-login-intent.mjs` | **PASS** | `home_reached=true`, `fatal_logcat=false`, exit 0 |
| 5 | J-MOB-06..09 hub | **NOT RUN** | qa-device R3-05 scope |

**Evidence files:**
- [`pcomp-w8-mob-home-portal-apk-02-boot-ui.xml`](pcomp-w8-mob-home-portal-apk-02-boot-ui.xml)
- [`pcomp-w8-mob-home-portal-apk-02-cold2-ui.xml`](pcomp-w8-mob-home-portal-apk-02-cold2-ui.xml)
- [`pcomp-w8-mob-home-portal-apk-02-screens/apk02-post-deeplink-home.png`](pcomp-w8-mob-home-portal-apk-02-screens/apk02-post-deeplink-home.png)

---

## Stack preserved in bundle

| Wave | Feature |
|------|---------|
| WHOS-OUT-02 | `composeHomeSummaryParams`, membership holding slug recovery |
| D-W8-ESS-PROMISE-01 | `vectorIconFontsGuard`, `preloadVectorIconFonts`, APK `ionicons.ttf` |
| U53 portal | HomeTopBar, HomeHeroCarousel, QuickAccessGrid, HomeFeedSection |
| MOB-UX-06/07 | ESS dashboard + leave balance/tabs/inline approve |
| U57 | SplashIntro, XevnLogo |
| MOB-UX-10b | CheckInFabOverlay center FAB |
| W7 QA | `xevn://qa-login` deep link |

---

## completion_report

- **Closed:** `index.ts` entry ordering — synchronous `registerRootComponent(App)` fixes Hermes release cold boot «App entry not found» (PCOMP-W7-QA-HUB-R3-05 blocker).
- **Built:** Full Gradle `dist/hrm-mobile-qa-device.apk` 71,778,157 B, SHA-256 `96301F435481095523F338C5A4EABA09237A3C1ADE67F66F89665C3E710FB1CF` via `C:\xevn-ecosystem` + `GRADLE_USE_SUBST=1` — no jar-patch.
- **Verified:** Vitest 183/183 + tsc PASS; emulator-5554 cold boot → login; deep-link login → Home.
- **Residual:** qa-device must rerun R3-05 — J-MOB-06..09, D-W8-ESS-PROMISE-01 snackbar, J-MOB-11..15 on device.

## next_owner

`qa-device`

## next_dispatch_prompt

```
work_item_id: PCOMP-W7-QA-HUB-R3-05
from_role: pm
to_role: qa-device
lane: execution

entry_criteria:
- PCOMP-W8-MOB-HOME-PORTAL-APK-02 READY_FOR_QA — install apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk
- SHA-256 96301F435481095523F338C5A4EABA09237A3C1ADE67F66F89665C3E710FB1CF (71,778,157 B)
- Evidence: docs/qa/evidence/pcomp-w8-mob-home-portal-apk-02-20260609.md
- Pilot https://14-225-217-232.nip.io; uat.nv0001@xe.vn / xevn-uat-2026
- Prior FAIL: cold boot «App entry not found» — fixed in APK-02

action:
1. node scripts/seed-hrm-uat-mob-hub-qual.mjs (who≥1)
2. adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile
3. adb -s emulator-5554 install -r dist/hrm-mobile-qa-device.apk
4. Cold boot verify — NO «App entry not found» UI; login or Home visible
5. node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026
6. J-MOB-09 «Ai nghỉ hôm nay» + J-MOB-06/07/08 hub regression
7. D-W8-ESS-PROMISE-01 — no red promise-rejection snackbar on Home
8. J-MOB-11..15 portal shell spot-check if time permits

exit_criteria:
- Boot PASS + hub journeys per R3-05 matrix
- evidence docs/qa/evidence/pcomp-w7-qa-hub-r3-05-rerun-20260609.md (or update r3-05)
- ack_status PASS_TO_PM or FAIL_TO_PM with pm_dispatch_hint

evidence_path: docs/qa/evidence/pcomp-w7-qa-hub-r3-05-rerun-20260609.md
```

## evidence_path

`docs/qa/evidence/pcomp-w8-mob-home-portal-apk-02-20260609.md`

## ack_status

**READY_FOR_QA**
