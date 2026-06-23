# MOB-UX-15a-QA — InApp Notifications device sanitization (J-MOB-13 ext)

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-UX-15a-QA` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **ack_status** | **PASS_TO_PM** |
| **upstream** | `docs/qa/evidence/mob-ux-15a-20260609.md` (READY_FOR_QA) |

---

## Executive verdict

**PASS_TO_PM** — MOB-UX-15a InApp Notifications screen verified on `emulator-5554` @ `https://14-225-217-232.nip.io`. Persona `uat.nv0001@xe.vn`; inbox API total=4, unread=4. Navigation: `home-top-bar-bell`. APK SHA `FD7F5EB8840C…` matches entry gate.

Sponsor anti-patterns absent: no raw `event_type`, no ISO timestamps, no UC-HRM/Socket/debug panels; Vietnamese copy + «Chưa đọc» badge confirmed.

---

## Environment

| Item | Value |
|------|-------|
| Device | `emulator-5554` (sdk_gphone64_x86_64) |
| APK | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| APK size | 69,120,116 B |
| SHA-256 | `FD7F5EB8840C9704C53690700638F80DD5729487EA0C09BD423DCF293D5A98A1` |
| API | `https://14-225-217-232.nip.io` |
| Account | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| company_uuid | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` |
| Inbox (device UI) | 6 rows — leave + attendance copy; all «Chưa đọc» |
| Navigation | home-top-bar-bell → Profile stack Notifications |

---

## Commands (exit codes)

| Command | Exit | Result |
|---------|------|--------|
| `Get-FileHash hrm-mobile-qa-device.apk -Algorithm SHA256` | 0 | FD7F5EB8840C9704… |
| `adb shell pm clear vn.xevn.hrm.mobile` | 0 | Success |
| `adb install -r hrm-mobile-qa-device.apk` | 0 | Success |
| `node scripts/tmp-mob-ux-15a-qa-device.mjs` | 0 | PASS_TO_PM |

---

## MOB-UX-15a acceptance checks

| ID | Check | Result | Note |
|----|-------|--------|------|
| AC-15a-01 | Stack title «Thông báo» only — no UC-HRM prefix | **PASS** | ucPrefix=false |
| AC-15a-ANTI | NO raw event_type in UI text | **PASS** | absent |
| AC-15a-ANTI | NO ISO timestamp visible | **PASS** | absent |
| AC-15a-ANTI | NO Socket.IO debug copy | **PASS** | absent |
| AC-15a-ANTI | NO WEBHOOK env leak | **PASS** | absent |
| AC-15a-ANTI | NO system summary debug card | **PASS** | absent |
| AC-15a-ANTI | NO Realtime debug card | **PASS** | absent |
| AC-15a-ANTI | NO employee UUID error | **PASS** | absent |
| AC-15a-ANTI | NO API: footer | **PASS** | absent |
| AC-15a-ANTI | NO wrong badge «Chờ duyệt» | **PASS** | absent |
| AC-15a-ANTI | NO raw leave_request.* string | **PASS** | absent |
| AC-15a-ANTI | NO raw service_request.created | **PASS** | absent |
| AC-15a-02 | Badge «Chưa đọc» or «Đã đọc» (not Chờ duyệt) | **PASS** | unread=true read=false |
| AC-15a-03 | Row title Vietnamese (not raw event_type) | **PASS** | vi copy present |
| AC-15a-04 | Formatted/relative time — no ISO T-string | **PASS** | relative=true iso=false |
| AC-SCOPE | No x-company-id: main in logcat | **PASS** | main=false |
| AC-FATAL | No fatal crash on session | **PASS** | fatal=false |

---

## Sponsor screenshot comparison (anti-patterns)

| Anti-pattern (sponsor) | Device result |
|--------------------------|---------------|
| `UC-HRM-MOB-13 — Thông báo` title | PASS — absent |
| Socket.IO / Expo push subtitle | PASS — absent |
| Raw `leave_request.created` / `service_request.created` | PASS — absent |
| ISO `2026-…T…` timestamp | PASS — absent |
| Badge «Chờ duyệt» on unread | PASS — «Chưa đọc» used |
| Realtime / Tóm tắt hệ thống / env footer | PASS — absent |

---

## Artifacts

| Path | Description |
|------|-------------|
| `docs/qa/evidence/mob-ux-15a-qa-device-20260609.json` | Machine verdict JSON |
| `docs/qa/evidence/mob-ux-15a-screens/` | UI XML dumps + PNG |
| `scripts/tmp-mob-ux-15a-qa-device.mjs` | Repro automation |

Screenshot: `docs/qa/evidence/mob-ux-15a-screens/15a-notifications-screen.png`

---

## Residual (not MOB-13 debug shell)

| ID | Item | Severity | Owner | Notes |
|----|------|----------|-------|-------|
| R-15a-LOG-01 | React Native **LogBox** «Require cycle: teamDirectory.ts» overlay at bottom | P2 / GWC | dev-mobile | Global bundler warning — **not** InAppNotifications Realtime/Tóm tắt cards (removed). Visible in screenshot + uiautomator XML. |
| R-15a-COPY-01 | Attendance subtitle shows raw `check_in_out` token | P3 | dev-mobile | «Huỳnh Văn An · check_in_out» — map `update_type` to Vietnamese in `inboxNotificationCopy` |

In-screen MOB-UX-15a anti-patterns (UC-HRM title, Socket.IO, raw `event_type`, ISO `T` string, «Chờ duyệt» badge, Realtime/Tóm tắt cards) — **all PASS**.

---

## Handoff

**completion_report:** MOB-UX-15a-QA device PASS — Thông báo screen @ nip.io for uat.nv0001: stack title «Thông báo», Vietnamese row titles (Đơn nghỉ / Chỉnh sửa chấm công), «Chưa đọc» badges, formatted dates + relative time; no raw `event_type`, ISO `T` strings, UC-HRM/Socket/Realtime/Tóm tắt debug cards. Residual: LogBox «Require cycle teamDirectory.ts» overlay (R-15a-LOG-01) + `check_in_out` subtitle token (R-15a-COPY-01) — out of MOB-13 shell scope, QC may GWC.

**next_owner:** `pm`

**next_dispatch_prompt:** PM intake MOB-UX-15a-QA PASS_TO_PM → dispatch **qc** scoped gate on MOB-UX-15a (J-MOB-13 notifications sanitization); update PROGRAM_JOURNEY_MAP if J-MOB-13 row pending; chain MOB-UX-15b/15c per backlog.

**evidence_path:** `docs/qa/evidence/mob-ux-15a-qa-device-20260609.md`

**ack_status:** `PASS_TO_PM`
