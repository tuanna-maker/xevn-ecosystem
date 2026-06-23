# R-DIR-DETAIL-01-QA — Team directory row → colleague detail (device)

| Field | Value |
|-------|-------|
| **work_item_id** | `R-DIR-DETAIL-01-QA` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **ack_status** | **PASS_TO_PM** |
| **device** | `emulator-5554` |
| **api_base** | `https://14-225-217-232.nip.io` |
| **account** | `uat.nv0002@xe.vn` / `xevn-uat-2026` |
| **company_slug** | `trsport` |
| **journey** | J-MOB-30 extension — `TeamColleagueDetailScreen` |

work_item_id: `R-DIR-DETAIL-01-QA`  
ack_status: **PASS_TO_PM**

---

## Executive verdict

**PASS_TO_PM** — Release qa-device APK (SHA `8063446E…`) on `emulator-5554` @ nip.io. Login deep-link **PASS**. Tab **Đội nhóm** → row tap → **Thông tin nhân viên** detail with **Phòng ban** / **Chức danh** fields **PASS**. Hardware back preserves search bar + filter chips (**Tất cả** / **Đã chấm**) **PASS**.

| AC | Verdict | Evidence |
|----|---------|----------|
| APK install + SHA match | **PASS** | `8063446E2E51528A273C79D92C6D40594DABD22126D586680194052148993BED` |
| Login `uat.nv0002@xe.vn` trsport | **PASS** | `home_reached=true` |
| Đội nhóm list loads | **PASS** | `team-directory-screen`, `team-directory-row-0` |
| Row tap → detail screen | **PASS** | `team-colleague-detail`, title **Thông tin nhân viên** |
| Detail fields (Phòng ban, Chức danh) | **PASS** | CNTT / HR SPECIALIST on row 0 (Bùi Ngọc An) |
| Back preserves chips + search | **PASS** | `team-directory-search`, **Tất cả**, **Đã chấm** on `rdir-back.xml` |

---

## APK verification

| Check | Result |
|-------|--------|
| Path | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| Bytes | **68,849,340** |
| SHA-256 | `8063446E2E51528A273C79D92C6D40594DABD22126D586680194052148993BED` |
| `adb -s emulator-5554 install -r` | exit **0** — Success |

---

## Commands

```powershell
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
$apk = "apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk"

Get-FileHash $apk -Algorithm SHA256
& $adb devices -l
& $adb -s emulator-5554 install -r $apk

node scripts/qa-mobile-login-intent.mjs --email uat.nv0002@xe.vn --password xevn-uat-2026
# exit 0 — home_reached=true, api_base=https://14-225-217-232.nip.io

node scripts/tmp-r-dir-detail-01-smoke.mjs
# exit 0 — see machine JSON below
```

---

## Device smoke (machine JSON)

```json
{
  "work_item_id": "R-DIR-DETAIL-01",
  "email": "uat.nv0002@xe.vn",
  "company_slug": "trsport",
  "home_reached": true,
  "list_screen": true,
  "detail_pass": true,
  "detail_note": "detail screen opened",
  "back_search_preserved": true,
  "back_chips_preserved": true,
  "ack_status": "READY_FOR_QA"
}
```

Script exit code: **0**

---

## UI audit (detail screen — `rdir-detail.xml`)

| Element | Value |
|---------|-------|
| `resource-id` | `team-colleague-detail` / `employee-detail` |
| Header title | **Thông tin nhân viên** |
| Employee | Bùi Ngọc An (VTH-0107) |
| Phòng ban | CNTT |
| Chức danh | HR SPECIALIST |
| Attendance badge | Chưa chấm |
| Email (masked) | u***@xe.vn |

---

## Screenshot manifest (read-only module — J-MOB-30 ext)

| Step | PNG (repo path) | XML (repo path) | git |
|------|-----------------|-----------------|-----|
| Home (post login) | `docs/qa/evidence/r-dir-detail-01-screens/rdir-01-home.png` | `r-dir-detail-01-screens/rdir-home.xml` | `git add` required |
| Đội nhóm list | `docs/qa/evidence/r-dir-detail-01-screens/rdir-02-list.png` | `r-dir-detail-01-screens/rdir-list.xml` | `git add` required |
| Colleague detail | `docs/qa/evidence/r-dir-detail-01-screens/rdir-03-detail.png` | `r-dir-detail-01-screens/rdir-detail.xml` | `git add` required |
| Back → list (chips) | `docs/qa/evidence/r-dir-detail-01-screens/rdir-04-back.png` | `r-dir-detail-01-screens/rdir-back.xml` | `git add` required |

Full inventory: [`r-dir-detail-01-screens/MANIFEST.md`](r-dir-detail-01-screens/MANIFEST.md). Standard: `docs/qa/QA_DEVICE_SCREENSHOT_STANDARD.md`.

---

## Residual

- None blocking R-DIR-DETAIL-01 device slice.
- Manager phone/email masking follows BE directory policy (ESS viewer sees masked email) — expected.

---

## Handoff

- **completion_report**: R-DIR-DETAIL-01-QA **PASS** on emulator-5554. APK SHA `8063446E…` installed. `uat.nv0002@xe.vn` / trsport: Đội nhóm → row 0 tap → **Thông tin nhân viên** with Phòng ban/Chức danh; back preserves search + filter chips. Smoke script exit 0; screenshots + XML captured.
- **next_owner**: `pm`
- **next_dispatch_prompt**: work_item_id R-DIR-DETAIL-01-QC — promote J-MOB-30 row→detail slice on `PROGRAM_JOURNEY_MAP.md`; dispatch `qc` scoped gate for R-DIR-DETAIL-01 with evidence `docs/qa/evidence/r-dir-detail-01-qa-device-20260609.md`; close defer **R-DIR-DETAIL-01** from `qc-mob-w7-5-directory-final-20260609.md` if still OPEN.
- **evidence_path**: `docs/qa/evidence/r-dir-detail-01-qa-device-20260609.md`
- **ack_status**: **PASS_TO_PM**
