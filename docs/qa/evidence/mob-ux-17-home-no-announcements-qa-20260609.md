# MOB-UX-17-HOME-NO-ANNOUNCEMENTS-QA — device spot-check

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-UX-17-HOME-NO-ANNOUNCEMENTS-QA` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **ack_status** | **FAIL** |
| **device** | `emulator-5554` |
| **api_base** | `https://14-225-217-232.nip.io` |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |

---

## Executive verdict

**FAIL** — TopBar bell + `InAppNotificationsScreen` **PASS**, but Home scroll still renders legacy **«Thông báo»** list section (badge **3**, **Xem tất cả**, inbox-style rows). Source tree has MOB-UX-17 removal (`announcements` absent from `dashboardPersonaLayout.ts` / `DashboardScreen.tsx`); installed qa-device APK bundle appears **stale** vs workspace JS.

| # | Check | Verdict | Evidence |
|---|-------|---------|----------|
| 1 | Login `uat.nv0001@xe.vn` @ nip.io | **PASS** | `qa-mobile-login-intent.mjs` exit **0**, `home_reached=true` |
| 2 | Home scroll — **no** «Thông báo» section with list rows | **FAIL** | `ux17-pre-bell.xml` — `text="Thông báo"` + badge `3` + `Xem tất cả` + rows `Đơn nghỉ đã duyệt`, `Đơn nghỉ phép`, `Chấm công` |
| 3 | TopBar bell → `InAppNotificationsScreen` | **PASS** | Tap `content-desc="Thông báo"` @ (980,186) → `ux17-notifications.xml` title + inbox rows |
| 4 | Bell badge when unread | **GWC** | API inbox `total=20` (`HRM-NOTIF-200`); **no** numeric badge on TopBar bell in `ux17-bell-home.xml` (`HomeTopBar.tsx` has no badge prop) |

---

## APK / install

| Check | Result |
|-------|--------|
| Path | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| Bytes | **69,135,844** |
| SHA-256 | `91AC496FB94D672E11348BBE85A23526C6D4BF4D26113BB4DDF7080DC29538AD` |
| `pm clear` + `install -r` | exit **0** |

---

## Commands

```powershell
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
$apk = "apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk"

Get-FileHash $apk -Algorithm SHA256
& $adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile
& $adb -s emulator-5554 install -r $apk

node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026
# exit 0

node scripts/tmp-mob-ux-17-home-no-announcements-qa-device.mjs
# partial — bell re-tap completed manually after scroll-to-top

node scripts/tmp-mob-ux-17-parse.mjs
```

Machine JSON: [`mob-ux-17-home-no-announcements-qa-20260609.json`](mob-ux-17-home-no-announcements-qa-20260609.json)  
Screens/XML: `docs/qa/evidence/mob-ux-17-screens/`

---

## API probe

| Endpoint | HTTP | Notes |
|----------|------|-------|
| `POST /auth/mobile/login` | **201** | `uat.nv0001@xe.vn` |
| `GET /notifications/inbox` | **200** | `HRM-NOTIF-200`, `total=20` |

---

## Root cause (device)

- Workspace source: `sectionOrder` excludes `announcements`; no `AnnouncementsSection` render path in `DashboardScreen.tsx`.
- Device UI after 8× scroll: still shows `AnnouncementsSection` pattern below `ess_stats` — **JS bundle in APK not rebuilt after MOB-UX-17** (or wrong artifact installed).

---

## Residual / PM dispatch

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| **D-MOB-UX17-APK-01** | P0 | `dev-mobile` | Rebuild `hrm-mobile-qa-device.apk` post MOB-UX-17; confirm `pnpm run verify:mobile:layout` + device re-spot |
| **D-MOB-UX17-BELL-01** | P2 | `dev-mobile` | Dev handoff claims bell badge preserved; `HomeTopBar` has no unread badge — implement or update AC |

---

## completion_report

Closed: login smoke, bell navigation, inbox API probe, XML/screenshot evidence.  
**Open:** Home scroll still shows removed announcements section on device — **blocker** for MOB-UX-17 closure.

## next_owner

`dev-mobile` (APK rebuild) → `qa-device` re-spot → `pm`

## next_dispatch_prompt

```
work_item_id: MOB-UX-17-HOME-NO-ANNOUNCEMENTS-REBUILD
Rebuild qa-device APK after MOB-UX-17 (announcements removed from HomeSectionKey). Run BUILD_TARGET=qa-device bundle + install on emulator-5554. Handoff READY_FOR_QA with new APK SHA. Evidence: docs/qa/evidence/mob-ux-17-home-no-announcements-20260609.md + docs/qa/evidence/mob-ux-17-home-no-announcements-qa-20260609.md (FAIL root cause D-MOB-UX17-APK-01).
```
