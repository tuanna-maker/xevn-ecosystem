# MOB-UX-09-PROFILE-TABS-QA — Device L2.5 (Profile segmented tabs)

| Field | Value |
|-------|-------|
| work_item_id | MOB-UX-09-PROFILE-TABS-QA |
| date | 2026-06-09 |
| owner | qa-device |
| ack_status | **PASS_TO_PM** |
| device | emulator-5554 (API 13) |
| apk_path | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| apk_bytes | 68,862,131 |
| apk_sha256 | `667E4E9B009B91E499FA8A0565D1AE3D88EA031BDE6D09DAA0AEEF766D761D8B` |
| api_base | https://14-225-217-232.nip.io |
| persona | uat.nv0001@xe.vn / xevn-uat-2026 |
| company_uuid | 6efaa5d6-a4a8-4bfd-805a-3c4f003e4013 (≠ `main`) |
| journey | J-MOB-17 (ESS profile) |
| dev_handoff | `docs/qa/evidence/mob-ux-09-profile-tabs-20260609.md` |

## Profile segmented tabs (MOB-UX-09)

| Check | Result |
|-------|--------|
| Tab **Thêm** → **Hồ sơ** navigation | **PASS** |
| Segmented control **Thông tin / Công việc / Tài liệu** visible | **PASS** |
| `profile-tab-bar` / `profile-screen` present | **PASS** |
| **Thông tin** — Ảnh đại diện, Liên hệ, Cập nhật hồ sơ | **PASS** |
| **Công việc** — job sections; no raw `engineer`/`active` codes | **PASS** |
| **Tài liệu** — payslip/contract or empty state; no ISO timestamps | **PASS** |
| No raw ISO dates on profile UI | **PASS** |

## Regression

| Journey | Result | Notes |
|---------|--------|-------|
| J-AVT-02 | **PASS** | `profile-avatar-pick` → native gallery picker opens |
| J-MOB-30 | **PASS** | Tab Đội nhóm → directory screen + search/chips |

## Commands

```bash
adb -s emulator-5554 devices -l
Get-FileHash apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk -Algorithm SHA256
adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile
adb -s emulator-5554 install -r apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk
node scripts/tmp-mob-ux-09-profile-tabs-qa-device.mjs
```

| Step | Exit |
|------|------|
| APK SHA verify | **0** (matches expected) |
| `adb install -r` | **0** |
| Device script | **0** — `verdict: PASS` |
| `fatal_logcat` | **false** |

## Evidence artifacts

- Machine JSON: `docs/qa/evidence/mob-ux-09-profile-tabs-qa-20260609.json`
- UI dumps: `docs/qa/evidence/mob-ux-09-profile-tabs-screens/` (`profile-screen-main.xml`, `profile-tab-info.xml`, `profile-tab-work.xml`, `profile-tab-documents.xml`, `avt-reg-picker.xml`, `team-reg-directory.xml`)

## Residual

| Item | Owner | Notes |
|------|-------|-------|
| MOB-UX-09 root tab IA (Phiếu lương relabel) | dev-mobile backlog | Out of scope this QA wave |
| Documents tab deep link → PayslipDetail | optional polish | Display-only rows acceptable per dev handoff |
| Manager persona task card | QA future | uat.nv0001 employee slice primary |

## Handoff

- **completion_report:** MOB-UX-09-PROFILE-TABS-QA **PASS** on emulator-5554 @ nip.io with APK SHA `667E4E9B…761D8B`. Profile **Hồ sơ** shows segmented tabs Thông tin/Công việc/Tài liệu with grouped content per tab; no raw ISO/seed codes. J-AVT-02 avatar picker regression PASS. J-MOB-30 team directory smoke PASS.
- **next_owner:** pm
- **next_dispatch_prompt:** PM → QC: work_item_id MOB-UX-09-PROFILE-TABS-QA device PASS; gate J-MOB-17 profile tabs on `docs/qa/evidence/mob-ux-09-profile-tabs-qa-20260609.md`; update PROGRAM_JOURNEY_MAP J-MOB-17 ✅ if not already; chain MOB-UX-09 root tab IA backlog if PM scopes.
- **evidence_path:** docs/qa/evidence/mob-ux-09-profile-tabs-qa-20260609.md
- **ack_status:** PASS_TO_PM
