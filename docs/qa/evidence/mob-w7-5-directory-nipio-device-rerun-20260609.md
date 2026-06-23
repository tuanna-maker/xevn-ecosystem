# MOB-W7-5-DIRECTORY-QA-DEVICE-R2 — nip.io directory rows @ uat.nv0002

| Field | Value |
|-------|-------|
| work_item_id | MOB-W7-5-DIRECTORY-QA-DEVICE-R2 |
| date | 2026-06-09 |
| owner | qa-device |
| ack_status | **PASS_TO_PM** |
| device | emulator-5554 |
| apk_sha256 | `94DCCD5BC08DD71EE0339C5401487F88BCB5CAC9A84ED74E678EAB8FF5F4F2B7` |
| api_base | https://14-225-217-232.nip.io |
| persona | uat.nv0002@xe.vn |
| company_slug | trsport |
| company_uuid | 32a3cdcb-c534-4e47-80f9-d2f156e65094 |
| upstream | D-MOB-W7-5-DIRECTORY-DEPLOY-01 PASS |

## GWC-DIR-ROWS-01 — populated directory @ nip.io

| Check | Result |
|-------|--------|
| APK install (SHA verified) | PASS |
| API probe view=directory total=207 | PASS |
| x-company-id ≠ main | PASS |
| Tab Đội nhóm non-empty list | PASS |
| Search + filter chips | PASS |
| Row attendance badges | PASS |
| Tap row → detail | **DEFER** (display-only row; bounds tap no nav — out of GWC-DIR-ROWS-01) |
| logcat HRM-VAL-001 | **absent** |
| GWC-DIR-ROWS-01 | **CLOSED** |

## UI metrics (emulator-5554)

| Metric | Value |
|--------|-------|
| Visible rows (`team-directory-row-*`) | 14 |
| Attendance badges (`*-badge`) | 7 |
| Filter chips (Tất cả / Đã chấm / Chưa chấm) | present, counts > 0 |
| Empty state | absent |
| Login method | ui_login (`uat.nv0002@xe.vn`) |

## API probe (pre-device)

```json
{
  "directoryStatus": 200,
  "directoryCode": "HRM-EMP-DIR-200",
  "directoryTotal": 207,
  "sampleCount": 10,
  "firstAttendance": {
    "checked_in": false,
    "check_in_at": null,
    "status": null
  },
  "detailOk": true,
  "detailCode": "HRM-EMP-200",
  "xCompanyId": "32a3cdcb-c534-4e47-80f9-d2f156e65094"
}
```

## Commands

```bash
adb devices -l
Get-FileHash apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk -Algorithm SHA256
adb shell pm clear vn.xevn.hrm.mobile
adb -s emulator-5554 install -r apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk
HRM_MOBILE_EMAIL=uat.nv0002@xe.vn node scripts/tmp-mob-w7-5-directory-probe.mjs
node scripts/tmp-mob-w7-5-directory-qa-device.mjs
```

Screenshots: `docs/qa/evidence/mob-w7-5-directory-screens/`

## Handoff

- **completion_report**: GWC-DIR-ROWS-01 **CLOSED**. page_size-fix APK SHA `94DCCD5B…` installed on emulator-5554; nip.io probe total=207 (trsport); UI login PASS; Đội nhóm tab shows 14 rows + 7 attendance badges + filter chips with counts >0; scope header UUID (not `main`); no HRM-VAL-001 in logcat. Residual deferred: row→detail navigation (`TeamDirectoryRow` display-only).
- **next_owner**: pm
- **next_dispatch_prompt**: PM → QC: work_item_id MOB-W7-5-DIRECTORY-QA-DEVICE-R2 PASS; GWC-DIR-ROWS-01 CLOSED on J-MOB-30; evidence docs/qa/evidence/mob-w7-5-directory-nipio-device-rerun-20260609.md; update PROGRAM_JOURNEY_MAP.
- **evidence_path**: docs/qa/evidence/mob-w7-5-directory-nipio-device-rerun-20260609.md

