# MOB-UX-17 — Home no announcements list (Hướng 1)

**work_item_id:** MOB-UX-17-HOME-NO-ANNOUNCEMENTS  
**date:** 2026-06-09  
**owner:** dev-mobile  
**ack_status:** READY_FOR_QA

## Sponsor lock

Remove «Thông báo» announcements list from Home scroll. Notifications only via TopBar bell + `InAppNotificationsScreen`. Rationale: `mapFallbackAnnouncements` duplicated leave/attendance inbox on Home (ILA-01/03). Ref: `docs/program/MOBILE_UI_LAYOUT_COMPOSITION_AUDIT.md` §3.1.

## Changes

| File | Change |
|------|--------|
| `dashboardPersonaLayout.ts` | Removed `announcements` from `HomeSectionKey` and `BELOW_FOLD_TAIL` |
| `DashboardScreen.tsx` | Removed `AnnouncementsSection` import and `case 'announcements'` render |
| `dashboardEssLoad.ts` | Removed announcements/inbox fetch from ESS slice; dropped `inboxRows` param |
| `mobUx14b.test.ts` | Assert `sectionOrder` excludes `announcements` |
| `dashboardPersonaLayout.test.ts` | Same assertion for EMP persona |

**Preserved:** `AnnouncementsSection.tsx`, `InAppNotificationsScreen`, `goNotifications()`, `onNotificationsPress` / bell badge unchanged.

## Verification

```text
pnpm run verify:mobile:layout  → exit 0
pnpm run test:hrm-mobile       → 75 files, 419 tests PASS
```

## QA device spot (next)

1. Login `uat.nv0001@xe.vn` (or matrix account).
2. Home scroll: **no** «Thông báo» section with list rows below fold.
3. TopBar bell tap → `InAppNotificationsScreen` opens with inbox list.
4. Bell badge still reflects unread count when inbox has items.

## Residual

- J-MOB-22 journey map row may need BA/QA update: announcements no longer on Home; bell + Notifications screen is canonical path.
- `dashboardEss.ts` helper functions (`filterAnnouncementInboxRows`, `mapFallbackAnnouncements`) retained for potential reuse / unit tests; not loaded on Home.
