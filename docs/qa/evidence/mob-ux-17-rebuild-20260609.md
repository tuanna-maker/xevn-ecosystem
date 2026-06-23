# MOB-UX-17 — Fresh qa-device APK rebuild (no Home announcements list)

**work_item_id:** MOB-UX-17-HOME-NO-ANNOUNCEMENTS-REBUILD  
**date:** 2026-06-09  
**owner:** dev-mobile  
**ack_status:** READY_FOR_QA  
**qa_handoff:** MOB-UX-17-QA-R2

## Context

QA FAIL **D-MOB-UX17-APK-01** — installed APK still showed Home «Thông báo» list section; source already had MOB-UX-17 (announcements removed from `BELOW_FOLD_TAIL` + `DashboardScreen`). Root cause: stale bundle on device APK.

## Source confirmation (MOB-UX-17)

| Check | Result |
|-------|--------|
| `BELOW_FOLD_TAIL` in `dashboardPersonaLayout.ts` | No `announcements` key — only `hero_carousel`, `culture_strip`, `journey_timeline`, `celebrations`, `whos_out`, `ess_date_bar`, `ess_stats` |
| `DashboardScreen.tsx` | No `AnnouncementsSection` import / `case 'announcements'` |
| Fresh bundle | No `AnnouncementsSection` / `Chưa có thông báo mới` strings in `index.android.bundle` |

## Build

```text
cd C:\xevn-ecosystem\apps\mobile\hrm-mobile
GRADLE_USE_SUBST=1 pnpm run android:apk:qa-device
```

| Artifact | Value |
|----------|-------|
| Path | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| Size | 69,132,861 B (~65.9 MiB) |
| SHA-256 | `C152EDD6B093871CCA59EE8AF60C65B3C1B615A53C82675DE1E078E240B412BE` |
| BUILD_TARGET | qa-device (`QA_DEV_LOGIN=1`, `QA_DEEP_LINK=1`) |

## Install + device spot (emulator-5554)

```text
adb -s emulator-5554 install -r dist/hrm-mobile-qa-device.apk
adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile
node scripts/qa-mobile-login-intent.mjs  → home_reached=true, fatal_logcat=false
```

### Home scroll — no announcements list (adb uiautomator)

| Dump | `Thông báo` text/desc | `Chưa có thông báo mới` | `Xem thông báo` |
|------|----------------------|-------------------------|-----------------|
| home-top (above fold) | 1 (TopBar bell a11y only) | 0 | 0 |
| home-scrolled (3× swipe) | 0 | 0 | 0 |

**PASS:** No Home list section; bell-only path to notifications preserved.

## Automated gates

```text
pnpm run verify:mobile:layout  → exit 0
pnpm run test:hrm-mobile       → 75 files, 419 tests PASS
```

## QA R2 checklist (MOB-UX-17-QA-R2)

1. Install APK SHA `C152EDD6…412BE` (not prior pins).
2. `pm clear` before login.
3. Home scroll full depth: **no** «Thông báo» section with inbox rows / empty-state «Chưa có thông báo mới».
4. TopBar bell → `InAppNotificationsScreen` with inbox list.
5. J-MOB-22: announcements canonical path = bell + Notifications screen (not Home scroll).

## Residual

- Quick-access grid tile `notifications` label «Thông báo» may still appear in action grid (nav shortcut, not duplicate inbox list). Sponsor Hướng 1 targeted scroll list only.
