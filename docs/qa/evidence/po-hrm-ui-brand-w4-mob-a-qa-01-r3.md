# PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R3 — qa-device evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R3` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **Date** | 2026-08-05 |
| **Prior** | R2 GWC `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01-r2.md` |
| **Supersedes** | stalled seat `c157800e` |
| **U65** | zero-seed · **face_live=false** · **remaster_program_done=false** |
| **ack_status** | **PASS_TO_PM (GWC)** |

## Honesty locks (mandatory)

| Flag | Expected | Observed |
|------|----------|----------|
| **face_live** | false | **false** — Face channel shows MVP honesty only; no LIVE claim |
| **remaster_program_done** | false | **false** |
| **attendance_closed** | false | **false** — GPS channel + submit exercised on device |
| **product_go** | false | **false** |
| **seed** | none | **none** |

---

## Executive verdict

**PASS_TO_PM (GO WITH CONDITIONS)** — SoT APK **SHA256 `EB65FD6F…` / 71614240 B** verified pre-install and installed on **emulator-5554**. Pilot HRM **L0** `http://14.225.217.232:3001` **200**. **MOB-04b** **PASS** on device (`face-mvp-honesty-banner` + `check-in-submit` disabled on Face). **J-MOB-02** FAB sheet **PASS** (`fab-primary-action-sheet` on `login-0` / navigation to check-in). **J-MOB-01** home brand testIDs **PARTIAL** (visible on `fab-sheet.xml` home layer; dedicated home dump timing flaky after qa-login OBS).

**GWC / not promoted:** **FE-only login** — cold start restored session (FAB overlay); `login-email` / `branded-login-card` not reachable for adb typing; **`xevn://qa-login` OBS** used for session (not sole PASS). **MOB-04 GPS POST 2xx** — submit tapped on GPS channel; **no `POST /attendance/records` 2xx in logcat** (release APK does not emit RN network lines).

---

## SoT APK — recorded BEFORE install (mandatory)

| Check | Expected | Observed |
|-------|----------|----------|
| **Path** | `C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk` | present |
| **SHA256** | `EB65FD6FF658FA2575DDFB7299347CDC2DE4985A2AE5FFDA1CEC5ED78DF5D066` | **MATCH** (`Get-FileHash` pre-install) |
| **Size** | 71614240 bytes | **71614240** |
| **Stale hash** | IGNORE `0568F584…` (R2) | not used |

---

## ENV

| Item | Value |
|------|--------|
| **Device** | `emulator-5554` · `sdk_gphone64_x86_64` |
| **Persona** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **App API (APK bundle)** | `http://14.225.217.232:3001` |
| **Login path** | UI FE **not completed** → `xevn://qa-login` **OBS** (API mobile login **201** probe PASS) |
| **Seed** | **None** |

---

## Commands (exit codes)

| Step | Command | Exit | Result |
|------|---------|------|--------|
| Hash | `Get-FileHash …/hrm-mobile-qa-device.apk` | 0 | EB65FD6F… |
| Install | `adb -s emulator-5554 install -r -g …apk` | 0 | Success |
| Matrix | `node scripts/qa/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r3-device.mjs` | 1 | See JSON (timing false FAILs) |
| Retest | `node scripts/qa/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r3-retest.mjs` | 0 | MOB-04b PASS |
| Pilot health | `GET /api/hrm/` | 200 | PASS |

**Logs:** `docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r3-device.json` · `…-retest.json` · `…-device-run.log`

---

## AC matrix — device (authoritative after XML audit + retest)

| ID | AC | Verdict | Evidence |
|----|-----|---------|----------|
| **APK-SoT** | EB65FD6F hash before install | **PASS** | This doc §SoT APK |
| **MOB-01** | Login brand chrome | **PARTIAL** | Cold start = FAB restore; `login-0.xml` lacks `login-email` (see `login-0.png`) |
| **J-MOB-01** | Home brand testIDs | **PARTIAL** | `fab-sheet.xml`: `home-top-bar-brand-accent` + `dashboard-attendance-brand-bar`; `home-brand.xml` dump missed IDs (timing) |
| **J-MOB-01-login** | FE login → home | **PARTIAL** | UI fail adb · **qa-login OBS** `deeplink-home-obs.png` (not sole PASS) |
| **J-MOB-02** | FAB sheet | **PASS** | `login-0.xml` / `login-0.png`: `fab-primary-action-sheet`, `brand-dialog-chrome` |
| **J-MOB-02-nav** | FAB → check-in | **PASS** | `checkin-screen.xml`: `check-in-channel-gps` |
| **MOB-04b** | Face honesty + submit disabled | **PASS** | `retest-mob04b.png` · `face-mvp-honesty-banner` · submit `enabled="false"` |
| **MOB-04** | GPS POST 2xx | **PARTIAL** | `retest-gps-post.png` · logcat `retest-gps-logcat.txt` — no attendance 2xx line |
| **face_live** | No LIVE claim | **PASS** | Policy + MOB-04b screen |

---

## Screenshots (primary)

| Artifact | Path |
|----------|------|
| FAB / J-MOB-02 | `docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r3/login-0.png` |
| Home brand (layer) | `…/fab-sheet.png` |
| qa-login OBS | `…/deeplink-home-obs.png` |
| Check-in GPS | `…/checkin-screen.png` |
| **MOB-04b** | `…/retest-mob04b.png` |
| GPS after submit | `…/retest-gps-post.png` |

---

## completion_report

- **Closed vs R2:** Correct SoT APK (**EB65FD6F**, not stale R2 hash); install on emulator; **MOB-04b** device **PASS** with screenshots; Face channel uses **`check-in-channel-face-mvp`**; pilot API reachable.
- **Still open (GWC):** Full **FE-only** login form on cold start (session/FAB blocks `login-email`); **MOB-04** network proof (`POST /attendance/records` **2xx** not captured in logcat on release build).
- **Regression:** None vs L1 vitest contract; no seed; no Face LIVE.

---

## next_dispatch_prompt

```text
PM → dev-fe | PO-HRM-UI-BRAND-W4-MOB-A-FE-LOGIN-01
entry: U65 · uat.nv0001@xe.vn · qa-device R3 GWC
issue: Cold start on qa-device APK opens FAB/session without branded login testIDs — adb cannot complete FE login (R3 login-0..15 dumps).
exit: Fresh install / logout → login screen exposes login-email + branded-login-card; adb UI login reaches home without qa-login deep link.
evidence: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01-r3.md §MOB-01

PM → dev-mobile OR qa-device | PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R4
entry: EB65FD6F APK · MOB-04 partial
issue: GPS submit on device — no logcat/ReactNativeJS proof of POST /attendance/records 2xx (release APK).
exit: Either dev-only network trace hook for qa-device builds OR qa-device seat with proxy/mitm capturing 2xx on pilot :3001 during GPS submit (zero-seed, same persona).
evidence: retest-gps-logcat.txt · retest-gps-post.png
```

---

## pm_dispatch_hint

- **P0 residual:** MOB-04 logcat/proxy 2xx + FE login cold-start (blocks strict U65 UF without qa-login OBS).
- **Promote MOB-04b** to matrix 🟢 after PM ack.
- **QC:** GWC acceptable for W4-MOB-A pilot slice if sponsor accepts qa-login OBS + MOB-04 PARTIAL until R4.

---

**ack_status:** **PASS_TO_PM (GWC)**
