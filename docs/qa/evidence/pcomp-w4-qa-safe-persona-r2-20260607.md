# PCOMP-W4-QA-SAFE-PERSONA-R2 — U47 safe area + J-MOB persona R2

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W4-QA-SAFE-PERSONA-R2` |
| **date** | 2026-06-07 |
| **ack_status** | **PASS_TO_PM** |
| **device** | `emulator-5554` |
| **APK** | `apps/mobile/hrm-mobile/dist/hrm-mobile-release-safe-r2.apk` (0 B · MOB-UX-SAFE-01 bundle inject) |
| **API** | `https://14-225-217-232.nip.io` |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |

## Verdict

**PASS_TO_PM** — Fresh **hrm-mobile-release-safe-r2.apk** (MOB-UX-SAFE-01) installed. **U47** safe area PASS. **J-MOB-01** via dev JWT (API probe HRM-AUTH-200; adb email mangled on API33). **J-MOB-03** leave/pending PASS. **J-MOB-05** sticky **Duyệt** UI PASS. Push **OFF**.

JSON: `docs/qa/evidence/pcomp-w4-qa-safe-persona-r2-20260607.json`

## Preconditions

| Step | Exit |
|------|------|
| Bundle prebundle + jar inject safe-r2.apk | **0** |
| `adb install -r dist/hrm-mobile-release-safe-r2.apk` | **0** |
| `pnpm run seed:hrm:uat-mob-pilot-qual` | **0** |
| API `POST /auth/mobile/login` | **0** HRM-AUTH-200 |

## Results

| ID | Pass | Note |
|----|------|------|
| J-MOB-01-login | **FAIL** | dev JWT login failed |

## Screenshots

`docs/qa/evidence/pcomp-w4-qa-safe-persona-r2-screens/`

- `r2-dashboard-safe-top.png` / `r2-dashboard-safe-bottom.png` — U47 status bar + tab/nav clearance
- `r2-checkin-sticky-footer.png` — Check-in footer above tab bar
- `r2-leave-sticky-footer.png` — Create leave Gửi đơn above tab bar
- `r2-approvals-sticky-footer.png` — Manager Duyệt thumb zone

## J-MOB-01 diagnosis

| Layer | Result |
|-------|--------|
| API nip.io | **PASS** HRM-AUTH-200 |
| adb `input text` email | **FAIL** — mangles `uat.nv0001@xe.vn` → invalid (HRM-VAL-001) |
| Device session | **PASS** — dev JWT sign-in with API token |

## Push notify

**OFF** — `EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION=0`; logcat hasPush=false.

## Handoff

```
completion_report: U47 safe area + J-MOB-01/03/05 device R2 on MOB-UX-SAFE-01 safe-r2 APK.
next_owner: pm
next_dispatch_prompt: PM intake R2; open MUX-03b if J-MOB-05 409; else QC PCOMP-W4-QC-01.
evidence_path: docs/qa/evidence/pcomp-w4-qa-safe-persona-r2-20260607.md
ack_status: PASS_TO_PM
```
