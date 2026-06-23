# MOB-W7-5-DIRECTORY-QA-DEVICE — nip.io directory rows @ uat.nv0002

| Field | Value |
|-------|-------|
| work_item_id | MOB-W7-5-DIRECTORY-QA-DEVICE |
| date | 2026-06-09 |
| owner | qa-device |
| ack_status | **FAIL** |
| device | emulator-5554 |
| apk_sha256 | `A0D5510B29DBF72676B9E05D50AC63B191FF0857671027EA8C71322AE8B0FEC9` |
| api_base | https://14-225-217-232.nip.io |
| persona | uat.nv0002@xe.vn |
| company_slug | trsport |
| company_uuid | 32a3cdcb-c534-4e47-80f9-d2f156e65094 |
| upstream | D-MOB-W7-5-DIRECTORY-DEPLOY-01 PASS |

## GWC-DIR-ROWS-01 — populated directory @ nip.io

| Check | Result |
|-------|--------|
| APK install (SHA verified) | FAIL |
| API probe view=directory total=207 | PASS |
| x-company-id ≠ main | PASS |
| Tab Đội nhóm non-empty list | PASS |
| Search + filter chips | PASS |
| Row attendance badges | PASS |
| Tap row → detail | FAIL |

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

- **completion_report**: MOB-W7-5 directory device FAIL — see JSON; apiTotal=207 uiRows=14
- **next_owner**: dev-mobile
- **next_dispatch_prompt**: Fix directory rows/badges per mob-w7-5-directory-nipio-device-20260609.json; qa-device retest MOB-W7-5-DIRECTORY-QA-DEVICE.
- **evidence_path**: docs/qa/evidence/mob-w7-5-directory-nipio-device-20260609.md

