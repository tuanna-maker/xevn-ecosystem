# MOB-PHASE1-DEVICE-BATCH — Mobile Phase 1 unified device QA

| Field | Value |
|-------|-------|
| work_item_id | MOB-PHASE1-DEVICE-BATCH |
| from_role | qa-device |
| to_role | pm |
| date | 2026-06-09 |
| ack_status | **FAIL** |
| device | emulator-5554 |
| apk_path | `C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk` |
| apk_sha256 | `C152EDD6B093871CCA59EE8AF60C65B3C1B615A53C82675DE1E078E240B412BE` |
| apk_bytes | 69132861 |
| api_base | https://14-225-217-232.nip.io |
| personas | `uat.nv0001@xe.vn` (EMP) · `uat.nv0002@xe.vn` (MGR) |

## Executive verdict

**FAIL** — 8 check(s) FAIL; see journey matrix and pm_dispatch_hint.

## Slice summary

| Slice | Journeys | Pass | Fail |
|-------|----------|------|------|
| MOB-UX-13e | J-MOB-36, J-MOB-37, J-MOB-38 | 2 | 4 |
| MOB-UX-13f | J-MOB-23, J-MOB-24, J-MOB-25, J-MOB-26 | 2 | 2 |
| MOB-UX-13g | J-MOB-culture, J-MOB-journey | 2 | 1 |
| MOB-UX-14-R5 | J-MOB-11, J-MOB-19, J-MOB-14e | 5 | 0 |
| MOB-UX-15a | J-MOB-13-ext | 3 | 0 |
| MOB-UX-14d | J-MOB-14d | 0 | 1 |

## Journey matrix

| Slice | J-ID | Check | Result | Note | Screenshot |
|-------|------|-------|--------|------|------------|
| GATE | GATE | nip.io API login nv0001/nv0002 | **PASS** | uuid=6efaa5d6… | — |
| GATE | GATE | company_uuid ≠ main | **PASS** | 6efaa5d6-a4a8-4bfd-805a-3c4f003e4013 | — |
| GATE | GATE | No x-company-id:main in logcat | **PASS** | main=false | — |
| MOB-UX-13e | J-MOB-36 | EMP no manager/leader hero | **PASS** | mgr=false | docs/qa/evidence/mob-phase1-device-batch-screens/13e-jmob36-emp-home.png |
| MOB-UX-13e | J-MOB-36 | Việc cần làm section present | **FAIL** | tasks=false | docs/qa/evidence/mob-phase1-device-batch-screens/13e-jmob36-emp-home.png |
| MOB-UX-13e | J-MOB-36 | Tasks before action grid | **FAIL** | order tasks@-1 grid@9887 | docs/qa/evidence/mob-phase1-device-batch-screens/13e-jmob36-emp-home.png |
| MOB-UX-13e | J-MOB-37 | MGR inbox hero or pending strip | **FAIL** | hero=false | docs/qa/evidence/mob-phase1-device-batch-screens/13e-jmob37-mgr-home.png |
| MOB-UX-13e | J-MOB-37 | Approve tile Duyệt/Phê duyệt | **PASS** | duyet=true | docs/qa/evidence/mob-phase1-device-batch-screens/13e-jmob37-mgr-home.png |
| MOB-UX-13e | J-MOB-38 | LDR ceo@xe.vn mobile login | **FAIL** | HRM-AUTH-401 — R-13E-01 BLOCKED-EXTERNAL | — |
| MOB-UX-13f | J-MOB-23 | Manager approvals inbox loads | **PASS** | pending=true | docs/qa/evidence/mob-phase1-device-batch-screens/13f-jmob23-approvals.png |
| MOB-UX-13f | J-MOB-24 | Swipe reveals Duyệt/Từ chối | **FAIL** | swipe=false | docs/qa/evidence/mob-phase1-device-batch-screens/13f-jmob23-approvals.png |
| MOB-UX-13f | J-MOB-25 | My Leaves balance/tabs | **PASS** | tabs=false | docs/qa/evidence/mob-phase1-device-batch-screens/13f-jmob25-26-leaves.png |
| MOB-UX-13f | J-MOB-26 | Swipe leave row actions | **FAIL** | swipe=false | docs/qa/evidence/mob-phase1-device-batch-screens/13f-jmob25-26-leaves.png |
| MOB-UX-13g | J-MOB-culture | Culture strip on Home | **FAIL** | culture=false | docs/qa/evidence/mob-phase1-device-batch-screens/13g-culture-journey.png |
| MOB-UX-13g | J-MOB-journey | Journey timeline card (no stub) | **PASS** | card=true stub=false | docs/qa/evidence/mob-phase1-device-batch-screens/13g-culture-journey.png |
| MOB-UX-13g | J-MOB-journey | JourneyScreen navigation | **PASS** | screen=true | docs/qa/evidence/mob-phase1-device-batch-screens/13g-culture-journey.png |
| MOB-UX-14-R5 | J-MOB-11 | home-actions-carousel above fold | **PASS** | carousel=true | docs/qa/evidence/mob-phase1-device-batch-screens/14-r5-home-412.png |
| MOB-UX-14-R5 | J-MOB-11 | 4-col grid tiles visible | **PASS** | checkin=true approve=true | docs/qa/evidence/mob-phase1-device-batch-screens/14-r5-home-412.png |
| MOB-UX-14-R5 | J-MOB-19 | ESS stat rows hydrate | **PASS** | stats=true | docs/qa/evidence/mob-phase1-device-batch-screens/14-r5-home-412.png |
| MOB-UX-14-R5 | J-MOB-14e | Vietnamese display name | **PASS** | name=Nguyễn Văn An | docs/qa/evidence/mob-phase1-device-batch-screens/14-r5-home-412.png |
| MOB-UX-14-R5 | J-MOB-14e | No raw holding/main slug | **PASS** | slug=false | docs/qa/evidence/mob-phase1-device-batch-screens/14-r5-home-412.png |
| MOB-UX-15a | J-MOB-13-ext | Stack title Thông báo only | **PASS** | uc=false | docs/qa/evidence/mob-phase1-device-batch-screens/15a-notifications.png |
| MOB-UX-15a | J-MOB-13-ext | No raw event_type / ISO / Socket debug | **PASS** | raw=false iso=false | docs/qa/evidence/mob-phase1-device-batch-screens/15a-notifications.png |
| MOB-UX-15a | J-MOB-13-ext | Chưa đọc badge + Vietnamese rows | **PASS** | badge=true vi=true | docs/qa/evidence/mob-phase1-device-batch-screens/15a-notifications.png |
| MOB-UX-14d | J-MOB-14d | Responsive matrix all widths | **FAIL** | iphone-se:true, iphone-14-pro-max:false, pixel-4a:false, pixel-7:true, ipad-mini:false | docs/qa/evidence/mob-ux-14d-matrix-20260609.md |

## Commands

```powershell
Get-FileHash -Algorithm SHA256 "C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk"
adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile
adb -s emulator-5554 install -r "C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk"
install: OK
node scripts/tmp-mob-phase1-device-batch.mjs
```

## Artifacts

- Screens: `docs/qa/evidence/mob-phase1-device-batch-screens/`
- JSON: `docs/qa/evidence/mob-phase1-device-batch-20260609.json`

## Handoff

```yaml
completion_report: MOB-PHASE1-DEVICE-BATCH FAIL — 17/25 device checks @ nip.io; APK SHA C152EDD6B093…; residual: J-MOB-36: tasks=false; J-MOB-36: order tasks@-1 grid@9887; J-MOB-37: hero=false; J-MOB-38: HRM-AUTH-401 — R-13E-01 BLOCKED-EXTERNAL; J-MOB-24: swipe=false; J-MOB-26: swipe=false; J-MOB-culture: culture=false; J-MOB-14d: iphone-se:true, iphone-14-pro-max:false, pixel-4a:false, pixel-7:true, ipad-mini:false.
next_owner: pm
next_dispatch_prompt: PM dispatch residual owners — J-MOB-36: tasks=false; J-MOB-36: order tasks@-1 grid@9887; J-MOB-37: hero=false; J-MOB-38: HRM-AUTH-401 — R-13E-01 BLOCKED-EXTERNAL; J-MOB-24: swipe=false; J-MOB-26: swipe=false; J-MOB-culture: culture=false; J-MOB-14d: iphone-se:true, iphone-14-pro-max:false, pixel-4a:false, pixel-7:true, ipad-mini:false; MOB-UX-14-R5 dev-mobile if 14d scrollDepth FAIL; R-13E-01 devops ceo mobile seed for J-MOB-38.
evidence_path: docs/qa/evidence/mob-phase1-device-batch-20260609.md
pm_dispatch_hint: MOB-UX-13e/J-MOB-36, MOB-UX-13e/J-MOB-36, MOB-UX-13e/J-MOB-37, MOB-UX-13e/J-MOB-38, MOB-UX-13f/J-MOB-24, MOB-UX-13f/J-MOB-26, MOB-UX-13g/J-MOB-culture, MOB-UX-14d/J-MOB-14d
ack_status: FAIL
```