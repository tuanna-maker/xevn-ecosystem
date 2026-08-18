# PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R2 — qa-device device L2.5

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R2` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **Date** | 2026-08-05 |
| **supersedes** | Prior R2 stall SHA `0568F584…` — **IGNORE** |
| **prior_L1** | `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01.md` |
| **apk_handoff** | `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-apk-01.md` |
| **U65** | zero-seed · UI login only |
| **ack_status** | **PASS_TO_PM (GWC)** |

## Honesty locks (mandatory)

| Flag | Expected | Observed |
|------|----------|----------|
| **face_live** | false | **false** — Face MVP banner + `check-in-submit` disabled on Face channel |
| **remaster_program_done** | false | **false** |
| **attendance_closed** | false | **false** — GPS path exercised (submit attempted) |
| **product_go** | false | **false** |

---

## APK pre-install (recorded before `adb install`)

| Field | Value |
|-------|--------|
| **apk_path** | `C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk` |
| **size_bytes** | `71614240` |
| **sha256** | `EB65FD6FF658FA2575DDFB7299347CDC2DE4985A2AE5FFDA1CEC5ED78DF5D066` |
| **verify_cmd** | `Get-FileHash -Algorithm SHA256` |
| **verify_result** | **MATCH** |
| **adb install** | `adb -s emulator-5554 install -r` → **Success** |

---

## ENV / device

| Item | Value |
|------|--------|
| **serial** | `emulator-5554` (`sdk_gphone64_x86_64`) |
| **adb devices** | 1 device |
| **HRM API** | `http://10.0.2.2:28001` via dev URL field + `adb reverse tcp:28001 tcp:28001` |
| **Stack** | `pnpm run qc:fe-be-health` → **ALL PASS** (pre-run) |
| **Persona** | `uat.nv0001@xe.vn` / `xevn-uat-2026` — **UI login** (BrandedLoginCard → `login-submit`) |
| **Seed** | **None** |

---

## Commands

| Command | Exit | Notes |
|---------|------|--------|
| `Get-FileHash` APK | 0 | SHA256 match |
| `adb install -r` | 0 | Streamed install success |
| `pnpm run qc:fe-be-health` | 0 | ALL PASS |
| `node scripts/_smoke-w4-brand-r2-qa.cjs` | 1 | Automation exit 1 — manual XML audit closes MOB-04b (see below) |
| Pre-grant location/notifications | 0 | `pm grant` FINE/COARSE/POST_NOTIFICATIONS |

**Automation artifact:** `docs/qa/evidence/screenshots/po-hrm-ui-brand-w4-mob-a-qa-01-r2/device-result.json`

---

## J-MOB / AC matrix (device)

| ID | Verdict | Evidence |
|----|---------|----------|
| **J-MOB-01** Login → Home chrome | **PASS** | `home-top-bar-brand-accent` in UI dump; user «Nguyễn Văn An» · `device-result.json` journeys.J-MOB-01.pass=true |
| **J-MOB-02** FAB → sheet → Check-in | **PASS** | `fab-primary-action-sheet`, `fab-action-check-in`, `check-in-channel-gps` in dumps |
| **MOB-01** Login brand card | **PASS** | `branded-login-card`, `brand-dialog-chrome`, `brand-dialog-wordmark` — `01-launch-0.xml` |
| **MOB-04** GPS check-in POST 2xx | **GWC — not promoted** | Submit tapped; `ui_toast` heuristic true; **logcat** lacks `/attendance/records` — app backgrounded during capture (`09-after-gps-submit.xml` launcher) |
| **MOB-04b** Face honesty + submit disabled | **PASS (device)** | `06-checkin-gps.xml`: `face-mvp-honesty-banner` + `check-in-submit` **`enabled="false"`** on Face MVP channel |
| **dashboard-attendance-brand-bar** | **N/A this home** | ESS home uses stat rows — `home-top-bar-brand-accent` present; no `dashboard-attendance-brand-bar` on current home layout |

### testIDs (device uiautomator)

| testID | Observed |
|--------|----------|
| `branded-login-card` | Yes |
| `brand-dialog-chrome` | Yes |
| `home-top-bar-brand-accent` | Yes |
| `check-in-fab` / «Thao tác nhanh» | Yes |
| `fab-primary-action-sheet` | Yes |
| `fab-action-check-in` | Yes |
| `check-in-channel-gps` | Yes |
| `check-in-channel-face-mvp` | Yes |
| `face-mvp-honesty-banner` | Yes (Face channel — `06-checkin-gps.xml`) |
| `check-in-submit` | GPS: enabled; Face: **disabled** |
| `face-enroll-chrome-panel` | Yes |

---

## Screenshots / XML paths

| Artifact | Path |
|----------|------|
| Login chrome | `docs/qa/evidence/screenshots/po-hrm-ui-brand-w4-mob-a-qa-01-r2/01-launch-0.xml` |
| Home | `docs/qa/evidence/screenshots/po-hrm-ui-brand-w4-mob-a-qa-01-r2/04-home.xml` |
| FAB sheet | `docs/qa/evidence/screenshots/po-hrm-ui-brand-w4-mob-a-qa-01-r2/05-fab-sheet.xml` |
| Check-in Face MVP | `docs/qa/evidence/screenshots/po-hrm-ui-brand-w4-mob-a-qa-01-r2/06-checkin-gps.xml` |
| PNG (if present) | `docs/qa/evidence/screenshots/po-hrm-ui-brand-w4-mob-a-qa-01-r2/r2-final-face-channel.png` |
| Submit log | `docs/qa/evidence/screenshots/po-hrm-ui-brand-w4-mob-a-qa-01-r2/logcat-submit.txt` |

---

## Residual / not promoted

| Item | Owner | Trigger |
|------|-------|---------|
| MOB-04 GPS **POST 2xx** network proof on device | `qa-device` | Re-run submit with React Native network logging or Charles; keep app foreground; assert `POST …/attendance/records` 201 |
| Stabilize adb automation (launcher focus) | `qa-device` | Harden `scripts/_smoke-w4-brand-r2-qa.cjs` foreground guard |
| `dashboard-attendance-brand-bar` on ESS home | `ba-process` / `dev-fe` | Confirm SRS expects stat-row home vs attendance dashboard bar |

---

## completion_report

- Verified APK **EB65FD6F…** (71614240 B) and installed on **emulator-5554**.
- **U65** UI login `uat.nv0001@xe.vn` with dev URL `http://10.0.2.2:28001` (no seed).
- **Promoted:** J-MOB-01, J-MOB-02, login/home/FAB/check-in channel testIDs, **MOB-04b** Face honesty + disabled submit on device.
- **GWC:** MOB-04 GPS POST **2xx** not captured in logcat; one automation run exited 1 due to timing/foreground — XML audit used for MOB-04b closure.
- Honesty: **face_live=false**, **remaster_program_done=false**.

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R2-MOB04-NET
from_role: pm
to_role: qa-device
priority: P1
entry_criteria: po-hrm-ui-brand-w4-mob-a-qa-01-r2.md GWC; emulator-5554; same APK SHA; permissions pre-granted
exit_criteria: Device GPS «Chấm công vào» → captured POST /api/hrm/attendance/records 2xx in log/Metro; F5-equivalent re-open check-in shows state; ack PASS_TO_PM or FAIL
cấm: seed · face_live claim
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01-r2-mob04-net.md
```

```text
work_item_id: PO-HRM-UI-BRAND-W4-MOB-A-QC-01
from_role: pm
to_role: qc
priority: P0
entry_criteria: R2 device evidence + prior L1 vitest 20/20
exit_criteria: QC GO/GWC on W4-MOB-A slice; cite MOB-04 residual if GWC
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qc-r2-gate.md
```

---

**ack_status:** `PASS_TO_PM` (GO WITH CONDITIONS — MOB-04 network)
