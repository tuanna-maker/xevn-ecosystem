# PCOMP-W7-MOB-BATCH-QA-R2 — Leave nav + J-MOB-11/25 device retest

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-MOB-BATCH-QA-R2` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-09 (retest ~10:04 UTC) |
| **ack_status** | **FAIL_TO_PM** (GWC partial — leave blocked; G4 carry PASS) |
| **device** | `emulator-5554` (`sdk_gphone64_x86_64`, 1080×2400) |
| **api_base** | `https://14-225-217-232.nip.io` |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **APK** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` (69,150,021 B) |
| **SHA-256** | `F813668A86D6FF62628AAFC1ADB3A824E86224B9C2BF348CEF37367F230541AE` |
| **upstream** | [`r-w7-mob-leave-nav-01-20260609.md`](r-w7-mob-leave-nav-01-20260609.md) · [`p1-g4-carry-bundle-20260609.md`](p1-g4-carry-bundle-20260609.md) |

---

## Executive verdict

**FAIL_TO_PM (GWC partial)** — APK SHA `F813668A…` installed and verified. nip.io API **PASS** (`leave-balance` 8/3, `x-company-id` UUID). **J-MOB-25 / J-MOB-11 FAIL** — `home-action-tile-time_off` still routes to **blank white screen** (2822 B empty hierarchy); `leave-requests-list-screen` / `leave-balance-header` not reachable. **J-MOB-16 regression PASS** via bottom tab Đội nhóm (213 rows). G4 carry (CheckIn FAB + MOB-UX-15d) **PASS** — see [`p1-g4-carry-qa-20260609.md`](p1-g4-carry-qa-20260609.md).

**pm_dispatch_hint:** `dev-mobile` **R-W7-MOB-LEAVE-NAV-01-R2** — Profile-stack `LeaveRequestsList` blank on F813668A despite `profileStackNav` merge fix; do **not** dispatch `PCOMP-W7-BE-LEAVE-DOC` until attachment UI reachable.

---

## Environment & commands

```powershell
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
$apk = "C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk"

Get-FileHash $apk -Algorithm SHA256
& $adb -s emulator-5554 shell wm size reset
& $adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile
& $adb -s emulator-5554 install -r $apk
& $adb -s emulator-5554 shell pm grant vn.xevn.hrm.mobile android.permission.ACCESS_FINE_LOCATION

node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026
node scripts/tmp-pcomp-w7-mob-batch-qa-r2-device.mjs
```

Machine JSON: [`pcomp-w7-mob-batch-qa-r2-20260609.json`](pcomp-w7-mob-batch-qa-r2-20260609.json)  
Screens/XML: `docs/qa/evidence/pcomp-w7-mob-batch-qa-r2-screens/`

---

## API probe (nip.io)

| Endpoint | HTTP | Notes |
|----------|------|-------|
| `POST /auth/mobile/login` | **201** | `uat.nv0001@xe.vn` |
| `GET /attendance/leave-balance` (annual, 2026) | **200** | `available_days=8`, `used_days=3` |
| `x-company-id` | UUID | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` ≠ `main` |

---

## Journey verdicts

| ID / check | Verdict | Device evidence |
|------------|---------|-----------------|
| **home-action-tile-time_off → leave list** | **FAIL** | `r2-leave-final.xml` **2822 B** — empty `action_bar_root`; no `leave-requests-list-screen` |
| **J-MOB-25** balance 8/3 | **FAIL** | API 8/3 OK; UI header `Còn lại` / `Đã dùng` not rendered (nav blocker) |
| **J-MOB-11** sick-leave attachment | **FAIL** | `leave-attachment-picker` unreachable — create flow blocked |
| **J-MOB-16** directory regression | **PASS** | `r2-team.xml` 44,665 B — `213` team count via tab Đội nhóm |
| **Duyệt tile** | **FAIL** | Same blank 2822 B pattern (`r2-approvals2.xml`) — Profile-stack `ManagerApprovals` |

### Leave blank-screen signature

Same as R1 [`pcomp-w7-mob-batch-qa-20260609.md`](pcomp-w7-mob-batch-qa-20260609.md): after tile tap, hierarchy collapses to status bar + empty content frame. Bottom-tab navigation (Đội nhóm, Thông báo bell) **works** — failure is **nested TabProfile / stack push from dashboard tiles**.

---

## Handoff

```yaml
completion_report: |
  PCOMP-W7-MOB-BATCH-QA-R2 FAIL_TO_PM (GWC). APK SHA F813668A installed @ emulator-5554.
  J-MOB-25/11 FAIL — home-action-tile-time_off → blank 2822B XML (leave nav regression persists on F813).
  API leave-balance 8/3 PASS; attachment BE not exercised. J-MOB-16 team tab PASS (213 rows).
  G4 carry bundle PASS separately (p1-g4-carry-qa-20260609.md): CheckIn FAB hidden + sticky footer ILA≥16; MOB-UX-15d vi copy on Thông báo.
next_owner: pm
next_dispatch_prompt: |
  Task dev-mobile — work_item_id R-W7-MOB-LEAVE-NAV-01-R2.
  Entry: docs/qa/evidence/pcomp-w7-mob-batch-qa-r2-20260609.md — TabProfile→LeaveRequestsList blank on SHA F813668A after home-action-tile-time_off (2822B).
  Exit: tile opens leave-requests-list-screen + leave-balance-header with Còn lại/Đã dùng 8/3; Đăng ký nghỉ → leave-attachment-picker on sick leave; new APK SHA + qa-device R3 PASS J-MOB-11/25.
  Parallel: qa-device retest only after new APK — do NOT PCOMP-W7-BE-LEAVE-DOC until UI reachable.
evidence_path: docs/qa/evidence/pcomp-w7-mob-batch-qa-r2-20260609.md
ack_status: FAIL_TO_PM
pm_dispatch_hint: dev-mobile R-W7-MOB-LEAVE-NAV-01-R2 — leave list still blank on F813668A
```
