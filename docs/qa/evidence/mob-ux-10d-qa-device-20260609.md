# MOB-UX-10d-QA — J-MOB-35 attendance timeline pills device L2.5 @ nip.io

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-UX-10d-QA` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **ack_status** | **PASS_TO_PM** (GO WITH CONDITIONS — pill visual blocked by pilot seed) |
| **upstream** | `mob-ux-10d-20260609.md` (dev-mobile READY_FOR_QA) |

---

## Executive verdict

**PASS_TO_PM** — APK SHA `DD5606E5…477D26` verified on `emulator-5554` @ `https://14-225-217-232.nip.io`. J-MOB-35 navigation **Chấm công → Lịch sử** PASS; history screen renders header «Lịch sử / 14 ngày gần nhất» and correct empty state when API `total=0`. Regressions **login gradient** (`branded-login-card`), **payslip hero** (`payslip-hero-card` + detail nav), **FAB** (`check-in-fab` sheet) PASS. UUID scope clean.

**GWC:** Pilot `GET /attendance/records` returns **0 rows** for `uat.nv0001@xe.vn` — colored pills (Đúng giờ / Đi muộn / Vắng mặt) and `attendance-timeline-badge` testID **not visually confirmed** on device. Mapper logic covered by dev-mobile vitest 223/223; device pill colors require **devops** attendance seed on nip.io.

---

## Environment

| Item | Value |
|------|-------|
| Device | `emulator-5554` (sdk_gphone64_x86_64) |
| APK | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| APK size | 72,329,598 B |
| SHA-256 | `DD5606E5DFFE928125AB2E95F77184C22E521C3CB0545DC27464895451477D26` |
| API | `https://14-225-217-232.nip.io` |
| Account | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| company_uuid | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` |
| Login | `xevn://qa-login` deep link |

---

## Commands (exit codes)

| Command | Exit | Result |
|---------|------|--------|
| `Get-FileHash … -Algorithm SHA256` | **0** | Matches `DD5606E5…477D26` |
| `adb shell pm clear vn.xevn.hrm.mobile` | **0** | Success |
| `adb install -r hrm-mobile-qa-device.apk` | **0** | Success |
| Cold start login screen probe | **0** | SET F-1 branded card visible |
| `node scripts/tmp-mob-ux-10d-qa-device.mjs` | **0** | Matrix below |
| API attendance probe (30d window) | **0** | `total=0`, `data=[]` |

---

## J-MOB-35 — Attendance timeline pills

| ID | Journey step | Result | Evidence |
|----|--------------|--------|----------|
| **NAV** | Tab **Chấm công** → button **Lịch sử →** → `AttendanceHistoryScreen` | **PASS** | `ux10d-checkin.xml`, `ux10d-attendance-history.xml` |
| **HEADER** | «Lịch sử» + «14 ngày gần nhất» | **PASS** | `ux10d-attendance-history.xml` |
| **EMPTY** | API `total=0` → «Chưa có bản ghi chấm công» + pull hint | **PASS** | `ux10d-attendance-history.xml` |
| **PILLS** | Rows show colored pill Đúng giờ / Đi muộn / Vắng mặt matching API | **GWC** | Pilot seed gap — 0 records; pills=0, `badgeTestId=false` |
| **API-PARITY** | UI empty state matches API empty envelope | **PASS** | No mismatch when `records=0` |

**testIDs on history screen:** header text present; `attendance-timeline-badge` not rendered (no rows).

---

## Regression spot

| Journey / ID | Result | Note |
|--------------|--------|------|
| **REG-LOGIN-GRADIENT** | **PASS** | `branded-login-card`, `login-xevn-logo`, `login-email`, `login-password`, `login-submit` — `ux10d-cold-login.xml` |
| **J-MOB-34 payslip hero** | **PASS** | `payslip-hero-card` present; Thực lĩnh + net amount; hero tap → detail — `ux10d-payslip-hero.xml`, `ux10d-hero-detail.xml` |
| **MOB-UX-10 FAB** | **PASS** | `check-in-fab` → «Thao tác nhanh» sheet + Chấm công — `ux10d-fab-sheet.xml` |

---

## Logcat / scope audit

| Check | Result |
|-------|--------|
| `x-company-id: main` in outbound logcat | **false** (PASS) |
| company_uuid on session | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` |
| Fatal exception on boot/login | **false** |

---

## Artifacts

| Path | Description |
|------|-------------|
| `docs/qa/evidence/mob-ux-10d-qa-device-20260609.json` | Machine verdict JSON |
| `docs/qa/evidence/mob-ux-10d-screens/` | UI XML dumps (ux10d-*) |
| `scripts/tmp-mob-ux-10d-qa-device.mjs` | Primary repro automation |

---

## Residual / GWC

| ID | Item | Owner | Trigger |
|----|------|-------|---------|
| **D-MOB-UX-10d-01** | Pilot `attendance_records=0` for `uat.nv0001` — pill colors not device-verified | **devops** | Seed ≥3 rows (present/late/absent) on nip.io HRM DB for UAT0001 employee UUID |
| **D-MOB-UX-10d-02** | Re-run qa-device J-MOB-35 pill visual after seed | **qa-device** | After D-MOB-UX-10d-01 closed |
| **R-UX-10d-02** | Row tap → day detail stub Phase 2 (benchmark) | PM | Unchanged from dev-mobile handoff |

---

## Handoff

**completion_report:** MOB-UX-10d-QA device wave complete on SHA `DD5606E5…477D26`. J-MOB-35 path Chấm công → Lịch sử PASS with correct empty state @ nip.io (`attendance/records total=0`). Login gradient, payslip hero (J-MOB-34), FAB regressions PASS. UUID scope clean. **GWC:** colored timeline pills not device-verified — pilot lacks attendance seed for `uat.nv0001@xe.vn`; dev-mobile vitest 223/223 covers mapper.

**next_owner:** `pm`

**next_dispatch_prompt:** Intake MOB-UX-10d-QA PASS_TO_PM (GWC). Dispatch **devops** `D-MOB-UX-10d-01` — seed `attendance_records` (present/late/absent mix, last 14d) for `uat.nv0001@xe.vn` employee on nip.io pilot DB; then **qa-device** retest J-MOB-35 pill visual only. If QC wave: note J-MOB-35 device 🟡 until seed closed. Optional: dispatch **qc** scoped GO WITH CONDITIONS on MOB-UX-10d navigation + regression PASS.

**evidence_path:** `docs/qa/evidence/mob-ux-10d-qa-device-20260609.md`

**ack_status:** **PASS_TO_PM**
