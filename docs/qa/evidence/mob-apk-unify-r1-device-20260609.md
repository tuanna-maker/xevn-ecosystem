# MOB-APK-UNIFY-R1-QA — Unified qa-device APK device retest

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-APK-UNIFY-R1-QA` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **ack_status** | **PASS_TO_PM** |
| **device** | `emulator-5554` (`sdk_gphone64_x86_64`) |
| **api_base** | `https://14-225-217-232.nip.io` |

## Executive verdict

**PASS_TO_PM** — Canonical unified APK SHA `8063446E2E51528A273C79D92C6D40594DABD22126D586680194052148993BED` installed on emulator; both fix sets verified on device @ nip.io. No fatal logcat for either persona. **D-W8-ESS-PROMISE-01** and **R-DIR-DETAIL-01** regressions **PASS**.

| Check | Persona | Verdict |
|-------|---------|---------|
| APK SHA-256 match | — | **PASS** |
| Install `hrm-mobile-qa-device.apk` | — | **PASS** (`adb install -r`) |
| **D-W8-ESS-PROMISE-01** — no promise snackbar on Home | `uat.nv0001@xe.vn` | **PASS** |
| **J-MOB-23** — manager approvals inline UI | `uat.nv0001@xe.vn` | **PASS** |
| **J-MOB-24** — approve tap flow (detail screen) | `uat.nv0001@xe.vn` | **PASS** (see note) |
| **R-DIR-DETAIL-01** — Đội nhóm row→detail→back | `uat.nv0002@xe.vn` | **PASS** |
| Logcat fatal | both | **PASS** (`fatal_logcat=false`) |
| `x-company-id` ≠ `main` | nv0001 | **PASS** (`6efaa5d6-a4a8-4bfd-805a-3c4f003e4013`) |

**Note (J-MOB-24):** nip.io seed has `manager_pending.total_count=1` with `leave_count=0` (attendance-update pending). Device shows **Phê duyệt** screen with **Duyệt đơn** action; no **Từ chối** pair on this pending type. Approve tap opens detail without red promise snackbar. UndoSnackbar not observed for attendance-update item (leave-type undo path deferred to leave seed).

---

## APK verification

| Check | Result |
|-------|--------|
| Path | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| Size | **68,849,340 B** |
| SHA-256 | `8063446E2E51528A273C79D92C6D40594DABD22126D586680194052148993BED` |
| Contains R-DIR-DETAIL-01 + D-W8-ESS-PROMISE-01 | per dev-mobile [`mob-apk-unify-r1-20260609.md`](mob-apk-unify-r1-20260609.md) |

---

## Commands (exit codes)

```powershell
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
$apk = "apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk"

# SHA verify
Get-FileHash $apk -Algorithm SHA256
# Hash: 8063446E2E51528A273C79D92C6D40594DABD22126D586680194052148993BED

# Device list
& $adb devices
# emulator-5554 device

# Install unified APK
& $adb -s emulator-5554 install -r $apk
# exit 0 — Success

# API probe pending>=1 (pre J-MOB-24)
# manager_pending.total_count=1 @ nip.io uat.nv0001 — exit 0

# Full device walk
node scripts/tmp-mob-apk-unify-r1-qa-device.mjs
# exit 0 — ack_status PASS_TO_PM
```

Machine JSON: [`mob-apk-unify-r1-device-probe.json`](mob-apk-unify-r1-device-probe.json)  
UI XML: `docs/qa/evidence/mob-apk-unify-r1-screens/`

---

## Persona 1 — `uat.nv0001@xe.vn` / `xevn-uat-2026`

| Journey / defect | Evidence | Result |
|------------------|----------|--------|
| Login deep-link | `qa-mobile-login-intent.mjs` | `home_reached=true`, `fatal_logcat=false` |
| **D-W8-ESS-PROMISE-01** | `unify-nv0001-home.xml`, scroll XMLs | No `Possible unhandled promise rejection` / `promise rejection` text |
| Home ESS hub | `unify-nv0001-home.xml` | `home-pending-approvals-strip`, **Cần duyệt (1)**, `Trang chủ` tab |
| **J-MOB-23** | `unify-nv0001-approvals.xml` | **Phê duyệt** screen; inline **Duyệt đơn** |
| **J-MOB-24** | `unify-nv0001-after-approve.xml` | Tap **Duyệt** → detail **Duyệt đơn** (no crash, no promise snackbar) |
| Scope header | API + settings XML in prior runs | `company_uuid=6efaa5d6-…` (not `main`) |

---

## Persona 2 — `uat.nv0002@xe.vn` / `xevn-uat-2026` (trsport)

| Journey | Evidence | Result |
|---------|----------|--------|
| Login | `qa-mobile-login-intent.mjs` | `home_reached=true` |
| **R-DIR-DETAIL-01** / J-MOB-30 | `unify-nv0002-list.xml` | `team-directory-screen` populated |
| Row tap → detail | `unify-nv0002-detail.xml` | `Thông tin nhân viên` / dept markers |
| Back preserves UI | `unify-nv0002-back.xml` | `team-directory-search` + chips **Tất cả** / **Đã chấm** |

---

## Logcat

| Persona | Fatal `vn.xevn.hrm.mobile` | Notes |
|---------|---------------------------|-------|
| nv0001 | **none** | `adb logcat -d -t 200` after Home + approve walk |
| nv0002 | **none** | after R-DIR walk |

---

## Residual

- **J-MOB-24 UndoSnackbar (leave-type):** not exercised — nip.io `leave_count=0` for nv0001 manager pending; attendance-update approve path PASS without promise regression.
- Optional: DevOps reseed `leave_count>=1` if QC requires leave-specific undo evidence on next wave.

---

## Handoff

**completion_report:** MOB-APK-UNIFY-R1-QA **CLOSED** — unified APK SHA `8063446E…` installed on emulator-5554; uat.nv0001 Home has no promise rejection snackbar (D-W8-ESS-PROMISE-01 PASS); J-MOB-23/24 approve navigation PASS on attendance pending; uat.nv0002 R-DIR-DETAIL-01 list→detail→back PASS; no fatal logcat either persona.

**next_owner:** `pm`

**next_dispatch_prompt:** work_item_id MOB-APK-UNIFY-R1-QA intake PASS_TO_PM — dispatch `qc` for unified APK gate on J-MOB-23/24 + R-DIR-DETAIL-01 @ SHA `8063446E2E51528A273C79D92C6D40594DABD22126D586680194052148993BED`; evidence `docs/qa/evidence/mob-apk-unify-r1-device-20260609.md`; promote journey map R-DIR-DETAIL-01 defer if QC GO; optional residual leave UndoSnackbar if QC requires leave seed.

**evidence_path:** `docs/qa/evidence/mob-apk-unify-r1-device-20260609.md`

**ack_status:** **PASS_TO_PM**
