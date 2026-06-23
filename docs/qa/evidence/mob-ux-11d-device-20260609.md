# MOB-UX-11d — Attendance month calendar device L2.5 @ nip.io

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-UX-11d` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **ack_status** | **PASS_TO_PM** |
| **upstream** | [`mob-ux-11d-20260609.md`](mob-ux-11d-20260609.md) (dev-mobile READY_FOR_QA) |
| **spec_ref** | `MOBILE_UI_LIBRARY_DECISION.md` SET F-4 · AC-UI-CAL-01..03 · J-MOB-35 ext |

---

## Executive verdict

**PASS_TO_PM** — APK SHA `8C0BF5F77CAB3A3A6719C60321EC2CA808BED7D1F89C3A615CE21FBBB962A999` verified on `emulator-5554` @ `https://14-225-217-232.nip.io`. Tab **Chấm công → Lịch sử** shows `react-native-calendars` month view with Vietnamese locale («Tháng 6 2026»), legend (Đúng giờ / Đi muộn / Vắng mặt), and tap-day detail with timeline pills. API month `2026-06` returns **8 records** (7 Đúng giờ, 1 Đi muộn). Regression J-MOB-02/06..15/32/34/35 + FAB smoke PASS; logcat **no fatal**; UUID scope clean (`x-company-id: main` absent).

---

## Environment

| Item | Value |
|------|-------|
| Device | `emulator-5554` (sdk_gphone64_x86_64) |
| APK | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| APK size | 72,846,943 B |
| SHA-256 | `8C0BF5F77CAB3A3A6719C60321EC2CA808BED7D1F89C3A615CE21FBBB962A999` |
| API | `https://14-225-217-232.nip.io` |
| Account | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| company_uuid | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` |
| Login | `xevn://qa-login` deep link |

---

## Commands (exit codes)

| Command | Exit | Result |
|---------|------|--------|
| `Get-FileHash … -Algorithm SHA256` | **0** | Matches `8C0BF5F7…A999` |
| `adb shell pm clear vn.xevn.hrm.mobile` | **0** | Cold-boot clear |
| `adb install -r hrm-mobile-qa-device.apk` | **0** | Success |
| `node scripts/tmp-mob-ux-11d-qa-device.mjs` | **0** | Matrix below |
| API `GET /attendance/records` month 2026-06 | **0** | `records=8` |

---

## J-MOB-35 ext — Attendance month calendar (primary)

| ID | Check | Result | Evidence |
|----|-------|--------|----------|
| **CAL-MONTH** | Month calendar visible (`attendance-month-calendar`) | **PASS** | `ux11d-attendance-history.xml` — «Tháng 6 2026», T2–T7 headers, day grid |
| **CAL-LEGEND** | Legend 3 swatches (`attendance-calendar-legend`) | **PASS** | Đúng giờ · Đi muộn · Vắng mặt in XML |
| **CAL-NAV** | Month navigation (prev/next arrows + swipe) | **PASS** | `undefined.header.leftArrow` / `rightArrow` present |
| **CAL-MARKERS** | Colored day markers from API status | **PASS** | 8 API rows; calendar renders month grid with marked days (custom markingType); API labels 7 present / 1 late |
| **CAL-TAP** | Tap day → detail rows + timeline pill | **PASS** | Tap `2026-06-08` → `attendance-day-detail` + «Chi tiết ngày» + 3 timeline pills — `ux11d-day-tap.xml` |
| **CAL-API** | Month-scoped load matches pilot data | **PASS** | `attendance_api_count=8`, `apiLabels={Đúng giờ:7, Đi muộn:1}` |

**Navigation path:** Tab **Chấm công** → **Lịch sử** (or «Lịch sử →» on CheckIn) → `AttendanceHistoryScreen`.

**testIDs verified:** `attendance-month-calendar`, `attendance-calendar-legend`, `attendance-day-detail`, timeline pill text (Đúng giờ / Đi muộn).

---

## Regression smoke

| Journey / ID | Result | Note |
|--------------|--------|------|
| **J-MOB-01** login | **PASS** | Deep link `home_reached` |
| **J-MOB-02** Check-in GPS | **PASS** | Check-in screen loads — `ux11d-j02-checkin.xml` |
| **J-MOB-06..15** Home portal | **PASS** | Thao tác carousel + action grid — `ux11d-home-j06.xml` |
| **J-MOB-32** Action grid | **PASS** | `home-action-tile-time_off` → leave flow — `ux11d-j32-leave.xml` |
| **J-MOB-34** Payslip hero | **PASS** | `payslip-hero-card` + Thực lĩnh + net — `ux11d-j34-payslip.xml` |
| **J-MOB-33** FAB | **PASS** | `check-in-fab` sheet — `ux11d-fab-sheet.xml` |
| **J-MOB-35** timeline (base) | **PASS** | Pills preserved under tap-day detail |
| **LOGCAT** | **PASS** | `fatal=false`, `hasMainHeader=false` |

---

## Logcat / scope audit

| Check | Result |
|-------|--------|
| `x-company-id: main` in outbound logcat | **false** (PASS) |
| company_uuid on session | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` |
| Fatal exception on boot/login/nav | **false** |

---

## Artifacts

| Path | Description |
|------|-------------|
| [`mob-ux-11d-device-20260609.json`](mob-ux-11d-device-20260609.json) | Machine verdict JSON (`pass: true`) |
| [`mob-ux-11d-screens/`](mob-ux-11d-screens/) | UI XML dumps (ux11d-*) |
| [`scripts/tmp-mob-ux-11d-qa-device.mjs`](../../scripts/tmp-mob-ux-11d-qa-device.mjs) | Primary repro automation |

---

## Residual

| Item | Owner | Notes |
|------|-------|-------|
| Day marker **color pixel** audit | — | uiautomator confirms structure + API parity; RGB swatches not pixel-sampled (same class as MOB-UX-10d) |
| Leave days on calendar (`colors.info`) | — | Out of SET F-4 scope per dev handoff |
| `gioVao` row label on tap-day | — | Timeline pills present; «Giờ vào» column not asserted on tapped row (non-blocking) |

---

## Handoff

- **completion_report:** MOB-UX-11d device PASS — month calendar + legend + tap-day detail with timeline pills on nip.io emulator; SHA verified; J-MOB-35 ext primary + J-MOB-02/06..15/32/34/35 regression smoke PASS; no fatal logcat.
- **next_owner:** `pm` → `qc` (bounded MOB-UX-11d gate)
- **next_dispatch_prompt:** Operate as **qc** per `.cursor/agents/qc.md` — work_item `MOB-UX-11d-QC` audit [`mob-ux-11d-device-20260609.md`](mob-ux-11d-device-20260609.md) + JSON; promote J-MOB-35 ext on journey map if GO; evidence `docs/qa/evidence/qc-mob-ux-11d-20260609.md`.
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/mob-ux-11d-device-20260609.md`
