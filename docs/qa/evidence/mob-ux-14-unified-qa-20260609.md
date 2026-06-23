# MOB-UX-14-UNIFIED-QA — Home responsive device verification

| Field | Value |
|-------|-------|
| work_item_id | MOB-UX-14-UNIFIED-QA |
| date | 2026-06-09 |
| owner | qa-device |
| ack_status | **FAIL** |
| device | emulator-5554 (1080×2400 after scroll probe) |
| apk_path | `C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk` |
| apk_sha256 (PIN) | `03AC2D1EEF3FE7594DEE347A54070EE0AE7C3A19845F747749A38FE26F21AE19` |
| apk_bytes | 69119313 |
| api_base | https://14-225-217-232.nip.io |
| persona | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| api_full_name | Nguyễn Văn An |
| api_company_uuid | 6efaa5d6-a4a8-4bfd-805a-3c4f003e4013 |

## Executive verdict

**FAIL** — 14e + 14c sponsor defects **closed** on device; **14a 4-col quick grid absent** and **14b «Hoạt động» hub not rendered** on bundled APK. Automated first pass false-FAIL due to skeleton timing — manual scroll XML (`14-scroll.xml`) is authoritative.

## Sponsor screenshot comparison

| Sponsor defect (2026-06-09) | Before | After (device) | Result |
|----------------------------|--------|----------------|--------|
| Top white gap above blue header | White strip above header | Header block starts y=0; avatar y≈133 on 1080dp | **PASS** — `14-scroll.png` |
| Raw «holding» + «bạn» | Slug + generic greeting | **Tập đoàn XeVN** + **Nguyễn Văn An** | **PASS** — `14-scroll.png` |
| 3-col grid with empty gutter | 3 tiles/row | **Quick-access grid not rendered** (no `home-actions-carousel`, no Chấm công tile) | **FAIL** |
| Tall centered stat cards | 2×2 big numbers | **EssStatRow** label-left / value-right (`home-ess-stat-rows`) | **PASS** — `14-scroll.png` |
| Excessive scroll (6+ expandables) | Long scroll before stats | Welcome + Pulse still inline; **no `home-activity-trigger`** | **FAIL** (14b) |

## Check matrix

| Wave | Check | Result | Note | Screenshot |
|------|-------|--------|------|------------|
| GATE | SHA-256 pin (MOB-UX-14a build) | **PASS** | `03AC2D1E…` | — |
| GATE | adb install -r | **PASS** | exit 0 Success | — |
| GATE | nip.io API login | **PASS** | full_name=Nguyễn Văn An | — |
| GATE | company_uuid ≠ main | **PASS** | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` | — |
| GATE | Deep-link home reached | **PASS** | home markers found | — |
| 14e | Company label = Tập đoàn XeVN | **PASS** | text in header | `14-scroll.png` |
| 14e | No raw slug holding/main | **PASS** | no slug text | `14-scroll.png` |
| 14e | No generic «bạn» greeting | **PASS** | real name shown | `14-scroll.png` |
| 14e | Display name from HRM profile | **PASS** | Nguyễn Văn An | `14-scroll.png` |
| 14a | 4-col action grid (row 1) | **FAIL** | no `home-actions-carousel`; section order shows welcome→pulse before stats; zero Chấm công/Nghỉ phép tiles in `14-scroll.xml` | `14-scroll.png` |
| 14a | No top white gap | **PASS** | header bounds y1=0 | `14-scroll.png` |
| 14a | Compact tiles ≤100dp | **N/A** | grid absent | — |
| 14c | home-ess-stat-rows container | **PASS** | `resource-id=home-ess-stat-rows` | `14-scroll.xml` |
| 14c | Horizontal stat rows (≥3) | **PASS** | `active_team` 213, `off_work` 0, `leave_requests` 0 — label left, value right | `14-scroll.png` |
| 14c | No tall 2×2 centered stat cards | **PASS** | EssStatRow layout | `14-scroll.png` |
| 14b | Hoạt động trigger | **FAIL** | `home-activity-trigger` absent in full scroll dump | `14-scroll.png` |
| 14b | No legacy expandables above fold | **PASS** | no Bảng lương/Việc cần làm inline | `14-scroll.png` |
| 14b | Reduced scroll budget | **FAIL** | welcome card + Pulse tập đoàn still above stats; requires scroll to see ess rows | `14-scroll.png` |
| GWC | Metro require-cycle snackbar | **GWC** | `teamDirectory.ts` cycle toast on Home — dev-only, non-blocking | `14-scroll.png` |

## Wave mapping

| Wave | Focus | J-MOB | Device verdict |
|------|-------|-------|----------------|
| MOB-UX-14a | 4-col grid, top gap | J-MOB-06/32 | **PARTIAL** — top gap OK; grid missing |
| MOB-UX-14b | 1-screen budget, Hoạt động sheet | J-MOB-19..22 | **FAIL** |
| MOB-UX-14c | EssStatRow horizontal list | J-MOB-21 | **PASS** |
| MOB-UX-14e | Vietnamese company + real name | J-MOB-06 | **PASS** |
| MOB-TEST-01 | mainTabIa suite (dev) | — | Not device scope |

## Root cause (qa-device)

1. **Timing:** First screenshot captured during `profileReady` skeleton — false FAIL on 14e/14c in automated pass; resolved after 8s + scroll.
2. **Product:** APK SHA `03AC2D1E…` bundles 14e/14c but **does not render `action_grid` or `activity_hub`** for `uat.nv0001@xe.vn` — section order on device is `hero_carousel` → `leader_pulse` → attendance → `home-ess-stat-rows`, not `action_grid` first per `dashboardPersonaLayout.ts`.
3. **Dispatch:** Dev-mobile must rebuild **unified qa-device APK** after 14a+14b section-order fix and re-dispatch MOB-UX-14-UNIFIED-QA.

## Commands

```powershell
Get-FileHash -Algorithm SHA256 "C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk"
adb -s emulator-5554 install -r "C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk"
node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026
node scripts/tmp-mob-ux-14-unified-qa-device.mjs
# manual scroll evidence:
adb -s emulator-5554 shell input swipe 540 1800 540 600 400
adb -s emulator-5554 shell screencap -p /sdcard/14-scroll.png
```

## Screenshots

| File | Purpose |
|------|---------|
| `docs/qa/evidence/mob-ux-14-unified-qa-screens/14-scroll.png` | **Primary** — sponsor compare (14e/14c PASS) |
| `docs/qa/evidence/mob-ux-14-unified-qa-screens/14-home-above-fold.png` | Skeleton timing (discard for verdict) |
| `docs/qa/evidence/mob-ux-14-unified-qa-screens/14-scroll.xml` | UI dump — `home-ess-stat-rows`, no action grid |

## Handoff

```yaml
completion_report: |
  MOB-UX-14 unified device QA FAIL @ nip.io emulator-5554.
  CLOSED: 14e (Tập đoàn XeVN + Nguyễn Văn An), 14c (EssStatRow horizontal stats).
  OPEN: 14a 4-col quick-access grid not rendered; 14b Hoạt động trigger + 1-screen budget not met.
  APK installed SHA 03AC2D1E… (MOB-UX-14a build).
next_owner: dev-mobile
next_dispatch_prompt: |
  work_item_id MOB-UX-14a-R2 + MOB-UX-14b-R2 — fix DashboardScreen section order so action_grid + activity_hub render for employee persona on device; rebuild qa-device APK (new SHA pin); verify Chấm công/Nghỉ phép/Phiếu lương 4-col row + home-activity-trigger visible without scroll on 412dp emulator; re-dispatch qa-device MOB-UX-14-UNIFIED-QA.
evidence_path: docs/qa/evidence/mob-ux-14-unified-qa-20260609.md
ack_status: FAIL
pm_dispatch_hint: dev-mobile MOB-UX-14a-R2 — action_grid missing on device despite vitest PASS; unified APK rebuild required before QC MOB-PARTNER-QC-01.
```
