# MOB-UX-14-UNIFIED-QA-R3 — Sponsor compare device verification

| Field | Value |
|-------|-------|
| work_item_id | MOB-UX-14-UNIFIED-QA-R3 |
| date | 2026-06-09 |
| owner | qa-device |
| ack_status | **FAIL** |
| device | emulator-5554 (412×915 primary; 14d matrix 5 widths) |
| apk_path | `C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk` |
| apk_sha256 (PIN) | `FD7CF6708A821167C71B38CA18364255A0B4FA994F03BBD3439F053511594024` |
| apk_bytes | 69115186 |
| api_base | https://14-225-217-232.nip.io |
| persona | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| api_full_name | Nguyễn Văn An |
| api_company_uuid | 6efaa5d6-a4a8-4bfd-805a-3c4f003e4013 |

## Executive verdict

**FAIL** — APK `FD7CF670…` (MOB-UX-14-R3) closes **R2 P0 grid + activity** gaps at **412dp**: 4 action tiles in one row including `home-action-tile-approve`, `home-activity-trigger` above fold, 14e labels, tab bar. **OPEN:** `home-ess-stat-rows` never appears in uiautomator after ≤45s hydrate + multiple scrolls on qa-device (dev-mobile `mob-ux-14-r3-deep.xml` not reproduced); **14d responsive matrix FAIL** all phone widths (3/4 cols or worse).

## R2 → R3 delta

| Area | R2 (`E66C07E9…`) | R3 (`FD7CF670…`) |
|------|------------------|------------------|
| 4-col grid @ 412dp | FAIL 3/4 cols | **PASS** — 4 tiles y=374 (`r3-noscroll.xml`) |
| `home-action-tile-approve` row 1 | FAIL absent | **PASS** |
| `home-activity-trigger` no scroll | FAIL | **PASS** |
| 14e company/name | PASS | **PASS** |
| Top gap (matrix minContentY) | PASS y≤63 | **PASS** |
| `home-ess-stat-rows` hydrate | FAIL | **FAIL** — absent after 20s+scroll (qa-device) |
| 14d matrix | FAIL all phones | **FAIL** all phones (SHA updated) |

## Sponsor screenshot comparison

| Sponsor defect | R2 (device) | R3 (device @ 412dp) | Result |
|--------------|-------------|----------------------|--------|
| Top white gap above blue header | PASS minContentY=63 | PASS — header avatar y=68 | **PASS** |
| Raw holding + generic bạn | PASS Tập đoàn XeVN | PASS + Nguyễn Văn An | **PASS** |
| 3-col grid / missing Phê duyệt | FAIL 3/4 cols | **PASS** 4 tiles same row y=374 | **PASS** |
| Tall 2×2 centered stat cards | FAIL no EssStatRow | FAIL — `home-ess-stat-rows` not in tree | **FAIL** |
| Hoạt động trigger / sheet | FAIL | **PASS** trigger no-scroll; sheet not tapped | **PASS** |
| Tab bar overlap | PASS | PASS tab-bar-safe-zone + FAB | **PASS** |
| Responsive 4-col all widths | FAIL | FAIL 14d matrix | **FAIL** |

## Check matrix

| Wave | Check | Result | Note | Screenshot / XML |
|------|-------|--------|------|------------------|
| GATE | SHA-256 pin FD7CF670… | **PASS** | matches MOB-UX-14-R3 handoff | — |
| GATE | adb install -r | **PASS** | exit 0 Success | — |
| GATE | nip.io API login | **PASS** | full_name=Nguyễn Văn An | — |
| GATE | company_uuid ≠ main | **PASS** | 6efaa5d6-a4a8-4bfd-805a-3c4f003e4013 | — |
| GATE | Deep-link home + 20s hydrate | **PASS** | `qa-mobile-login-intent.mjs` home_reached=true | — |
| 14e | Company label = Tập đoàn XeVN | **PASS** | text in header | `r3-final-noscroll.png` |
| 14e | No raw slug holding/main | **PASS** | no slug text | `r3-final-noscroll.png` |
| 14e | No generic «bạn» greeting | **PASS** | real name shown | `r3-final-noscroll.png` |
| 14e | Display name from HRM profile | **PASS** | Nguyễn Văn An in tree | `r3-final-noscroll.png` |
| 14a | home-actions-carousel above fold | **PASS** | resource-id present | `r3-noscroll.xml` |
| 14a | home-action-tile-checkin visible | **PASS** | y=374 | `r3-noscroll.xml` |
| 14a | home-action-tile-approve visible (row 1) | **PASS** | y=374 x=296 | `r3-noscroll.xml` |
| 14a | 4-col action grid (row 1) | **PASS** | 4 resource-ids same y=374 | `r3-noscroll.xml` |
| 14a | No top white gap | **PASS** | matrix minContentY=63 @ 412dp | `r3-final-noscroll.png` |
| 14a | Compact tiles ≤100dp height | **PASS** | tile h≈168px bounds | `r3-noscroll.xml` |
| 14c | home-ess-stat-rows container | **FAIL** | absent ≤45s + 3 scroll attempts | `r3-final-scroll.xml` |
| 14c | Horizontal stat rows (≥3) | **FAIL** | statRows=0 all probes | `r3-final-scroll.xml` |
| 14c | No tall 2×2 centered stat cards | **PASS** | legacy cards not rendered | `r3-final-noscroll.png` |
| 14b | Hoạt động trigger present (no scroll) | **PASS** | `home-activity-trigger` y=641 | `r3-noscroll.xml` |
| 14b | No legacy expandables above fold | **PASS** | no inline Bảng lương/Việc cần làm | `r3-final-noscroll.png` |
| 14b | Activity trigger above tab bar | **PASS** | trigger y2=852, nav=852 | `r3-noscroll.xml` |
| 14b | Grid+stats 1-screen budget | **FAIL** | grid+activity OK; stats never mount | `r3-final-scroll.png` |
| 14b | Hoạt động sheet opens on tap | **GWC** | not exercised this pass | — |
| TAB | Bottom tab bar (4 tabs + FAB) | **PASS** | Trang chủ/Đội nhóm/Phiếu lương/Hồ sơ + FAB | `r3-final-noscroll.png` |
| TAB | tab-bar-safe-zone clearance | **PASS** | safeZone present | `r3-final-noscroll.png` |
| GWC | Metro require-cycle snackbar | **GWC** | teamDirectory cycle — dismissible | `r3-final-noscroll.png` |

## 14d responsive matrix (R3 re-run)

| Device class | WxH | Grid cols | Top gap | Tab clearance | Scroll depth | Verdict |
|--------------|-----|-----------|---------|---------------|--------------|---------|
| iPhone SE 3 | 375×667 | 3/4 ❌ | ✅ | ✅ | ❌ | **FAIL** |
| iPhone 14 Pro Max | 430×932 | 1/4 ❌ | ✅ | ✅ | ❌ | **FAIL** |
| Pixel 4a | 393×851 | 1/4 ❌ | ✅ | ✅ | ❌ | **FAIL** |
| Pixel 7 | 412×915 | 3/4 ❌ | ✅ | ✅ | ❌ | **FAIL** |
| iPad Mini portrait | 744×1133 | 3/4 ❌ | ✅ | ✅ | ❌ | **GWC** |

Matrix artifact: `docs/qa/evidence/mob-ux-14d-matrix-20260609.json` (SHA `FD7CF670…`).

**Note:** Pixel 7 unified probe @ 412dp shows **4/4 cols** in `r3-noscroll.xml`; matrix script counts label text bounds and under-reports cols — script gap, not install gap.

## Root cause (qa-device)

1. **14a/14b CLOSED @ 412dp:** R3 layout fixes verified — 4 tiles + approve + activity trigger without scroll (`r3-noscroll.xml`, `r3-final-noscroll.xml`).
2. **14c BLOCKED:** `home-ess-stat-rows` never mounts in qa-device session after pm-clear → deep-link → 20–45s wait → scroll (`r3-final-scroll.xml`, `r3-hydrate45.xml`). Dev-mobile `mob-ux-14-r3-deep.xml` shows stats after scroll — **not reproduced** on independent qa-device run (ESS API hydrate / sectionOrder gate flaky or nip.io timing).
3. **14d FAIL:** Responsive grid still 3/4 or 1/4 on matrix widths; scroll depth sections absent. Separate from 412dp sponsor reference pass.
4. **Not stale APK:** SHA pin verified; regression vs R2 is real improvement for grid/activity.

## Uiautomator proof (@ 412dp no-scroll)

```
home-actions-carousel          PASS
home-action-tile-checkin       PASS  y=374
home-action-tile-time_off      PASS  y=374
home-action-tile-payroll       PASS  y=374
home-action-tile-approve       PASS  y=374  (same row)
home-activity-trigger          PASS  y=641
home-ess-stat-rows             FAIL  (absent after scroll too)
```

## Commands

```powershell
Get-FileHash -Algorithm SHA256 "C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk"
adb -s emulator-5554 install -r "C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk"
adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile
adb -s emulator-5554 shell wm size 412x915
node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026
node scripts/tmp-mob-ux-14-unified-qa-r3-device.mjs
node scripts/tmp-r3-ess-probe.mjs
node scripts/qa-mobile-home-responsive-matrix.mjs
```

## Screenshots

| File | Purpose |
|------|---------|
| `docs/qa/evidence/mob-ux-14-unified-qa-r3-screens/r3-final-noscroll.png` | **Primary** — 4-col grid + activity @ 20s hydrate |
| `docs/qa/evidence/mob-ux-14-unified-qa-r3-screens/r3-final-scroll.png` | Post-scroll — stats still absent |
| `docs/qa/evidence/mob-ux-14-unified-qa-r3-screens/r3-noscroll.xml` | Authoritative 4-col tile bounds |
| `docs/qa/evidence/mob-ux-14-unified-qa-r3-screens/r3-final-scroll.xml` | Post-scroll — no ess rows |
| `docs/qa/evidence/mob-ux-14d-screens/pixel-7-home-top.png` | 14d Pixel 7 class reference |

## Handoff

```yaml
completion_report: |
  MOB-UX-14-UNIFIED-QA-R3 FAIL @ nip.io emulator-5554, APK FD7CF670….
  CLOSED vs R2: 4-col grid w/ approve on row 1 @ 412dp; home-activity-trigger above fold; 14e labels; top gap; tab bar.
  OPEN P0: home-ess-stat-rows never hydrates on qa-device (≤45s + scroll); 14d responsive matrix FAIL all phone widths.
  Dev-mobile mob-ux-14-r3-deep.xml ess stats NOT reproduced independently.
next_owner: dev-mobile
next_dispatch_prompt: |
  work_item_id MOB-UX-14-R4 — (1) fix ESS stat row hydrate reliability for uat.nv0001@xe.vn on nip.io (home-ess-stat-rows in uiautomator ≤20s + one scroll);
  (2) fix responsive 4-col grid on 375/393/430dp per MOBILE_HOME_RESPONSIVE_PROGRAM.md;
  rebuild qa-device APK (new SHA); re-dispatch qa-device MOB-UX-14-UNIFIED-QA-R4.
evidence_path: docs/qa/evidence/mob-ux-14-unified-qa-r3-20260609.md
ack_status: FAIL
pm_dispatch_hint: dev-mobile MOB-UX-14-R4 — ess hydrate flaky + 14d responsive P0 before QC MOB-PARTNER-QC-01.
```
