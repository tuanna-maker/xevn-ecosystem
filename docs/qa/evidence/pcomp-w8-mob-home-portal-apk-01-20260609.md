# PCOMP-W8-MOB-HOME-PORTAL-APK-01 — Full Gradle qa-device APK (C-W8-DEVICE-01)

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W8-MOB-HOME-PORTAL-APK-01` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **date** | 2026-06-09 |
| **ack_status** | **READY_FOR_QA** |

---

## Executive verdict

**READY_FOR_QA** — Fresh **full Gradle** `assembleRelease` QA-device APK at `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk`. **No** `jar uf` / `tmp-patch-apk-bundle.mjs` white-screen workaround. Hermes bytecode bundled; `ionicons.ttf` staged in APK assets. Stack includes WHOS-OUT-02 (`composeHomeSummaryParams`), D-W8-ESS-PROMISE-01 font guard, U53 portal shell, MOB-UX-07 leave UX, U57 SplashIntro/XevnLogo, ZenHR FAB.

---

## Artifact

| Property | Value |
|----------|-------|
| **Path** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| **Junction path** | `C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk` |
| **Size** | **69,933,877 bytes** (66.69 MiB) |
| **SHA-256** | `23FBBE9E4333E8F6B9459D8909DA80168B33BE768C2DFE11D10FCE8126AB285C` |
| **Built** | 2026-06-08T08:18:19 (local) |
| **Package** | `vn.xevn.hrm.mobile` |
| **API base** | `https://14-225-217-232.nip.io` |
| **QA flags** | `EXPO_PUBLIC_ENABLE_QA_DEEP_LINK=1`, `EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN=1` |
| **Push registration** | `EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION=0` |
| **JS engine** | Hermes (`bundle magic C6-1F-BC-03`, 4,042,676 B) |
| **Font asset** | `assets/fonts/ionicons.ttf` — 442,604 B |

---

## Build method (Windows — junction + subst, no jar-patch)

**Prerequisites:** junction `C:\xevn-ecosystem` → repo; `ANDROID_HOME` set; **do not** use `tmp-patch-apk-bundle.mjs`.

```powershell
# Junction (one-time)
mklink /J C:\xevn-ecosystem "<repo-absolute-path>"

$env:ANDROID_HOME = "C:\Users\ADMIN\AppData\Local\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:GRADLE_USE_SUBST = "1"
$env:EXPO_PUBLIC_HRM_API_BASE_URL = "https://14-225-217-232.nip.io"
$env:EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION = "0"
$env:EXPO_PUBLIC_ENABLE_QA_DEEP_LINK = "1"
$env:EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN = "1"
$env:NODE_ENV = "production"

Set-Location C:\xevn-ecosystem
pnpm --filter hrm-mobile test
pnpm --filter hrm-mobile run type-check

Set-Location C:\xevn-ecosystem\apps\mobile\hrm-mobile
pnpm run android:apk:qa-device
# Metro prebundle + Hermes compile + Gradle (see build-apk-qa-device-20260609.log)

# Force native repackage when Gradle cache UP-TO-DATE:
$env:GRADLE_SKIP_BUNDLE_TASK = "1"
Remove-Item -Recurse -Force android\app\build\outputs\apk\release -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force android\app\build\intermediates\assets -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force android\app\build\intermediates\compressed_assets -ErrorAction SilentlyContinue
node scripts/gradle.cjs assembleRelease -PreactNativeArchitectures=x86_64 --no-daemon --rerun-tasks
Copy-Item -Force android\app\build\outputs\apk\release\app-release.apk dist\hrm-mobile-qa-device.apk
```

**Logs:** `apps/mobile/hrm-mobile/build-apk-qa-device-20260609.log`, `build-apk-gradle-rerun-20260609.log`

| Step | Result |
|------|--------|
| Metro `export:embed` (1494 modules) | **PASS** — QA_DEV_LOGIN=1, QA_DEEP_LINK=1 |
| Hermes `-emit-binary` | **PASS** — `.cache/hermesc/hermesc.exe` |
| `assembleRelease --rerun-tasks` | **PASS** — 989 tasks, BUILD SUCCESSFUL in 5m 57s |
| `apksigner verify` | **PASS** (v2/v3; META-INF service warnings only) |

**ABI note:** APK ships `x86_64` (emulator AVD api33) plus arm64/armeabi-v7a/x86 from prior multi-ABI intermediates. Emulator smoke uses `lib/x86_64/*` including `libexpo-modules-core.so`, `libreanimated.so`, `librnscreens.so`.

---

## Automated verification

| Check | Command | Exit |
|-------|---------|------|
| Vitest | `pnpm --filter hrm-mobile test` | **0** — 183/183 |
| TypeScript | `pnpm --filter hrm-mobile run type-check` | **0** |
| Hermes in APK | `jar xf` + magic bytes | `C6-1F-BC-03` |
| Bundle markers | strings in APK asset | `qa-login`, `home-whos-out-section`, `14-225-217-232.nip.io` **HIT** |
| ionicons.ttf | `assets/fonts/ionicons.ttf` in APK | **442,604 B** |

---

## Stack bundled (W8)

| Wave | Feature |
|------|---------|
| WHOS-OUT-02 | `composeHomeSummaryParams`, membership holding slug recovery |
| D-W8-ESS-PROMISE-01 | `vectorIconFontsGuard`, `preloadVectorIconFonts`, APK font staging |
| U53 portal | `HomeTopBar`, `HomeHeroCarousel`, `QuickAccessGrid`, `HomeFeedSection` |
| MOB-UX-06/07 | ESS dashboard + leave balance/tabs/inline approve |
| U57 | `SplashIntro`, `XevnLogo` |
| MOB-UX-10b | `CheckInFabOverlay` center FAB |
| W7 QA | Deep-link login `xevn://qa-login` |

---

## Closes / residual

| ID | Status | Notes |
|----|--------|-------|
| **C-W8-DEVICE-01** | **CLOSED (artifact)** | Full Gradle qa-device APK on disk — qa-device install path |
| D-W8-ESS-PROMISE-01 snackbar | **OPEN device** | qa-device must confirm no red toast on Home |
| J-MOB-09 whos_out | **OPEN device** | R3-04 retest with this APK |

**Not used:** `scripts/tmp-patch-apk-bundle.mjs`, `jar uf` bundle inject, Hermes-only repack (prior white-screen class).

---

## completion_report

- Built and published `dist/hrm-mobile-qa-device.apk` via junction `C:\xevn-ecosystem` + `GRADLE_USE_SUBST=1` + full Gradle `assembleRelease` (no jar-patch).
- Metro prebundle with QA deep-link/dev-login flags; Hermes bytecode; ionicons.ttf staged in APK.
- `pnpm --filter hrm-mobile test` 183/183 + `type-check` exit 0.
- Documented SHA-256, size, build commands; closes C-W8-DEVICE-01 artifact gap from interrupted prior dispatch.
- **Residual:** device proof for promise snackbar (D-W8-ESS-PROMISE-01) and J-MOB-09 — handoff qa-device R3-04.

## next_owner

`qa-device`

## next_dispatch_prompt

```
work_item_id: PCOMP-W7-QA-HUB-R3-04
from_role: pm
to_role: qa-device
lane: execution
entry_criteria: PCOMP-W8-MOB-HOME-PORTAL-APK-01 READY_FOR_QA — install apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk (SHA-256 23FBBE9E4333E8F6B9459D8909DA80168B33BE768C2DFE11D10FCE8126AB285C, 69,933,877 B); evidence docs/qa/evidence/pcomp-w8-mob-home-portal-apk-01-20260609.md; pilot https://14-225-217-232.nip.io; uat.nv0001@xe.vn / xevn-uat-2026
action:
1. adb install -r dist/hrm-mobile-qa-device.apk on emulator-5554
2. node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026
3. J-MOB-09 «Ai nghỉ hôm nay» + J-MOB-06/07/08 hub regression; confirm NO promise-rejection snackbar on Home (D-W8-ESS-PROMISE-01)
4. J-MOB-11..15 portal shell spot-check if time permits
exit_criteria: evidence docs/qa/evidence/pcomp-w7-qa-hub-r3-04-20260609.md; ack_status PASS_TO_PM or FAIL_TO_PM with pm_dispatch_hint
evidence_path: docs/qa/evidence/pcomp-w7-qa-hub-r3-04-20260609.md
```

## evidence_path

`docs/qa/evidence/pcomp-w8-mob-home-portal-apk-01-20260609.md`

## ack_status

**READY_FOR_QA**
