# PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R4 — qa-device evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R4` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **Date** | 2026-08-05 |
| **Prior** | `po-hrm-ui-brand-w4-mob-a-fe-login-01.md` · `po-hrm-ui-brand-w4-mob-a-apk-02.md` |
| **U65** | zero-seed · **face_live=false** · **remaster_program_done=false** |
| **ack_status** | **PASS_WITH_OBS** |

## Honesty locks (mandatory)

| Flag | Expected | Observed |
|------|----------|----------|
| **face_live** | false | **false** |
| **remaster_program_done** | false | **false** |
| **seed** | none | **none** |
| **fake APK** | cấm | **SoT build** `android:apk:qa-device` exit **0** |

---

## Executive verdict

**PASS_WITH_OBS** — New qa-device APK **SHA256 `8CE49FF2…`** installed on **emulator-5554**. **MOB-01 / cold-start login chrome PASS** after `pm clear` (`login-screen-root`, `branded-login-card`, `login-email` visible) — **closes QC C-LOGIN-DEEPLINK for session-restore blocker**. **J-MOB-02 FAB PASS**. **J-MOB-01 home brand PASS** (after session). **FE adb login → home FAIL** (email field stayed placeholder; **qa-login OBS** used — not sole PASS). **MOB-04 GPS POST 2xx NOT captured** (check-in navigation blocked by permission overlay / empty check-in dump on first pass; retest could not enable GPS submit; release logcat silent — **C-MOB-04 remains OPEN**).

---

## SoT APK (pre-install)

| Check | Value |
|-------|--------|
| **Path** | `C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk` |
| **SHA256** | `8CE49FF25D76F690775DFB4B19B41FC6BF681F11C1D350F8823FC17734A4F765` |
| **Size** | **71615020** bytes |
| **Prior APK-01** | `EB65FD6F…` — **superseded** by APK-02 rebuild |
| **Build evidence** | `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-apk-02.md` |

---

## ENV

| Item | Value |
|------|--------|
| **Device** | `emulator-5554` |
| **Persona** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **Pilot API** | `http://14.225.217.232:3001` — L0 **200** |
| **Login path** | Cold chrome **FE** · session via **qa-login OBS** after adb typing failed |
| **Package** | `vn.xevn.hrm.mobile` |

---

## Commands (exit codes)

| Step | Command | Exit | Notes |
|------|---------|------|--------|
| Build | `pnpm run android:apk:qa-device` | **0** | APK-02 |
| Hash | `Get-FileHash …/hrm-mobile-qa-device.apk` | **0** | 8CE49FF2… |
| Install | `adb -s emulator-5554 install -r -g …apk` | **0** | Success |
| Clear | `adb shell pm clear vn.xevn.hrm.mobile` | **0** | Before MOB-01 |
| Matrix | `node scripts/qa/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r4-device.mjs` | **1** | MOB-04 nav fail |
| Retest | `node scripts/qa/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r4-retest.mjs` | **0** | GPS submit not enabled |

**Machine logs:** `_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r4-device.json` · `_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r4-retest.json` · `_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r4-device-run.log`

---

## AC matrix

| ID | AC | Verdict | Evidence |
|----|-----|---------|----------|
| **APK-SoT** | New hash after FE-LOGIN-01 | **PASS** | APK-02 · 8CE49FF2… |
| **MOB-01** | Cold start login chrome after `pm clear` | **PASS** | `login-0.png` · testIDs all true |
| **C-LOGIN-DEEPLINK** | Session restore no longer hides login on fresh clear | **PASS** | MOB-01 (chrome visible) |
| **J-MOB-01-login** | FE adb login → home without deeplink | **PARTIAL** | `login-filled.xml` — email placeholder; **qa-login OBS** |
| **J-MOB-01-home** | Brand testIDs on home | **PASS** | `home-brand.png` |
| **J-MOB-02** | FAB sheet | **PASS** | `fab-sheet.png` · `fab-primary-action-sheet` |
| **MOB-04** | GPS submit · POST `/attendance/records` **2xx** | **FAIL** | No submit control / no logcat 2xx |
| **face_live** | No LIVE claim | **PASS** | Policy |

---

## Screenshots / dumps

| Artifact | Path |
|----------|------|
| Cold login chrome | `docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r4/login-0.png` |
| Login after adb type attempt | `…/login-filled.png` |
| qa-login OBS home | `…/deeplink-home-obs.png` |
| Home brand | `…/home-brand.png` |
| FAB | `…/fab-sheet.png` |
| GPS / check-in attempts | `…/gps-selected.png` · `…/retest-gps.png` |

---

## QC condition status (R4)

| Condition | R4 |
|-----------|-----|
| **C-LOGIN-DEEPLINK** | **Closed** for cold-start chrome (`pm clear` → branded login) |
| **C-SHA-SOT** | **Closed** (8CE49FF2 recorded pre-install) |
| **C-MOB-04** | **OPEN** — no POST 2xx proof on device |
| **C-MOB-04b** | Not re-run this seat (Face honesty assumed unchanged; **face_live=false**) |

---

## completion_report

- **Closed:** APK-02 artifact; install; **MOB-01 PASS**; **C-LOGIN-DEEPLINK** cold-start path; **J-MOB-02** FAB; home brand testIDs with qa-device bundle.
- **Open (OBS):** **FE-only adb login** — `adb input text` did not replace `login-email` placeholder (dev URL panel focus); needs clipboard-based typing or dev-mobile adb helper — **qa-login OBS** used for downstream steps only.
- **Open (FAIL):** **MOB-04** — could not complete GPS submit + **2xx** evidence on pilot (permission dialog + check-in screen timing; release APK logcat does not emit network lines).

---

## next_owner

`pm` → dispatch **dev-mobile** (MOB-04 network trace on qa-device builds **or** adb login helper) + optional **dev-fe** (adb-friendly login field focus)

---

## next_dispatch_prompt

```text
PM → dev-mobile | PO-HRM-UI-BRAND-W4-MOB-A-MOB04-NET-01
entry: R4 PASS_WITH_OBS · APK 8CE49FF2 · C-MOB-04 OPEN
issue: GPS check-in submit on emulator — no POST /attendance/records 2xx in logcat (release); FAB→check-in sometimes blocked on notification permission overlay.
exit: qa-device build logs attendance POST status in __DEV__/QA flag OR documented mitm/proxy step for qa-device seat; zero-seed; same persona.
evidence: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-mob04-net-01.md

PM → dev-fe | PO-HRM-UI-BRAND-W4-MOB-A-FE-ADB-LOGIN-01
entry: MOB-01 PASS but adb input text fails on login-email (placeholder remains)
exit: login-email accepts adb/UIAutomator setText OR hide dev panel from default focus so adb login matrix passes without qa-login deeplink.
evidence: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-fe-adb-login-01.md
```

---

## Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_WITH_OBS** |
| **pm_dispatch_hint** | C-MOB-04 OPEN · FE adb login PARTIAL |
