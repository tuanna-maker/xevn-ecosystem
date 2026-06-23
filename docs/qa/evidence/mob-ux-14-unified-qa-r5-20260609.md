# MOB-UX-14-UNIFIED-QA-R5 — Home responsive + sponsor compare

| Field | Value |
|-------|-------|
| work_item_id | MOB-UX-14-UNIFIED-QA-R5 |
| date | 2026-06-09 |
| owner | qa-device |
| ack_status | **FAIL** |
| device | emulator-5554 |
| apk_path | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| apk_sha256 (PIN) | `2023241B7D4AF86E7D0A0A71DB8B939E31DC9CACCDC519FE63A724FF84C0A58F` |
| apk_bytes | 69125949 |
| api_base | https://14-225-217-232.nip.io |
| persona | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| api_full_name | Nguyễn Văn An |
| api_company_uuid | 6efaa5d6-a4a8-4bfd-805a-3c4f003e4013 |

## Executive verdict

**FAIL** — MOB-UX-14-R5 viewport fixes **partially** effective. **Pixel 7 (412×915)** and **native sponsor home** PASS; **iPhone SE (375×667)** and **iPhone 14 Pro Max (430×932)** still FAIL **scrollDepth** P0. Pro Max after `wm size` lands on **Phiếu lương** tab with `holding` slug — **displayName** probe false-negative on Home.

## MOB-UX-14d matrix (focus: SE + Pro Max)

| Device class | WxH | Grid 4-col | Top gap | Tab clearance | scrollDepth | displayName | Verdict |
|--------------|-----|------------|---------|---------------|-------------|-------------|---------|
| **iPhone SE 3** | 375×667 | ✅ | ✅ | ✅ | ❌ (1/3 sections) | ✅ | **FAIL** |
| **iPhone 14 Pro Max** | 430×932 | ✅ | ✅ | ✅ | ❌ (0/3 sections) | ❌ | **FAIL** |
| Pixel 7 | 412×915 | ✅ | ✅ | ✅ | ✅ | ✅ | **PASS** |
| Pixel 4a | 393×851 | ✅ | ✅ | ✅ | ❌ | ❌ | FAIL |
| iPad Mini | 744×1133 | ✅ | ✅ | ✅ | ❌ | ❌ | GWC |

### P0 detail — iPhone SE 3

- **scrollDepth FAIL:** After 6 scroll steps, combined XML shows only `home-actions-carousel`; `home-ess-stat-rows` / `Hoạt động` / `Đội đang làm` never surfaced.
- **displayName PASS:** `Nguyễn Văn An` + `Tập đoàn XeVN` on `iphone-se-home-top.xml`.
- **412dp regression guard (via Pixel 7):** `home-action-tile-approve` + `home-ess-stat-rows` visible without extra scroll — **PASS**.

### P0 detail — iPhone 14 Pro Max

- **displayName FAIL:** Post-resize deep-link session opened **Phiếu lương** tab (`iphone-14-pro-max-home-top.xml` shows `Phiếu lương` selected + `Kỳ lương 05/2026 — holding`).
- **scrollDepth FAIL:** Home markers absent — matrix probed wrong tab after `wm size 430x932`.
- **Root cause class:** `loginHome` + `tapHomeTab` insufficient after viewport resize; R5 greeting hydrate not exercised on Home at Pro Max width.

## Sponsor home compare — `uat.nv0001@xe.vn` (native 1080×2400)

Captured after `qa-mobile-login-intent.mjs` PASS (`home_reached=true`).

| Sponsor defect (2026-06-09) | After R5 APK | Result | Evidence |
|----------------------------|--------------|--------|----------|
| Top white gap above header | Header y=0, no double safe-area | **PASS** | `r5-sponsor-home.png` |
| Raw «holding» + «bạn» | **Tập đoàn XeVN** + **Nguyễn Văn An** | **PASS** | `r5-sponsor-home.xml` |
| 3-col grid with empty gutter | 4-col `home-actions-carousel` + tiles | **PASS** | `r5-sponsor-home.xml` |
| Tall centered stat cards | `home-ess-stat-rows` horizontal rows | **PASS** | `r5-sponsor-home.xml` |
| Excessive scroll / missing Hoạt động | `home-activity-trigger` present | **PASS** | `r5-sponsor-home.xml` |

## Commands

```text
Get-FileHash -Algorithm SHA256 apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk
  → 2023241B7D4AF86E7D0A0A71DB8B939E31DC9CACCDC519FE63A724FF84C0A58F

adb -s emulator-5554 install -r hrm-mobile-qa-device.apk  → exit 0 Success
pnpm --filter hrm-mobile exec vitest run homeActionGrid.test.ts  → exit 0
POST https://14-225-217-232.nip.io/api/hrm/auth/mobile/login  → exit 0

node scripts/qa-mobile-home-responsive-matrix.mjs  → exit 1 (SE/ProMax FAIL)
node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn  → exit 0 home_reached=true
adb shell wm size reset + sponsor home dump  → PASS all markers
```

## Screenshots

| File | Purpose |
|------|---------|
| `docs/qa/evidence/mob-ux-14-unified-qa-r5-screens/r5-sponsor-home.png` | Sponsor compare @ native res |
| `docs/qa/evidence/mob-ux-14-unified-qa-r5-screens/r5-sponsor-home.xml` | Authoritative UI dump |
| `docs/qa/evidence/mob-ux-14d-screens/iphone-se-home-top.png` | SE above-fold grid |
| `docs/qa/evidence/mob-ux-14d-screens/iphone-14-pro-max-home-top.png` | Pro Max wrong-tab state |
| `docs/qa/evidence/mob-ux-14d-screens/pixel-7-home-top.png` | 412dp regression PASS |

Matrix JSON: `docs/qa/evidence/mob-ux-14d-matrix-20260609.json` (refreshed this session).

## Handoff

```yaml
completion_report: |
  MOB-UX-14-UNIFIED-QA-R5 FAIL @ nip.io emulator-5554, APK SHA 2023241B….
  CLOSED: sponsor home compare @ native res (14a/14b/14c/14e all PASS for uat.nv0001);
  Pixel 7 412×915 matrix PASS (R4 no-scroll regression guard).
  OPEN P0: iPhone SE scrollDepth — home-ess-stat-rows not in 6-step scroll budget;
  iPhone 14 Pro Max — post-wm-resize lands Phiếu lương tab with holding slug, displayName+scrollDepth FAIL.
next_owner: dev-mobile
next_dispatch_prompt: |
  work_item_id MOB-UX-14-R6 — after wm size change force Home tab + wait profileReady before matrix probe;
  ensure home-ess-stat-rows within above-fold budget on SE (375×667) and Pro Max (430×932);
  extend scrollUntilGrid to continue scrolling to stats after grid found; rebuild qa-device APK (new SHA pin);
  re-dispatch qa-device MOB-UX-14-UNIFIED-QA-R6 with matrix + sponsor compare.
evidence_path: docs/qa/evidence/mob-ux-14-unified-qa-r5-20260609.md
ack_status: FAIL
pm_dispatch_hint: dev-mobile MOB-UX-14-R6 — SE/ProMax scrollDepth + ProMax wm-resize Home tab P0 open after R5.
```
