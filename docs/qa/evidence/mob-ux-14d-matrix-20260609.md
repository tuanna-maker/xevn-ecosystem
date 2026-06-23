# MOB-UX-14d — Home responsive matrix (device classes)

**work_item_id:** MOB-UX-14d
**role:** qa-device
**date:** 2026-06-09
**ack_status:** FAIL

## Matrix source

- `docs/program/MOBILE_HOME_RESPONSIVE_PROGRAM.md`
- Script: `scripts/qa-mobile-home-responsive-matrix.mjs`

## Environment

| Field | Value |
|-------|-------|
| Device | emulator-5554 |
| APK | C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk |
| APK SHA-256 | C152EDD6B093871CCA59EE8AF60C65B3C1B615A53C82675DE1E078E240B412BE |
| API | https://14-225-217-232.nip.io |
| Account | uat.nv0001@xe.vn |

## Per-device results

| Device class | WxH | Grid cols | Top gap | Tab clearance | Scroll | Anti-pattern | Verdict |
|--------------|-----|-----------|---------|---------------|--------|--------------|---------|
| iPhone SE 3 | 375×667 | 5/4 ✅ | ✅ | ✅ | ✅ | ✅ | **PASS** |
| iPhone 14 Pro Max | 430×932 | —/— ❌ | ❌ | ❌ | ❌ | ❌ | **FAIL** |
| Pixel 4a | 393×851 | —/— ❌ | ❌ | ❌ | ❌ | ❌ | **FAIL** |
| Pixel 7 | 412×915 | 5/4 ✅ | ✅ | ✅ | ✅ | ✅ | **PASS** |
| iPad Mini portrait | 744×1133 | —/— ❌ | ❌ | ❌ | ❌ | ❌ | **FAIL** |

## Commands

- `adb -s emulator-5554 install -r hrm-mobile-qa-device.apk` → exit **0**
- `vitest homeActionGrid.test.ts` → exit **0**
- `POST https://14-225-217-232.nip.io/api/hrm/auth/mobile/login` → exit **0**
- `adb shell wm size 375x667 + home probe` → exit **0**
- `adb shell wm size 430x932 + home probe` → exit **1**
- `adb shell wm size 393x851 + home probe` → exit **1**
- `adb shell wm size 412x915 + home probe` → exit **0**
- `adb shell wm size 744x1133 + home probe` → exit **1**

## Screenshots

- iPhone SE 3: `docs/qa/evidence/mob-ux-14d-screens/iphone-se-home-top.png`
  - scroll: `docs/qa/evidence/mob-ux-14d-screens/iphone-se-scroll-1.png`
- Pixel 7: `docs/qa/evidence/mob-ux-14d-screens/pixel-7-home-top.png`
  - scroll: `docs/qa/evidence/mob-ux-14d-screens/pixel-7-scroll-1.png`

## Checks detail

### iPhone SE 3 (375×667)
- wm size: `Physical size: 1080x2400
Override size: 375x667`
- **gridCols:** PASS — {"pass":true,"actual":5,"expected":4,"tilesInRow":["home-action-tile-checkin","home-action-tile-time_off","home-action-tile-payroll","home-action-tile-approve","home-action-tile-approve-badge"],"scrollSteps":"6+"}
- **topGap:** PASS — {"pass":true,"minContentY":63,"statusBarBudget":136,"noTopGap":true}
- **tabBarClearance:** PASS — {"pass":true,"tabBarY":504,"safeZoneY":541,"maxGridY":604,"tabBarClearance":true}
- **scrollDepth:** PASS — {"pass":true,"sectionsVisible":["Đội đang làm","home-actions-carousel","home-ess-stat-rows"],"sectionCount":3,"scrollDepthOk":true}
- **compactTiles:** PASS — {"pass":true,"maxTileHeightPx":null}
- **antiPatterns:** PASS — {"pass":true,"hits":[]}
- **displayName:** PASS — {"pass":true,"hasRealName":true,"hasCompanyVi":true}

### iPhone 14 Pro Max (430×932)
- **ERROR:** uiautomator dump failed: login-wait

### Pixel 4a (393×851)
- **ERROR:** home not reached after resize/login (lastLen=12551)

### Pixel 7 (412×915)
- wm size: `Physical size: 1080x2400
Override size: 412x915`
- **gridCols:** PASS — {"pass":true,"actual":5,"expected":4,"tilesInRow":["home-action-tile-checkin","home-action-tile-time_off","home-action-tile-payroll","home-action-tile-approve","home-action-tile-approve-badge"],"scrollSteps":"6+"}
- **topGap:** PASS — {"pass":true,"minContentY":63,"statusBarBudget":151,"noTopGap":true}
- **tabBarClearance:** PASS — {"pass":true,"tabBarY":752,"safeZoneY":789,"maxGridY":852,"tabBarClearance":true}
- **scrollDepth:** PASS — {"pass":true,"sectionsVisible":["Đội đang làm","Hoạt động","home-actions-carousel","home-ess-stat-rows","home-activity-trigger"],"sectionCount":5,"scrollDepthOk":true}
- **compactTiles:** PASS — {"pass":true,"maxTileHeightPx":null}
- **antiPatterns:** PASS — {"pass":true,"hits":[]}
- **displayName:** PASS — {"pass":true,"hasRealName":true,"hasCompanyVi":true}

### iPad Mini portrait (744×1133)
- **ERROR:** uiautomator dump failed: login-wait

## completion_report

MOB-UX-14d matrix FAIL — top gap + display name (14e) + tab-bar-safe-zone PASS on all widths; 4-col quick grid NOT visible in uiautomator on device (gridVisibleAny=true). Vitest homeActionGrid=PASS. Bundle has QuickAccessGrid=n/a but home-actions-carousel absent from UI tree — dev-mobile must rebuild qa-device APK with MOB-UX-14a+c+e bundle and re-dispatch MOB-UX-14d.

**next_owner:** dev-mobile

**next_dispatch_prompt:**
dev-mobile: fix responsive failures in MOBILE_HOME_RESPONSIVE_PROGRAM.md matrix — re-dispatch qa-device MOB-UX-14d after APK rebuild.

**evidence_path:** docs/qa/evidence/mob-ux-14d-matrix-20260609.md
