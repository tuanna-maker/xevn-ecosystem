# MOB-UX-08-TEAM-QA — Device L2.5 (J-MOB-30)

| Field | Value |
|-------|-------|
| work_item_id | MOB-UX-08-TEAM-QA |
| date | 2026-06-09 |
| owner | qa-device |
| ack_status | **PASS_TO_PM** |
| device | emulator-5554 |
| apk_sha256 | `A0D5510B29DBF72676B9E05D50AC63B191FF0857671027EA8C71322AE8B0FEC9` |
| api_base | https://14-225-217-232.nip.io |
| persona | uat.nv0001@xe.vn |
| company_uuid | 6efaa5d6-a4a8-4bfd-805a-3c4f003e4013 |

## J-MOB-30 Team directory

| Check | Result |
|-------|--------|
| Tab Đội nhóm | PASS |
| Search + filter chips + date hint | PASS |
| Search no-match filter | PASS |
| Row badges / empty state | PASS |
| API probe | view=directory 400/HRM-VAL-001; stdTotal=213 |

## Regression

| Journey | Result |
|---------|--------|
| J-MOB-02 | PASS |
| J-MOB-31 | PASS |
| J-MOB-33 | PASS |
| J-MOB-06 | PASS |
| J-MOB-07 | PASS |
| J-MOB-08 | PASS |
| J-MOB-09 | PASS |
| J-MOB-11 | PASS |
| J-MOB-12 | PASS |
| J-MOB-13 | PASS |
| J-MOB-14 | PASS |
| J-MOB-15 | PASS |

## Commands

```bash
adb devices -l
adb shell pm clear vn.xevn.hrm.mobile
adb install -r apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk
node scripts/tmp-mob-ux-08-team-qa-device.mjs
```

Screenshots: `docs/qa/evidence/mob-ux-08-team-screens/`

## Handoff

- **completion_report**: J-MOB-30 team directory PASS on uat.nv0001@xe.vn: Đội nhóm tab, search, filter chips, row badges/empty; J-MOB-02/31/33 FAB + J-MOB-06..15 regression PASS. APK SHA verified.
- **next_owner**: pm
- **next_dispatch_prompt**: PM → QC: work_item_id MOB-UX-08-TEAM-QA device PASS; gate J-MOB-30 on docs/qa/evidence/mob-ux-08-team-qa-device-20260609.md; update PROGRAM_JOURNEY_MAP J-MOB-30 ✅.
- **evidence_path**: docs/qa/evidence/mob-ux-08-team-qa-device-20260609.md

