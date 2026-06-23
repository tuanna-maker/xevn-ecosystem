# PCOMP-W8-MOB-UI-QA-01 — Full J-MOB device regression @ nip.io

| Field | Value |
|-------|-------|
| work_item_id | PCOMP-W8-MOB-UI-QA-01 |
| from_role | qa-device |
| to_role | pm |
| date | 2026-06-09 |
| ack_status | **PASS_TO_PM** |
| device | emulator-5554 |
| api_base | https://14-225-217-232.nip.io |
| apk_sha256 | `2759AE0790AA1A381DABF8CE80E4485A658A33B94AB02500529DA87C01CD65DC` |
| apk_bytes | 68863470 |
| persona_primary | uat.nv0001@xe.vn |
| persona_team | uat.nv0002@xe.vn |
| company_uuid | 6efaa5d6-a4a8-4bfd-805a-3c4f003e4013 |

## Executive verdict

**PASS_TO_PM** — Full J-MOB regression 29 PASS, 2 GWC @ nip.io emulator-5554. APK SHA verified. 4-tab + FAB + SET F calendar + profile tabs + team directory (uat.nv0002) covered.

## J-MOB regression matrix

| Journey | Verdict | Notes |
|---------|---------|-------|
| J-MOB-01 | **PASS** | login home @ uat.nv0001@xe.vn |
| 4-TAB-BAR | **PASS** | tabs visible=4/4 |
| J-MOB-06 | **PASS** | viecCanLam=true |
| J-MOB-07 | **PASS** | pending=true |
| J-MOB-08 | **PASS** | birthday=true |
| J-MOB-09 | **PASS** | whosOut=true |
| J-MOB-11 | **PASS** | bell=true |
| J-MOB-12 | **PASS** | carousel=true |
| J-MOB-13 | **PASS** | grid=true |
| J-MOB-14 | **PASS** | payslipFeed=true |
| J-MOB-15 | **PASS** | portalOrder=true |
| J-MOB-19 | **PASS** | ESS role header + stats |
| J-MOB-20 | **PASS** | pending card |
| J-MOB-21 | **PASS** | announcements |
| J-MOB-22 | **PASS** | 4 ESS cards |
| J-MOB-23 | **PASS** | leave list tabs |
| J-MOB-24 | **GWC** | inline approve — mgr-only; employee list path acceptable GWC |
| J-MOB-26 | **PASS** | My Leaves tabs |
| J-MOB-28 | **PASS** | create balance chip=true |
| J-MOB-27 | **PASS** | create CTA via + Nghỉ phép tap |
| J-MOB-25 | **PASS** | list balance |
| J-MOB-29 | **GWC** | form polish — covered by J-MOB-28 create path |
| J-MOB-02 | **PASS** | fab+checkin screen=true |
| J-MOB-17 | **PASS** | tabs=true work=true doc=true |
| J-MOB-31 | **PASS** | pending strip=true |
| J-MOB-32 | **PASS** | action grid → leave |
| J-MOB-33 | **PASS** | FAB sheet → CheckIn (ZenHR) |
| J-MOB-34 | **PASS** | hero=true net=true |
| J-MOB-35 | **PASS** | SET F calendar cal=true month=true |
| J-AVT-02 | **PASS** | picker+crop+success |
| J-MOB-30 | **PASS** | list=true detail=true persona=uat.nv0002 |

## Residual

| Item | Owner | Notes |
|------|-------|-------|
| J-MOB-24 inline mgr approve | GWC carry | Employee persona path; mgr approve covered in prior MOB-UX-11 waves |
| J-MOB-29 form polish | GWC carry | Create flow exercised via J-MOB-28; no P0 block |
| `GET /api/hrm/health` 404 | ENV | Mobile login + journeys 200; nip.io route alias — not product block |

## Environment checks

| Check | Result |
|-------|--------|
| APK SHA-256 | PASS |
| Cold install | PASS |
| API login `POST /auth/mobile/login` | PASS 201 |
| x-company-id UUID `6efaa5d6-…` | PASS (not `main`) |
| fatal logcat | PASS |
| Script exit | **0** |

## Commands

```powershell
adb devices -l
Get-FileHash apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk -Algorithm SHA256
adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile
adb -s emulator-5554 install -r apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk
node scripts/tmp-pcomp-w8-mob-ui-qa-01-device.mjs
```

Screens/XML: `docs/qa/evidence/pcomp-w8-mob-ui-qa-01-screens/`

## Handoff

- **completion_report**: PASS_TO_PM — Full J-MOB regression 29 PASS, 2 GWC @ nip.io emulator-5554. APK SHA verified. 4-tab + FAB + SET F calendar + profile tabs + team directory (uat.nv0002) covered.
- **next_owner**: pm
- **next_dispatch_prompt**: PM intake PCOMP-W8-MOB-UI-QA-01 PASS_TO_PM → dispatch qc MOB-UX-11 gate; update PROGRAM_JOURNEY_MAP device rows; evidence docs/qa/evidence/pcomp-w8-mob-ui-qa-01-device-20260609.md
- **evidence_path**: docs/qa/evidence/pcomp-w8-mob-ui-qa-01-device-20260609.md
- **ack_status**: PASS_TO_PM

