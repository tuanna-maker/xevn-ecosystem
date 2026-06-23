# MOB-UX-14-UNIFIED-QA-R2 — Sponsor compare device verification

| Field | Value |
|-------|-------|
| work_item_id | MOB-UX-14-UNIFIED-QA-R2 |
| date | 2026-06-09 |
| owner | qa-device |
| ack_status | **FAIL** |
| device | emulator-5554 (412×915 wm override; matrix 5 widths) |
| apk_path | `C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk` |
| apk_sha256 (PIN) | `E66C07E9CEDE179ABA6B3D569080DC61D1D4EC5C6002AD98D7878B16C3F7D135` |
| apk_bytes | 69112822 |
| api_base | https://14-225-217-232.nip.io |
| persona | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| api_full_name | Nguyễn Văn An |
| api_company_uuid | 6efaa5d6-a4a8-4bfd-805a-3c4f003e4013 |

## Executive verdict

**FAIL** — APK pin `E66C07E9…` (MOB-UX-14-APK-02) closes **R1 grid-absent P0** (`home-actions-carousel` + `home-action-tile-checkin` + 3 tiles above fold). Remaining sponsor gaps: **4th grid column**, **ESS horizontal stats hydrate**, **Hoạt động trigger/sheet**, **1-screen scroll budget**. 14d matrix re-run on new SHA: **FAIL** all phone widths (3/4 cols).

## R1 → R2 delta

| Area | R1 (`03AC2D1E…`) | R2 (`E66C07E9…`) |
|------|------------------|------------------|
| Quick-access grid | Absent | **Present** — carousel + Chấm công/Nghỉ phép/Phiếu lương |
| 14e labels | PASS | **PASS** — Tập đoàn XeVN + Nguyễn Văn An (a11y tree) |
| Top gap | PASS | **PASS** — minContentY=63 @ 412dp |
| Tab bar | PASS | **PASS** — 4 tabs + FAB + `tab-bar-safe-zone` |
| 4-col row | FAIL (0 cols) | **FAIL** (3/4 cols — Phê duyệt missing row 1) |
| EssStatRow | PASS after scroll | **FAIL** — `home-ess-stat-rows` never in tree ≤20s |
| Hoạt động sheet | FAIL | **FAIL** — `home-activity-trigger` not in uiautomator after scroll |

## Sponsor screenshot comparison

| Sponsor defect | Before (R1) | After R2 (device) | Result |
|--------------|-------------|-------------------|--------|
| Top white gap above blue header | White strip | Blue header flush; matrix `minContentY=63` | **PASS** |
| Raw holding + generic bạn | Slug greeting | Tập đoàn XeVN; no holding/main/bạn slug | **PASS** |
| 3-col grid with empty gutter | 0 tiles (grid absent) | 3 tiles/row (Chấm công, Nghỉ phép, Phiếu lương); 4th col missing | **FAIL** |
| Tall centered stat cards | 2×2 big numbers | EssStatRow block not rendered (no `home-ess-stat-rows`) | **FAIL** |
| Excessive scroll before stats | 6+ expandables | Grid above fold OK; stats/activity never hydrate | **FAIL** |
| Tab bar overlap | — | tab-bar-safe-zone + FAB clearance PASS | **PASS** |
| Real name in header | — | `Nguyễn Văn An` in a11y tree; visual truncates «N…» on 412dp | **GWC** |

## Check matrix

| Wave | Check | Result | Note | Screenshot |
|------|-------|--------|------|------------|
| GATE | SHA-256 pin E66C07E9… | **PASS** | matches MOB-UX-14-APK-02 | — |
| GATE | adb install -r | **PASS** | exit 0 Success | — |
| GATE | nip.io API login | **PASS** | full_name=Nguyễn Văn An | — |
| GATE | company_uuid ≠ main | **PASS** | 6efaa5d6-a4a8-4bfd-805a-3c4f003e4013 | — |
| GATE | Deep-link home + 20s hydrate | **PASS** | `qa-mobile-login-intent.mjs` home_reached=true | — |
| 14e | Company label = Tập đoàn XeVN | **PASS** | text in header | `r2-final-hydrate20.png` |
| 14e | No raw slug holding/main | **PASS** | no slug text | `r2-final-hydrate20.png` |
| 14e | No generic «bạn» greeting | **PASS** | no text="bạn" | `r2-final-hydrate20.png` |
| 14e | Display name from HRM profile | **GWC** | a11y has Nguyễn Văn An; header visually «N…» | `r2-final-hydrate20.png` |
| 14a | home-actions-carousel above fold | **PASS** | resource-id present | `r2-final-hydrate20.png` |
| 14a | home-action-tile-checkin visible | **PASS** | tile a11y present | `r2-final-hydrate20.png` |
| 14a | 4-col action grid (row 1) | **FAIL** | 3/4 cols; Phê duyệt absent row 1 | `r2-final-hydrate20.png` |
| 14a | No top white gap | **PASS** | matrix topGap minContentY=63 | `r2-final-hydrate20.png` |
| 14a | Compact tiles ≤100dp | **PASS** | maxTileHeightPx=83 @ Pixel 7 class | `r2-final-hydrate20.png` |
| 14c | home-ess-stat-rows container | **FAIL** | absent after 20s + 2 scrolls | `r2-deep-scroll.png` |
| 14c | Horizontal stat rows (≥3) | **FAIL** | statRows=0 in XML probes | `r2-deep-scroll.png` |
| 14c | No tall 2×2 centered stat cards | **PASS** | legacy cards not rendered | `r2-final-hydrate20.png` |
| 14b | Hoạt động trigger present | **FAIL** | `home-activity-trigger` absent post-scroll | `r2-deep-scroll.png` |
| 14b | No legacy expandables above fold | **PASS** | no Bảng lương/Việc cần làm inline | `r2-final-hydrate20.png` |
| 14b | Activity trigger above tab bar | **FAIL** | trigger not found | `r2-deep-scroll.png` |
| 14b | Grid+stats 1-screen budget | **FAIL** | grid OK; stats/activity missing | `r2-deep-scroll.png` |
| 14b | Hoạt động sheet opens on tap | **FAIL** | no trigger to tap | — |
| TAB | Bottom tab bar (4 tabs + FAB) | **PASS** | Trang chủ/Đơn công/Đội nhóm/Hồ sơ + FAB | `r2-final-hydrate20.png` |
| TAB | tab-bar-safe-zone clearance | **PASS** | safeZone present | `r2-final-hydrate20.png` |
| GWC | Metro require-cycle snackbar | **GWC** | teamDirectory cycle toast — dismissible | `r2-final-hydrate20.png` |

## 14d responsive matrix (R2 re-run)

| Device class | WxH | Grid cols | Top gap | Tab clearance | Scroll depth | Verdict |
|--------------|-----|-----------|---------|---------------|--------------|---------|
| iPhone SE 3 | 375×667 | 0/4 | PASS | PASS | FAIL | **FAIL** |
| iPhone 14 Pro Max | 430×932 | 3/4 | PASS | PASS | FAIL | **FAIL** |
| Pixel 4a | 393×851 | 0/4 | PASS | PASS | FAIL | **FAIL** |
| Pixel 7 | 412×915 | 3/4 | PASS | PASS | FAIL | **FAIL** |
| iPad Mini portrait | 744×1133 | 3/4 | PASS | PASS | FAIL | **GWC** |

Matrix artifact: `docs/qa/evidence/mob-ux-14d-matrix-20260609.md` (SHA updated to E66C07E9…).

## Root cause (qa-device)

1. **14a partial:** `QuickAccessGrid` renders but row 1 shows **3 tiles** on 375–430dp classes; `Phê duyệt` not in first row (vitest expects 4 @ 412dp).
2. **14c/14b blocked:** `above_fold_stats` + `activity_hub` sections never mount on device for `uat.nv0001@xe.vn` within 20s — ESS API hydrate or `sectionOrder` gating still skips below-fold blocks on qa-device build (same on dev-mobile `mob-ux-14-apk-02-*.xml` probes).
3. **14e GWC:** Full name in accessibility tree; `HomeTopBar` truncates display on narrow header (visual «N…»).
4. **Not stale APK:** SHA pin verified; regression vs R1 is real for grid; residual is layout/hydrate not install.

## Commands

```powershell
Get-FileHash -Algorithm SHA256 "C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk"
adb -s emulator-5554 install -r "C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk"
adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile
adb -s emulator-5554 shell wm size 412x915
node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026
node scripts/tmp-mob-ux-14-unified-qa-r2-device.mjs
node scripts/qa-mobile-home-responsive-matrix.mjs
```

## Screenshots

| File | Purpose |
|------|---------|
| `docs/qa/evidence/mob-ux-14-unified-qa-r2-screens/r2-final-hydrate20.png` | **Primary** — grid + header @ 20s hydrate |
| `docs/qa/evidence/mob-ux-14-unified-qa-r2-screens/r2-deep-scroll.png` | Post-scroll — stats/activity still absent |
| `docs/qa/evidence/mob-ux-14-unified-qa-r2-screens/r2-final-hydrate20.xml` | UI dump — carousel+checkin; no ess/activity |
| `docs/qa/evidence/mob-ux-14d-screens/pixel-7-home-top.png` | 14d Pixel 7 class reference |

## Handoff

```yaml
completion_report: |
  MOB-UX-14-UNIFIED-QA-R2 FAIL @ nip.io emulator-5554, APK E66C07E9….
  CLOSED vs R1: action grid carousel + checkin tile + 3 quick tiles above fold; 14e company/name; top gap; tab bar.
  OPEN P0: 4th grid column (3/4 cols); EssStatRow horizontal stats never hydrate; Hoạt động trigger/sheet absent; 1-screen budget.
  14d matrix FAIL all phone widths on new SHA.
next_owner: dev-mobile
next_dispatch_prompt: |
  work_item_id MOB-UX-14-R3 — (1) ensure 4 tiles in row 1 @ 412dp including Phê duyệt;
  (2) fix above_fold_stats + activity_hub mount for uat.nv0001 (ESS API / sectionOrder gate);
  (3) verify home-ess-stat-rows + home-activity-trigger in uiautomator without >1 scroll;
  rebuild qa-device APK (new SHA pin); re-dispatch qa-device MOB-UX-14-UNIFIED-QA-R3.
evidence_path: docs/qa/evidence/mob-ux-14-unified-qa-r2-20260609.md
ack_status: FAIL
pm_dispatch_hint: dev-mobile MOB-UX-14-R3 — grid 3/4 + ess/activity hydrate P0 before QC MOB-PARTNER-QC-01.
```
