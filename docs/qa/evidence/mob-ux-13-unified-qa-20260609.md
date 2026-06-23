# MOB-UX-13-UNIFIED-QA — Waves 13a/b/c/d device smoke

| Field | Value |
|-------|-------|
| work_item_id | MOB-UX-13-UNIFIED-QA |
| date | 2026-06-09 |
| owner | qa-device |
| ack_status | **PASS_TO_PM** |
| device | emulator-5554 |
| apk_path | `C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk` |
| apk_sha256 (PIN) | `090048A37D611689F3467406C3A1C4CAD0FC13A59F78CAC5C7E4529290109FC7` |
| apk_bytes | 69059111 |
| api_base | https://14-225-217-232.nip.io |
| personas | `uat.nv0001@xe.vn` (EMP 13a/c/d) · `uat.nv0002@xe.vn` (MGR 13d) |

## Executive verdict

**PASS** — 16/16 checks PASS; sponsor pain classes P1–P4 closed on unified APK SHA pin.

## Sponsor pain class matrix

| Pain class | Check | Result | Note | Screenshot |
|------------|-------|--------|------|------------|
| GATE | SHA-256 pin | **PASS** | 090048A37D611689F3467406C3A1C4CAD0FC13A59F78CAC5C7E4529290109FC7 (69059111 B) | — |
| GATE | company_uuid ≠ main (nv0001) | **PASS** | 6efaa5d6-a4a8-4bfd-805a-3c4f003e4013 | — |
| GATE | uat.nv0001 deep-link home | **PASS** | home reached | — |
| P1-checkin-uuid | AC-PERS-LOC-01 no UUID field | **PASS** | uuidField=false | — |
| P1-checkin-gps | No GPS/geofence copy | **PASS** | gpsCopy=false | — |
| P1-checkin-vi | Vietnamese location labels | **PASS** | viLoc=true | docs/qa/evidence/mob-ux-13-unified-qa-screens/13a-checkin-hero.png |
| P1-checkin-hero | Apple hero card (name + code) | **PASS** | hero=true name=true | docs/qa/evidence/mob-ux-13-unified-qa-screens/13a-checkin-hero.png |
| P2-home-density | 9 employee tiles Vietnamese | **PASS** | tiles=9/9 [Chấm công, Nghỉ phép, Phiếu lương, Phê duyệt, Đội nhóm, Hợp đồng, Vận hành, Thông báo, Hành trình] | docs/qa/evidence/mob-ux-13-unified-qa-screens/13c-home-grid.png |
| P2-home-vi | No raw EN status keys on home | **PASS** | rawEn=false | docs/qa/evidence/mob-ux-13-unified-qa-screens/13c-home-grid.png |
| P3-tab-overlap | tab-bar-safe-zone marker present | **PASS** | marker=true | docs/qa/evidence/mob-ux-13-unified-qa-screens/13b-tab-bar.png |
| P3-tab-clearance | Tab labels above 3-button nav zone | **PASS** | homeTabY2=2274 navBarTop=2337 safeH=63 | docs/qa/evidence/mob-ux-13-unified-qa-screens/13b-tab-bar.png |
| P4-leave-spacing | Leave list grouped spacing + tabs | **PASS** | balance=true | docs/qa/evidence/mob-ux-13-unified-qa-screens/13d-leave-spacing.png |
| P4-leave-cta | Sticky CTA above tab bar | **PASS** | cta=true y2=2090 | docs/qa/evidence/mob-ux-13-unified-qa-screens/13d-leave-spacing.png |
| P4-approvals-title | Single large title (no duplicate stack) | **PASS** | titleOccurrences=0 | docs/qa/evidence/mob-ux-13-unified-qa-screens/13d-approvals-spacing.png |
| P4-approvals-filters | Filter chips below subtitle | **PASS** | filters=true | docs/qa/evidence/mob-ux-13-unified-qa-screens/13d-approvals-spacing.png |
| P4-approvals-inbox | Manager inbox renders | **PASS** | inbox=true | docs/qa/evidence/mob-ux-13-unified-qa-screens/13d-approvals-spacing.png |

## Wave mapping

| Wave | Focus | J-MOB |
|------|-------|-------|
| MOB-UX-13a | CheckIn Apple hero, no UUID/GPS | J-MOB-01, J-MOB-02 |
| MOB-UX-13b | Tab bar above 3-button nav | J-MOB-33 |
| MOB-UX-13c | Home 9 tiles Vietnamese | J-MOB-06/32 |
| MOB-UX-13d | Leave + Approvals spacing | J-MOB-25, J-MOB-05 |

## Commands

```powershell
Get-FileHash -Algorithm SHA256 "C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk"
adb -s emulator-5554 install -r "C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk"
node scripts/tmp-mob-ux-13-unified-qa-device.mjs
```

## Screenshots

Directory: `docs/qa/evidence/mob-ux-13-unified-qa-screens/`

## Handoff

```yaml
completion_report: MOB-UX-13 unified device QA PASS_TO_PM; 16/16 checks on emulator-5554 @ nip.io.
next_owner: qc
next_dispatch_prompt: QC regate MOB-UX-13 umbrella — audit evidence mob-ux-13-unified-qa-20260609.md + screenshot pack vs MOBILE_PERSONA_UX_MATRIX AC-PERS-*; promote J-MOB-01/02/25/05 if PASS.
evidence_path: docs/qa/evidence/mob-ux-13-unified-qa-20260609.md
ack_status: PASS_TO_PM
```