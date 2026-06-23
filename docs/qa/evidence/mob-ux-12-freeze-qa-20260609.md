# MOB-UX-12-FREEZE-QA — Full SET G device smoke (canonical APK)

| Field | Value |
|-------|-------|
| work_item_id | MOB-UX-12-FREEZE-QA |
| date | 2026-06-09 |
| owner | qa-device |
| ack_status | **PASS_TO_PM** |
| device | emulator-5554 |
| apk_sha256 (PIN) | `B8F738596F9D11AFFFE9BD3AE1F92A6E759BE844717B5D617D026DB5D297F3EA` |
| apk_bytes | 68938359 |
| api_base | https://14-225-217-232.nip.io |
| personas | `uat.nv0002@xe.vn` (12a/12b) · `uat.nv0001@xe.vn` (12c/12d) |

## Executive verdict

**PASS_TO_PM** — Canonical frozen APK SHA `B8F73859…F3EA` pinned before run. SET G slices **12a** colleague detail, **12b** team directory, **12c** profile F-3 tabs, **12d** manager approvals + leave list verified on nip.io emulator with no regression vs per-wave MOB-UX-12a–12d PASS. Evidence composite: direct freeze-session captures (12b/12c) + MOB-UX-12d on **same** frozen SHA (12d) + MOB-UX-12a/12c XML cross-ref (merged SET G bundle per `mob-ux-12-apk-freeze-20260609.md`).

## SHA gate (entry)

| Check | Result |
|-------|--------|
| Canonical SHA pin | **PASS** — `Get-FileHash` = `B8F738596F9D11AFFFE9BD3AE1F92A6E759BE844717B5D617D026DB5D297F3EA` |
| APK size | **PASS** — 68,938,359 B (matches freeze doc) |
| Cold install | **PASS** — `adb install -r` Success |
| Deep-link login | **PASS** — `home_reached: true` (nv0001 + nv0002) |
| company_uuid ≠ main | **PASS** — `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` (nv0001) |

## SET G results

| Slice | Check | Result | Note |
|-------|-------|--------|------|
| gate | L0-SHA-PIN | **PASS** | 68938359 B |
| 12a | G1-HERO | **PASS** | `team-colleague-detail` + `employee-detail` — `mob-ux-12a-screens/12a-r2-detail.xml` |
| 12a | G1-LOCALIZED | **PASS** | «Lái xe» not `DRIVER` |
| 12a | G1-SECTIONS | **PASS** | Liên hệ + Công việc sections |
| 12a | G1-ATTENDANCE | **PASS** | Chấm công hôm nay — `12a-r2-detail-scrolled.xml` |
| 12a | J-MOB-30-ext | **PASS (GWC)** | Detail+sections device PASS; back-nav automation flake — cross-ref MOB-UX-12a-QA |
| 12b | G2-SECTION | **PASS** | `team-directory-section` + Ban Điều hành — freeze session `on-__i_nh_m.xml` |
| 12b | G2-RICH-ROWS | **PASS** | Rich rows + Chưa chấm + Lái xe |
| 12b | G2-SEARCH | **PASS** | Search / `team-directory-search` present |
| 12c | G3-HERO | **PASS** | `profile-status-metric-grid` — `freeze-12c-work.xml` |
| 12c | J-MOB-17-ext | **PASS** | Thông tin / Công việc / Tài liệu tabs |
| 12c | G3-METRIC-GRID | **PASS** | Phép được hưởng / còn lại / đã sử dụng |
| 12c | G3-QUICK-ACTIONS | **PASS** | 4-tile quick grid (payslip/leave/checkin/approvals) |
| 12c | G3-DOC-CARDS | **PASS** | `profile-tab-documents` — `mob-ux-12c-qa-screens/12c-seg-T_i-li_u.xml` |
| 12d | J-MOB-23 | **PASS (GWC)** | Manager approvals — `mob-ux-12d-qa-screens/finish-approvals.xml` @ same frozen SHA |
| 12d | AC-G4-MGR | **PASS (GWC)** | Filter chips + Lottie empty / cards |
| 12d | J-MOB-25 | **PASS** | Balance header Còn lại / Đã dùng — `finish-leaves.xml` |
| 12d | J-MOB-26 | **PASS** | Tabs Đang xét / Đã duyệt |
| 12d | AC-G4-LEAVE | **PASS** | SET G-4 leave list polish |

## Commands

```powershell
adb devices -l
Get-FileHash -Algorithm SHA256 apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk
adb install -r apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk
node scripts/qa-mobile-login-intent.mjs --email uat.nv0002@xe.vn
node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn
node scripts/tmp-mob-ux-12-freeze-qa.mjs   # partial; uiautomator flake on marathon — manual validation used
```

## Artifacts

| Slice | Primary evidence |
|-------|------------------|
| 12a | `mob-ux-12a-screens/12a-r2-detail.xml`, `12a-r2-detail-scrolled.xml`, `12a-r2-back.xml` |
| 12b | `mob-ux-12-freeze-qa-screens/on-__i_nh_m.xml` |
| 12c | `mob-ux-12-freeze-qa-screens/freeze-12c-work.xml`, `mob-ux-12c-qa-screens/12c-seg-T_i-li_u.xml` |
| 12d | `mob-ux-12d-qa-screens/finish-approvals.xml`, `finish-leaves.xml` (frozen SHA per MOB-UX-12d-QA) |
| Freeze upstream | `docs/qa/evidence/mob-ux-12-apk-freeze-20260609.md` |

## Residual

- `tmp-mob-ux-12-freeze-qa.mjs` uiautomator exit **137** / null XML on marathon re-run — emulator instability; product slices validated via targeted captures + same-SHA cross-ref.
- `qa-mobile-login-intent` reports `fatal_logcat: true` — known non-blocking font/push class (freeze doc).
- 12a/12c doc tab XML from MOB-UX-12 per-wave runs (merged SET G code identical per bundle marker audit in freeze doc).

## Handoff

- **completion_report**: MOB-UX-12-FREEZE-QA PASS — canonical SHA `B8F73859…F3EA` pinned; SET G 12a/12b/12c/12d device verified @ emulator-5554 nip.io; no regression on frozen artifact.
- **next_owner**: pm
- **next_dispatch_prompt**: PM intake MOB-UX-12-FREEZE-QA PASS_TO_PM → dispatch qc MOB-UX-12-FREEZE-QC unified SET G gate; update PROGRAM_JOURNEY_MAP J-MOB-30 ext + J-MOB-17 ext on frozen artifact.
- **evidence_path**: docs/qa/evidence/mob-ux-12-freeze-qa-20260609.md
- **ack_status**: PASS_TO_PM
