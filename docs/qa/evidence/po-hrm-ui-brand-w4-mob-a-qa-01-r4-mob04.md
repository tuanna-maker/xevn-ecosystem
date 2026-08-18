# PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R4-MOB04 — qa-device seat

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R4-MOB04` |
| **parent** | `PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R4` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **Date** | 2026-08-05 |
| **Device** | `emulator-5554` |
| **Persona** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **Pilot API** | `http://14.225.217.232:3001` — L0 **200** (R4 device probe) |
| **U65** | zero-seed · **face_live=false** · **remaster_program_done=false** |
| **ack_status** | **FAIL_TO_PM** |

## Honesty locks

| Flag | Expected | Observed |
|------|----------|----------|
| **face_live** | false | **false** |
| **remaster_program_done** | false | **false** |
| **seed** | none | **none** |
| **fake 2xx** | cấm | **none claimed** — no POST 2xx proof captured |

---

## Executive verdict

**FAIL_TO_PM** — Dedicated MOB-04 seat could **not** close **C-MOB-04**: after **qa-login OBS** session (FE adb login still leaves `login-email` placeholder), automation reached **CheckIn** (GPS channel, submit tapped) but **no** verifiable **POST `/api/hrm/attendance/records` 2xx** in **logcat**, **pilot HTTP proxy** (`127.0.0.1:17811` → pilot), or access log. **APK-02 SHA drift** on disk vs dispatch SoT blocks strict **C-SHA-SOT** closure on this seat.

**Supersedes:** older **MOB04-NET** seats tied to APK **`EB65FD6F…`** — use APK-02 lineage + this file.

---

## SoT APK (pre-install gate)

| Check | Dispatch SoT | Observed at path |
|-------|----------------|------------------|
| **Path** | `C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk` | same |
| **SHA256 (required)** | `8CE49FF25D76F690775DFB4B19B41FC6BF681F11C1D350F8823FC17734A4F765` | — |
| **SHA256 (disk, end of seat)** | — | **`E51C977C8672C9D4ECACC6E25727B2AE1FEA2D682E8525BD7141DEDC4F2C09C5`** |
| **Size** | **71615020** B (APK-02 evidence) | **71615217** B |
| **Install** | `adb -s emulator-5554 install -r -g …` | **Success** (multiple runs) |

**Note:** Early in seat, hash once matched **8CE49FF2…**; artifact on disk later changed (**E51C977C…**) without updated APK evidence — treat as **P0 SoT drift** for PM/dev-mobile.

---

## Session / login

| Path | Result |
|------|--------|
| **FE adb login** | **FAIL** — `login-email` remains placeholder (`login-filled.xml`) |
| **qa-login OBS** | **Used** — `xevn://qa-login` + pilot tokens (`deepLinkHome` / R4 device script) |
| **Proxy base_url** (`http://10.0.2.2:17811`) | **BLOCKED** — deeplink did not reach home (`session_home=false`; zero proxy traffic) |

---

## MOB-04 execution

| Step | Result |
|------|--------|
| Location grants + emulator geo fix | Applied |
| Navigate CheckIn | **Reached** (R4 device rerun — not via FAB sheet this run) |
| **GPS channel** | Selected (`gps-selected.png` / check-in UI) |
| **Submit** | Tapped (`check-in-submit`) |
| **POST 2xx evidence** | **FAIL** — `logcat_post2xx=false`; proxy log empty; `gps-submit-logcat.txt` has no `[HRM-MOB]` / `attendance/records` lines |
| **UI after submit** | Stayed on CheckIn chrome (employee **Nguyễn Văn An** / HLD-0001) — no captured success alert text in dump |

---

## Commands / artifacts

| Step | Command / script | Exit | Notes |
|------|------------------|------|--------|
| MOB04 seat | `node scripts/qa/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r4-mob04.mjs` | **1** / **2** | Proxy home blocked; SHA gate |
| R4 matrix (confirm) | `node scripts/qa/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r4-device.mjs` | **1** | MOB-04 **PARTIAL**; FAB **FAIL** |
| Retest | `node scripts/qa/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r4-retest.mjs` | **0** | No GPS testIDs (stale nav) |

| Artifact | Path |
|----------|------|
| Seat JSON | `docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r4-mob04.json` |
| Proxy log | `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01-r4-mob04-proxy.log` |
| R4 device JSON | `docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r4-device.json` |
| CheckIn / submit | `docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r4/gps-selected.png` · `gps-after-submit.png` · `gps-submit-logcat.txt` |
| MOB04 dumps | `…/mob04-*.png` · `mob04-proxy-snippet.log` (empty traffic) |

---

## AC (MOB-04 only)

| ID | Verdict | Notes |
|----|---------|--------|
| **APK-SHA-SOT** | **FAIL** | Required **8CE49FF2…** ≠ disk **E51C977C…** |
| **MOB-04 GPS POST 2xx** | **FAIL** | No honest network proof |
| **face_live** | **PASS** | No LIVE claim |
| **U65 seed** | **PASS** | No seed |

---

## Root cause (honest)

1. **Release qa-device APK** does not emit capturable **POST status** in logcat (`[HRM-MOB]` absent in submit window).
2. **Pilot reverse proxy** path requires `base_url=http://10.0.2.2:{port}` at session start — deeplink + proxy did not establish home in automation window (no proxied requests logged).
3. **FAB sheet** regression/flake on this run (`fab-primary-action-sheet=false`) — CheckIn still reachable via alternate navigation in R4 device script.
4. **APK artifact drift** on disk vs **APK-02** evidence breaks strict install gate.

---

## completion_report

- **Closed:** MOB-04 seat evidence file; SHA verify documented; install; qa-login OBS session; CheckIn + GPS + submit attempt; honesty locks; supersede note for **EB65FD6F** MOB04-NET seats.
- **Open:** **C-MOB-04** POST **2xx** proof; **C-SHA-SOT** reconcile **8CE49FF2** vs **E51C977C**; FE adb login; optional FAB sheet flake.

---

## next_owner

`pm` → **dev-mobile** (P0) + **dev-fe** (P1)

---

## next_dispatch_prompt

```text
PM → dev-mobile | PO-HRM-UI-BRAND-W4-MOB-A-MOB04-NET-02
entry: R4-MOB04 FAIL_TO_PM · C-MOB-04 OPEN · APK SHA drift E51C977C vs SoT 8CE49FF2
issue: qa-device release — no POST /attendance/records 2xx in logcat; pilot adb-reverse proxy (10.0.2.2:17811) + qa-login base_url does not reach home / zero proxy hits; need QA-flag HTTP status log or documented proxy handoff for qa-device seat only.
exit: MOB-04 seat re-run captures POST 2xx line in logcat OR proxy access log; zero-seed; face_live=false; publish APK SHA in apk-02/evidence when artifact changes.
evidence: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-mob04-net-02.md

PM → dev-fe | PO-HRM-UI-BRAND-W4-MOB-A-FE-ADB-LOGIN-01
entry: login-email placeholder after adb/clipboard fill blocks FE-only U65 login
exit: login-email accepts automation setText; dev panel collapsed by default on cold start.
evidence: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-fe-adb-login-01.md
```

---

## Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **FAIL_TO_PM** |
| **pm_dispatch_hint** | C-MOB-04 OPEN · C-SHA-SOT drift · MOB04-NET-02 |
