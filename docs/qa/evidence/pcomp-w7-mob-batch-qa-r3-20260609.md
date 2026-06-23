# PCOMP-W7-MOB-BATCH-QA-R3 — leave nav + balance + J-MOB-16 regression

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-MOB-BATCH-QA-R3` |
| **carry** | `P1-G4-CARRY-REGRESS` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **ack_status** | **FAIL_TO_PM** |
| **device** | `emulator-5554` |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **API** | `https://14-225-217-232.nip.io` |
| **APK SHA-256** | `ADD233085F57CE8DBD87F29E3D63CA6408E0D8E35F55671B4640763CD4FA3B02` |

## Executive verdict

**FAIL_TO_PM (GWC partial)** — nip.io API **PASS** (`leave-balance` **8/3**, legal-entity UUID header). **J-MOB-25 / J-MOB-11 FAIL** — `home-action-tile-time_off` @ **(413,517)** routes to **blank white screen** (**2822 B** empty hierarchy); `leave-requests-list-screen` / `leave-balance-header` not reachable. **J-MOB-16 PASS** (Đội nhóm tab, **213** rows). G4 carry spot-check **PASS** on same SHA — see [`p1-g4-carry-regress-20260609.md`](p1-g4-carry-regress-20260609.md).

**pm_dispatch_hint:** `dev-mobile` **R-W7-MOB-LEAVE-NAV-01-R2** — no published R2 evidence; leave list blank persists on `ADD233085`; do **not** dispatch `PCOMP-W7-BE-LEAVE-DOC` until attachment UI reachable.

---

## API probe (read-only)

| Check | Result |
|-------|--------|
| Mobile login | **200** `uat.nv0001@xe.vn` |
| `GET /api/hrm/attendance/leave-balance` | **200** — `available=8`, `used=3` |
| `x-company-id` | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` (UUID, not `main`) |

---

## Device matrix

| J-ID / gate | Requirement | Result | Evidence |
|-------------|-------------|--------|----------|
| **J-MOB-11** | Home `time_off` tile → leave list | **FAIL** | `r3-leave-correct.xml` — **2822 B** blank Profile stack |
| **J-MOB-25** | Balance header **8/3** | **FAIL** | Not reachable (list blank) |
| **J-MOB-11** attachment | Sick leave → `leave-attachment-picker` | **FAIL** | Not reachable |
| **J-MOB-16** | Directory / Đội nhóm regression | **PASS** | `r3-team.xml` — **59,345 B**, `213` / `Tất cả` |
| **R3-CHECKIN-FAB-01** (G4 carry) | No FAB on CheckIn | **PASS** | `r3-checkin.xml` — ILA **16/20** |
| **MOB-UX-15d** (G4 carry) | No raw `check_in_out` | **PASS** | `r3-notif-manual.xml` |

Screens: `docs/qa/evidence/pcomp-w7-mob-batch-qa-r3-screens/`

---

## Root cause (device)

Same failure class as [`pcomp-w7-mob-batch-qa-r2-20260609.md`](pcomp-w7-mob-batch-qa-r2-20260609.md): `TabProfile` → `LeaveRequestsList` renders empty `FrameLayout` after `profileStackNav` merge fix on prior SHA. Current APK `ADD233085` does **not** close the gap. Occasional launcher redirect when tap coordinates wrong (automation); confirmed blank at correct tile **(413,517)**.

---

## Commands

```powershell
adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile
adb -s emulator-5554 install -r C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk
$env:HRM_API_BASE="https://14-225-217-232.nip.io"
$env:ADB_SERIAL="emulator-5554"
node scripts/qa-mobile-login-intent.mjs
node scripts/tmp-p1-g4-carry-regress-r3-device.mjs   # exit 1 — leave leg FAIL
adb -s emulator-5554 shell input tap 413 517         # manual confirm leave blank
```

| Command | Exit |
|---------|------|
| `qa-mobile-login-intent.mjs` | **0** |
| `tmp-p1-g4-carry-regress-r3-device.mjs` | **1** |

---

## Handoff

```yaml
completion_report: |
  PCOMP-W7-MOB-BATCH-QA-R3 FAIL_TO_PM on APK ADD233085. API leave-balance 8/3 PASS.
  J-MOB-11/25 FAIL — time_off tile → 2822B blank leave screen. J-MOB-11 attachment not exercised.
  J-MOB-16 directory PASS (213 rows). G4 carry CheckIn FAB + MOB-UX-15d PASS on same SHA.
next_owner: dev-mobile
next_dispatch_prompt: |
  Task dev-mobile R-W7-MOB-LEAVE-NAV-01-R2: fix TabProfile→LeaveRequestsList blank screen on qa-device APK;
  publish r-w7-mob-leave-nav-01-r2 evidence with new SHA; handoff qa-device for R3 retest J-MOB-11/25 only.
evidence_path: docs/qa/evidence/pcomp-w7-mob-batch-qa-r3-20260609.md
ack_status: FAIL_TO_PM
pm_dispatch_hint: dev-mobile R-W7-MOB-LEAVE-NAV-01-R2 — leave blank 2822B on ADD233085; J-MOB-16 regression PASS
```
