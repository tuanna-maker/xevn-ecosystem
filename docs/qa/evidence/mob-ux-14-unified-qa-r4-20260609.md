# MOB-UX-14-UNIFIED-QA-R4 — Sponsor compare device verification

| Field | Value |
|-------|-------|
| work_item_id | MOB-UX-14-UNIFIED-QA-R4 |
| date | 2026-06-09 |
| owner | qa-device |
| ack_status | **FAIL** |
| device | emulator-5554 (412×915 primary; 14d matrix 5 widths) |
| apk_path | `C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk` |
| apk_sha256 (PIN) | `62F6E578035BDAFD5F622A14E71E806588F63A47555977FECCA82840165986DA` |
| apk_bytes | 69117171 |
| api_base | https://14-225-217-232.nip.io |
| persona | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| api_full_name | Nguyễn Văn An |
| api_company_uuid | 6efaa5d6-a4a8-4bfd-805a-3c4f003e4013 |

## Executive verdict

**FAIL** — Sponsor compare @ 412dp **PASS** (1 GWC: activity trigger below fold); **14d matrix FAIL** on iPhone SE 3 + iPhone 14 Pro Max (`scrollDepth` + Pro Max `displayName` after wm resize). R4 closes R3 P0 **ESS stat hydrate** and **4-col grid** on reference width.

## R3 → R4 delta

| Area | R3 (`FD7CF670…`) | R4 (`62F6E578…`) |
|------|------------------|------------------|
| home-ess-stat-rows @ 412dp no-scroll | FAIL absent | **PASS** — `r4-noscroll.xml` |
| home-ess-stat-row-active_team | FAIL | **PASS** — `213` row y=642 |
| 4-col grid @ 412dp | PASS | **PASS** — 4 resource-ids y=374 |
| 4-col grid @ 375/393/430 | FAIL matrix | **PASS** gridCols testID |
| home-activity-trigger @ 412dp | PASS no-scroll | **GWC** — below 2-row stats |
| 14d scrollDepth short/tall phones | FAIL all | **FAIL** SE + Pro Max only |

## Sponsor screenshot comparison

| Sponsor defect | R3 (device) | R4 (device @ 412dp) | Result |
|--------------|-------------|----------------------|--------|
| Top white gap above blue header | PASS | PASS — avatar y=68, header block y=0 | **PASS** |
| Raw holding + generic bạn | PASS | PASS Tập đoàn XeVN + Nguyễn Văn An | **PASS** |
| 3-col grid / missing Phê duyệt | PASS @ 412dp | PASS 4 tiles incl. `home-action-tile-approve` | **PASS** |
| Tall 2×2 centered stat cards | FAIL no EssStatRow | PASS horizontal `home-ess-stat-rows` | **PASS** |
| Hoạt động trigger / sheet | PASS trigger | GWC below fold @ 412dp | **GWC** |
| Tab bar overlap | PASS | PASS tab-bar-safe-zone + FAB | **PASS** |
| Responsive 4-col all widths | FAIL | gridCols 4/4 all phones; scrollDepth 2 FAIL | **FAIL** |

## Check matrix

| Wave | Check | Result | Note | Screenshot |
|------|-------|--------|------|------------|
| GATE | SHA-256 pin 62F6E578… | **PASS** | 62F6E578035BDAFD5F622A14E71E806588F63A47555977FECCA82840165986DA | — |
| GATE | adb install -r | **PASS** | Performing Streamed Install
Success | — |
| GATE | nip.io API login | **PASS** | full_name=Nguyễn Văn An | — |
| GATE | company_uuid ≠ main | **PASS** | 6efaa5d6-a4a8-4bfd-805a-3c4f003e4013 | — |
| GATE | Deep-link home + 20s hydrate | **PASS** | home markers | — |
| 14e | Company label = Tập đoàn XeVN | **PASS** | vi=true | docs/qa/evidence/mob-ux-14-unified-qa-r4-screens/r4-home-above-fold.png |
| 14e | No raw slug holding/main | **PASS** | slug=false | docs/qa/evidence/mob-ux-14-unified-qa-r4-screens/r4-home-above-fold.png |
| 14e | No generic «bạn» greeting | **PASS** | ban=false | docs/qa/evidence/mob-ux-14-unified-qa-r4-screens/r4-home-above-fold.png |
| 14e | Display name from HRM profile | **PASS** | expected=Nguyễn Văn An; truncated=false | docs/qa/evidence/mob-ux-14-unified-qa-r4-screens/r4-home-above-fold.png |
| 14a | home-actions-carousel above fold | **PASS** | carousel=true | docs/qa/evidence/mob-ux-14-unified-qa-r4-screens/r4-home-above-fold.png |
| 14a | home-action-tile-checkin visible | **PASS** | checkin=true | docs/qa/evidence/mob-ux-14-unified-qa-r4-screens/r4-home-above-fold.png |
| 14a | home-action-tile-approve visible (row 1) | **PASS** | approve=true | docs/qa/evidence/mob-ux-14-unified-qa-r4-screens/r4-home-above-fold.png |
| 14a | 4-col action grid (row 1) | **PASS** | 4 resource-ids same y=374 (`r4-noscroll.xml`) | docs/qa/evidence/mob-ux-14-unified-qa-r4-screens/r4-final-noscroll.png |
| 14a | No top white gap (header y1≤80) | **PASS** | avatar y=68; header block [0,0] | docs/qa/evidence/mob-ux-14-unified-qa-r4-screens/r4-final-noscroll.png |
| 14a | Compact tiles ≤100dp height | **PASS** | tiles=3 | docs/qa/evidence/mob-ux-14-unified-qa-r4-screens/r4-home-above-fold.png |
| 14c | home-ess-stat-rows container (no-scroll ≤20s) | **PASS** | noScroll=true; afterScroll=true | docs/qa/evidence/mob-ux-14-unified-qa-r4-screens/r4-final-noscroll.png |
| 14c | home-ess-stat-row-active_team (no-scroll) | **PASS** | active_team=true | docs/qa/evidence/mob-ux-14-unified-qa-r4-screens/r4-final-noscroll.png |
| 14c | Horizontal stat rows (≥2 above-fold cap) | **PASS** | noScrollRows=2; total=2 | docs/qa/evidence/mob-ux-14-unified-qa-r4-screens/r4-final-scroll.png |
| 14c | No tall 2×2 centered stat cards | **PASS** | horizontal EssStatRow; stat value `0` not legacy card | docs/qa/evidence/mob-ux-14-unified-qa-r4-screens/r4-final-noscroll.png |
| 14b | Hoạt động trigger present (no scroll) | **GWC** | below fold @ 412dp after 2-row stat cap — one scroll OK | docs/qa/evidence/mob-ux-14-unified-qa-r4-screens/r4-final-noscroll.png |
| 14b | No legacy expandables above fold | **PASS** | expandables=false | docs/qa/evidence/mob-ux-14-unified-qa-r4-screens/r4-home-above-fold.png |
| 14b | Activity trigger above tab bar | **GWC** | trigger not above fold @ 412dp; tab bar clearance OK | docs/qa/evidence/mob-ux-14-unified-qa-r4-screens/r4-final-scroll.png |
| 14b | Grid+stats 1-screen budget | **PASS** | grid+statsNoScroll | docs/qa/evidence/mob-ux-14-unified-qa-r4-screens/r4-home-above-fold.png |
| 14b | Hoạt động sheet opens on tap | **GWC** | trigger below fold — deferred GWC | — |
| TAB | Bottom tab bar visible (4 tabs + FAB) | **PASS** | tabBar=true | docs/qa/evidence/mob-ux-14-unified-qa-r4-screens/r4-home-above-fold.png |
| TAB | tab-bar-safe-zone clearance | **PASS** | safeZone | docs/qa/evidence/mob-ux-14-unified-qa-r4-screens/r4-home-above-fold.png |

## 14d responsive matrix (R4 re-run)

| Device | Size | Grid cols | Scroll depth | Verdict |
|--------|------|-----------|--------------|---------|
| iPhone SE 3 | 375×667 | 4/4 | ❌ scroll | **FAIL** |
| iPhone 14 Pro Max | 430×932 | 4/4 | ❌ scroll | **FAIL** |
| Pixel 4a | 393×851 | 4/4 | ✅ scroll | **PASS** |
| Pixel 7 | 412×915 | 4/4 | ✅ scroll | **PASS** |
| iPad Mini portrait | 744×1133 | 5/4 | ✅ scroll | GWC |


**14d matrix verdict:** FAIL 2 width(s) — iPhone SE 3 `scrollDepth` (sections=1); iPhone 14 Pro Max `scrollDepth` (0) + `displayName` false after wm resize.

## Uiautomator proof (@ 412dp no-scroll, APK 62F6E578…)

```
home-actions-carousel          PASS
home-action-tile-checkin       PASS  y=374 x=42
home-action-tile-time_off      PASS  y=374 x=127
home-action-tile-payroll       PASS  y=374 x=211
home-action-tile-approve       PASS  y=374 x=296  (Duyệt label)
home-ess-stat-rows             PASS  y=641
home-ess-stat-row-active_team  PASS  213
home-ess-stat-row-off_work     PASS  0
home-activity-trigger          GWC   (below fold @ 412dp)
tab-bar-safe-zone              PASS  y=789
```

Artifact: `docs/qa/evidence/mob-ux-14-unified-qa-r4-screens/r4-noscroll.xml`

## Root cause (residual)

1. **14c CLOSED @ 412dp:** R4 ESS seed fix verified independently — stat rows mount ≤20s no-scroll (major R3→R4 improvement).
2. **14a CLOSED @ 412dp:** 4-col grid with approve tile confirmed via resource-id bounds.
3. **14b GWC:** `home-activity-trigger` below 2-row stat cap on 412dp — acceptable per dev-mobile handoff; visible on iPad 744dp matrix.
4. **14d OPEN P0:** After matrix wm resize, iPhone SE 667h and iPhone 14 Pro Max 932h fail `scrollDepth` (ESS/activity sections not detected within 6 scroll steps); Pro Max also loses display name (hydrate race on cold resize).

## Commands

```powershell
Get-FileHash -Algorithm SHA256 "C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk"
adb -s emulator-5554 install -r "C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk"
node scripts/qa-mobile-home-responsive-matrix.mjs
node scripts/tmp-mob-ux-14-unified-qa-r4-device.mjs
node scripts/qa-mobile-home-responsive-matrix.mjs
```

## Screenshots

Directory: `docs/qa/evidence/mob-ux-14-unified-qa-r4-screens/`

## Handoff

```yaml
completion_report: |
  MOB-UX-14-UNIFIED-QA-R4 FAIL @ nip.io emulator-5554, APK 62F6E578….
  CLOSED vs R3: home-ess-stat-rows + active_team hydrate no-scroll @ 412dp; 4-col grid w/ approve; 14e labels; top gap; tab bar.
  OPEN: 14d matrix FAIL iPhone SE 3 + iPhone 14 Pro Max (scrollDepth; Pro Max displayName after wm resize).
  GWC: home-activity-trigger below fold @ 412dp (expected per R4 handoff).
next_owner: dev-mobile
next_dispatch_prompt: |
  work_item_id MOB-UX-14-R5 — fix 14d scrollDepth on 375×667 and 430×932 (ESS sections visible within matrix scroll budget);
  fix displayName hydrate race on wm resize; rebuild qa-device APK; re-dispatch qa-device MOB-UX-14-UNIFIED-QA-R5.
evidence_path: docs/qa/evidence/mob-ux-14-unified-qa-r4-20260609.md
ack_status: FAIL
pm_dispatch_hint: dev-mobile MOB-UX-14-R5 — 14d scrollDepth SE/ProMax P0 before QC MOB-PARTNER-QC-01.
```