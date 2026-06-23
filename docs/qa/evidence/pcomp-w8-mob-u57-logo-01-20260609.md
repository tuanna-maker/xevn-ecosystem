# PCOMP-W8-MOB-U57-LOGO-01 — Canonical XeVN logo / splash on mobile APK

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W8-MOB-U57-LOGO-01` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **date** | 2026-06-09 |
| **ack_status** | **READY_FOR_QA** |
| **spec_ref** | U57 sponsor requirement · `assets/brand/README.md` |

---

## Executive verdict

**READY_FOR_QA** — Canonical `xevn-logo-master.png` verified synced to all mobile asset targets (`xevn-logo.png`, `icon.png`, `splash.png`, `adaptive-icon.png`). `SplashIntro` fade+scale intro and `XevnLogo` on login unchanged and present in bundle. `app.json` icon/splash/adaptive-icon aligned (`#000000` background). Full Gradle qa-device APK rebuilt via junction + `GRADLE_USE_SUBST=1`; cold boot shows intro XeVN mark then login `login-xevn-logo`; no fatal logcat; `qa-mobile-login-intent` home PASS. Vitest **199/199**; tsc PASS. MOB-UX-08-P0 baseline SHA preserved (no functional delta).

---

## Asset sync verification

| File | SHA-256 | Bytes | Match master |
|------|---------|-------|--------------|
| `assets/brand/xevn-logo-master.png` | `E1763A9D613B1BFF7421DC96504137240131C75C04D7D62BABD7E5E862836A3D` | 137,704 | — |
| `apps/mobile/hrm-mobile/assets/xevn-logo.png` | `E1763A9D…62836A3D` | 137,704 | ✓ |
| `apps/mobile/hrm-mobile/assets/icon.png` | `E1763A9D…62836A3D` | 137,704 | ✓ |
| `apps/mobile/hrm-mobile/assets/splash.png` | `E1763A9D…62836A3D` | 137,704 | ✓ |
| `apps/mobile/hrm-mobile/assets/adaptive-icon.png` | `E1763A9D…62836A3D` | 137,704 | ✓ |

**app.json** (`apps/mobile/hrm-mobile/app.json`):

- `icon`: `./assets/icon.png`
- `splash.image`: `./assets/splash.png`, `backgroundColor`: `#000000`
- `android.adaptiveIcon.foregroundImage`: `./assets/adaptive-icon.png`, `backgroundColor`: `#000000`

---

## Brand components (no code delta)

| Component | Path | Behavior |
|-----------|------|----------|
| `SplashIntro` | `src/components/brand/SplashIntro.tsx` | Black overlay; logo fade-in (650ms) + spring scale 0.55→1; glow scale; 900ms hold; 450ms fade-out |
| `XevnLogo` | `src/components/brand/XevnLogo.tsx` | Canonical mark from `assets/xevn-logo.png`; `testID` on login |
| `App.tsx` | Overlay above navigator until `onIntroFinish` | Status bar light during intro |
| `LoginScreen` | `XevnLogo size={88} testID="login-xevn-logo"` | Login branding |

**Preserved (no regression):** `index.ts` synchronous `registerRootComponent(App)` boot fix (APK-02); MOB-UX-08 scroll order; scope/WHOS-OUT/leave-balance resolvers untouched.

---

## Verification

| Check | Command / action | Result |
|-------|------------------|--------|
| Vitest | `pnpm --filter hrm-mobile test` @ `C:\xevn-ecosystem` | **199/199 PASS** |
| TypeScript | `pnpm --filter hrm-mobile type-check` | **PASS** |
| Gradle qa-device APK | `GRADLE_USE_SUBST=1 pnpm --filter hrm-mobile run android:apk:qa-device` | **BUILD SUCCESSFUL** ~1m 13s |
| APK artifact | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` | **71,784,199 B** (68.46 MiB) |
| SHA-256 | `Get-FileHash` | `913478ADC0B27FE686E8FFB5465B9ECEE02A2E52F9C5C3431B09EFA90522B8AB` |
| Cold boot intro | `adb shell pm clear` + `am start` @ emulator-5554; uiautomator @ 3s | **PASS** — `XeVN` / intro mark visible |
| Login logo | uiautomator @ 5s post-launch | **PASS** — `login-xevn-logo` / `content-desc="XeVN"` |
| Fatal logcat | `logcat -d -t 150` after cold boot | **PASS** — no FATAL |
| Deep-link home smoke | `node scripts/qa-mobile-login-intent.mjs` | **PASS** — `home_reached: true`, `fatal_logcat: false` |

Build log: `apps/mobile/hrm-mobile/build-apk-u57-logo-20260609.log`

---

## QA device scope (U57 + regression)

| Journey / check | Focus |
|-----------------|-------|
| **U57 intro** | Cold boot (`pm clear`): black splash → logo fade+scale → login within ~2s |
| **U57 login logo** | Login screen shows XeVN wings mark (`login-xevn-logo`) above form |
| **Native splash** | Expo `splash.png` + Android `splashscreen_background` `#000000` |
| J-MOB-06..29 | Smart Hub / leave / manager — **no code delta**; regression only |
| J-AVT-02 | Avatar upload — **no code delta**; regression only |
| MOB-UX-08 | Home scroll order portal→hub→ESS — **no code delta**; regression only |

**Account:** `uat.nv0001@xe.vn` / `xevn-uat-2026` · API `https://14-225-217-232.nip.io`

**Device steps:** `adb install -r dist/hrm-mobile-qa-device.apk`; `adb shell pm clear vn.xevn.hrm.mobile`; launch app — observe intro animation; confirm login logo; then deep-link or manual login for J-MOB regression.

---

## Residual

| ID | Item | Owner |
|----|------|-------|
| R-U57-01 | qa-device visual proof of intro animation timing (fade+scale) on physical device recording | qa-device |
| R-U57-02 | APK SHA identical to MOB-UX-08-P0 — expected (assets already synced pre-wave) | — |

---

**completion_report:** PCOMP-W8-MOB-U57-LOGO-01 closed — master logo sync verified (5 files identical SHA); SplashIntro/XevnLogo/app.json confirmed; qa-device APK rebuilt junction+subst; cold boot intro+login logo PASS; tests 199/199; MOB-UX-08 baseline SHA preserved.

**next_owner:** `qa-device`

**next_dispatch_prompt:** Operate as **qa-device** per `.cursor/agents/qa-device.md` for `PCOMP-W8-MOB-U57-LOGO-01`: install `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` SHA `913478ADC0B27FE686E8FFB5465B9ECEE02A2E52F9C5C3431B09EFA90522B8AB` on emulator-5554; `adb shell pm clear vn.xevn.hrm.mobile`; cold boot — verify U57 intro (black screen, logo fade+scale ~2s) then login screen XeVN logo (`login-xevn-logo`); screenshot evidence; regression J-MOB-06..29, J-AVT-02, MOB-UX-08 scroll order; evidence `docs/qa/evidence/pcomp-w8-mob-u57-logo-01-qa-device-20260609.md`.

**evidence_path:** `docs/qa/evidence/pcomp-w8-mob-u57-logo-01-20260609.md`

**ack_status:** **READY_FOR_QA**
