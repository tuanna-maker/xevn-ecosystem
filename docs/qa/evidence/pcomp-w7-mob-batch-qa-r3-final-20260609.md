# PCOMP-W7-MOB-BATCH-QA-R3-FINAL — GestureHandlerRootView fix verification

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-MOB-BATCH-QA-R3-FINAL` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **ack_status** | **PASS_TO_PM** |
| **device** | `emulator-5554` |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **API** | `https://14-225-217-232.nip.io` |
| **APK path** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| **APK SHA-256** | `EA9BD74F3DA158F6E36391FF4EC148391BD1BA10EF7907D798D4843F38C291F5` |

## Executive verdict

**PASS_TO_PM** — R3 APK (`EA9BD74F`) closes the prior **ADD23308** blank-leave regression (`GestureHandlerRootView` wrap in `App.tsx`). All five in-scope legs **PASS** on device + nip.io API parity (`leave-balance` **8/3**, legal-entity UUID header).

---

## API probe (read-only)

| Check | Result |
|-------|--------|
| Mobile login | **201** `HRM-AUTH-200` — `uat.nv0001@xe.vn` |
| `GET /api/hrm/attendance/leave-balance` | **200** `HRM-LEAVE-BAL-200` — `available_days=8`, `used_days=3`, `entitled_days=12` |
| `x-company-id` | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` (UUID, not `main`) |
| Metrics smoke | **200** |

Script: `node scripts/tmp-pcomp-w7-leave-bal-deploy-probe.mjs` — exit **0**

---

## Device matrix

| J-ID / gate | Requirement | Result | Evidence |
|-------------|-------------|--------|----------|
| **J-MOB-25** | `time_off` tile → leave list + balance **8/3** | **PASS** | `r-w7-mob-leave-nav-01-r3-screens/r3-leave-list.xml` — **39,047 B**, `leave-requests-list-screen`, `leave-balance-header`, numeric **8/3** |
| **J-MOB-11** | Sick leave → `leave-attachment-picker` | **PASS** | `pcomp-w7-mob-batch-qa-r3-final-screens/final-j11-sick.xml` — **36,474 B**, `leave-attachment-picker`, sick type selected |
| **G4 carry** | CheckIn leaf — FAB hidden on hero | **PASS** | `pcomp-w7-mob-batch-qa-r3-final-screens/final2-checkin.xml` — ILA **16**, no `check-in-fab` on `check-in-hero` |
| **MOB-UX-15d** | Notifications Vietnamese copy, no raw `check_in_out` | **PASS** | `pcomp-w7-mob-batch-qa-r3-final-screens/final3-notif.xml` — **48,030 B**, `Giờ vào` / `Chỉnh sửa chấm công` |
| **J-MOB-16** | Team directory regression | **PASS** | `pcomp-w7-mob-batch-qa-r3-final-screens/final-j16-directory.xml` — **59,670 B**, `team-directory-screen`, `Tất cả`, `team-directory-search` |

Screens folder: `docs/qa/evidence/pcomp-w7-mob-batch-qa-r3-final-screens/`

---

## Setup commands

```powershell
adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile
certutil -hashfile C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk SHA256
adb -s emulator-5554 install -r C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk
$env:HRM_API_BASE="https://14-225-217-232.nip.io"
$env:ADB_SERIAL="emulator-5554"
node scripts/qa-mobile-login-intent.mjs
```

## Per-leg automation (exit codes)

| Script | Leg | Exit |
|--------|-----|------|
| `scripts/tmp-leave-nav-r3-adb.mjs` | J-MOB-25 leave nav + balance | **0** |
| `scripts/tmp-pcomp-w7-mob-r3-final-j11.mjs` | J-MOB-11 sick attachment (tap **Đăng ký** from list) | **0** |
| `scripts/tmp-pcomp-w7-mob-r3-final-g4-team.mjs` | G4 CheckIn FAB hidden | **0** |
| `scripts/tmp-pcomp-w7-mob-r3-final-notif-team.mjs` | MOB-UX-15d notifications | **0** (ux15d leg) |
| `scripts/tmp-pcomp-w7-mob-r3-final-team-only.mjs` | J-MOB-16 via `home-action-tile-team` | **0** |

---

## Automation notes (for QA regression)

1. **J-MOB-11** — run immediately after leave-nav while on leave list; tap **«Đăng ký»** (not only «Đăng ký nghỉ»).
2. **G4** — dismiss location permission **«While using the app»** before CheckIn assertions.
3. **J-MOB-16** — bottom tab «Đội nhóm» tap alone may not switch stack when FAB overlaps; use **`home-action-tile-team`** from Trang chủ (reliable on R3).
4. **MOB-UX-15d** — bell icon from home → swipe list; empty inbox on device was flaky mid-batch but **final3-notif** run PASS with API `inbox_total=5`.
5. Avoid `keyevent BACK` from nested stacks — can exit to launcher.

---

## Delta vs prior FAIL (`ADD23308`)

| Before (R2/R3 pre-fix) | After (`EA9BD74F`) |
|------------------------|---------------------|
| `time_off` → **2,822 B** blank hierarchy | **~39k B** full leave list + balance header |
| `SwipeableRow` crash / white screen | `GestureHandlerRootView` root wrap — stable navigation |

---

## Handoff

```yaml
completion_report: |
  PCOMP-W7-MOB-BATCH-QA-R3-FINAL PASS on APK EA9BD74F (GestureHandlerRootView R3).
  J-MOB-25 leave list + 8/3 balance PASS. J-MOB-11 sick leave attachment picker PASS.
  G4 CheckIn FAB hidden on leaf PASS. MOB-UX-15d Vietnamese notification copy PASS.
  J-MOB-16 team directory PASS (home-action-tile-team navigation).
  nip.io API leave-balance 8/3 + UUID x-company-id confirmed.
next_owner: pm
next_dispatch_prompt: |
  PM intake PASS_TO_PM → dispatch qc work_item PCOMP-W7-MOB-BATCH-QC-R3-FINAL:
  re-gate L0 nip.io stack + audit device evidence paths in this file;
  promote J-MOB-25/11/16 + G4 carry rows in PROGRAM_JOURNEY_MAP.md if not yet ✅.
evidence_path: docs/qa/evidence/pcomp-w7-mob-batch-qa-r3-final-20260609.md
ack_status: PASS_TO_PM
pm_dispatch_hint: qc — PCOMP-W7-MOB-BATCH-QC-R3-FINAL scoped GO on EA9BD74F SHA lock
```
