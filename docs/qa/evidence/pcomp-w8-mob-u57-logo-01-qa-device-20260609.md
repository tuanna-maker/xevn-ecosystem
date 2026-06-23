# PCOMP-W8-MOB-U57-LOGO-01-QA — U57 splash/login logo device L2.5 @ nip.io

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W8-MOB-U57-LOGO-01-QA` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **ack_status** | **PASS_TO_PM** |
| **upstream** | `docs/qa/evidence/pcomp-w8-mob-u57-logo-01-20260609.md` (READY_FOR_QA) |

---

## Executive verdict

**PASS_TO_PM** — U57 canonical XeVN logo verified on `emulator-5554` @ `https://14-225-217-232.nip.io`. Cold boot `SplashIntro` shows XeVN mark on black (~800–2500ms frames) then login screen with `login-xevn-logo` + `content-desc="XeVN"`. Full session via `uat.nv0001@xe.vn` deep link; MOB-UX-08 scroll order portal→hub→ESS regression PASS; J-MOB-09 whos-out section PASS; J-MOB-25 leave balance **8** / **3** PASS. No fatal logcat; no `x-company-id: main`.

---

## Environment

| Item | Value |
|------|-------|
| Device | `emulator-5554` (sdk_gphone64_x86_64) |
| APK | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| APK size | 71,784,199 B |
| SHA-256 | `913478ADC0B27FE686E8FFB5465B9ECEE02A2E52F9C5C3431B09EFA90522B8AB` |
| API | `https://14-225-217-232.nip.io` |
| Account | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| company_uuid | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` |
| Login | `xevn://qa-login` deep link (`scripts/qa-mobile-login-intent.mjs` pattern) |

---

## Commands (exit codes)

| Command | Exit | Result |
|---------|------|--------|
| `adb shell pm clear vn.xevn.hrm.mobile` | 0 | Success |
| `adb install -r apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` | 0 | Success |
| `Get-FileHash … -Algorithm SHA256` | 0 | Matches `913478ADC…` |
| `node scripts/tmp-pcomp-w8-mob-u57-logo-01-qa-device.mjs` | **0** | All checks PASS |

---

## U57 primary checks

| ID | Requirement | Result | Evidence |
|----|-------------|--------|----------|
| **U57-INTRO** | Cold boot (`pm clear`): black splash → XeVN logo fade+scale → login within ~2s | **PASS** | Intro frames @ 800/1200/1800/2500ms — `content-desc="XeVN"` in `u57-intro-1200ms.xml`; no FATAL logcat |
| **U57-LOGIN-LOGO** | Login screen canonical mark above form | **PASS** | `u57-login.xml` — `resource-id="login-xevn-logo"` + `ImageView content-desc="XeVN"` bounds `[425,126][656,357]`; `XeVN HRM` title + `Đăng nhập` form |

Intro timing notes: frame @ **800ms** shows native splash transition (smaller capture); frames **1200–2500ms** show centered XeVN wings mark on dark background before login transition completes.

---

## Regression (scoped)

| Journey / check | Result | Note |
|-----------------|--------|------|
| **MOB-UX-08-SCROLL** | **PASS** | portal→hub→ESS `yPortal=948` < `yHub=1417` < `yEss=1591` |
| **J-MOB-09** | **PASS** | «Ai nghỉ hôm nay» section visible on scroll (`u57-scroll-*.xml`) |
| **J-MOB-25** | **PASS** | Đơn công → Đơn nghỉ → balance **8** remaining / **3** used (`u57-leave-balance.xml`) |
| **SCOPE-AUDIT** | **PASS** | `x-company-id: main` absent in logcat; UUID `6efaa5d6-…` on session |

---

## Logcat / scope audit

| Check | Result |
|-------|--------|
| FATAL on cold boot | **false** (PASS) |
| `x-company-id: main` in outbound logcat | **false** (PASS) |
| company_uuid on session | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` |

---

## Artifacts

| Path | Description |
|------|-------------|
| `docs/qa/evidence/pcomp-w8-mob-u57-logo-01-qa-device-20260609.json` | Machine verdict JSON |
| `docs/qa/evidence/pcomp-w8-mob-u57-logo-01-screens/` | PNG screenshots + UI XML dumps (18 XML, 14 PNG) |
| `docs/qa/evidence/pcomp-w8-mob-u57-logo-01-screens/u57-intro-*.png` | Cold-boot intro frames |
| `docs/qa/evidence/pcomp-w8-mob-u57-logo-01-screens/u57-login.png` | Login screen with logo |
| `docs/qa/evidence/pcomp-w8-mob-u57-logo-01-screens/u57-01-top.png` … `u57-08-scroll-7.png` | Home scroll regression |
| `docs/qa/evidence/pcomp-w8-mob-u57-logo-01-screens/u57-leave-balance.png` | J-MOB-25 balance |
| `scripts/tmp-pcomp-w8-mob-u57-logo-01-qa-device.mjs` | Repro automation |

---

## Residual

| ID | Item | Severity | Owner |
|----|------|----------|-------|
| R-U57-03 | J-MOB-09 tap→detail not re-exercised (whos-out section present; no person row tap target in today's seed) | INFO | qa-device / PM |
| R-U57-04 | Intro animation timing verified via multi-frame PNG/XML; no screen recording | INFO | — closes dev R-U57-01 |

No product P0/P1 blockers for U57 logo promotion.

---

## Handoff

**completion_report:** PCOMP-W8-MOB-U57-LOGO-01-QA device closed — cold boot SplashIntro XeVN mark on black (~2s) then login `login-xevn-logo` PASS; SHA/install verified; `uat.nv0001@xe.vn` session @ nip.io; MOB-UX-08 scroll + J-MOB-09 + J-MOB-25 regression PASS; scope audit clean.

**next_owner:** `pm`

**next_dispatch_prompt:** PM intake `PCOMP-W8-MOB-U57-LOGO-01-QA` PASS_TO_PM → dispatch **`qc`** for scoped U57 logo gate (intro + login branding + regression spot) or update `PROGRAM_JOURNEY_MAP.md` if U57 closes sponsor branding wave; residual R-U57-03 whos-out tap optional in next hub wave.

**evidence_path:** `docs/qa/evidence/pcomp-w8-mob-u57-logo-01-qa-device-20260609.md`

**ack_status:** **PASS_TO_PM**
