# PCOMP-W7-MOB-BATCH-QA — W7 leave-doc + profile-full device batch

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-MOB-BATCH-QA` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **ack_status** | **FAIL_TO_PM** |
| **device** | `emulator-5554` (`sdk_gphone64_x86_64`, 1080×2400) |
| **api_base** | `https://14-225-217-232.nip.io` |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **APK** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` (69,148,306 B) |
| **SHA-256** | `676E097F9C49EFD9437EBCF57A8B4ADC3EC8CD39D68C9FF7EFD2A2DA8B382AD0` |
| **upstream** | dev-mobile [`pcomp-w7-mob-batch-20260609.md`](pcomp-w7-mob-batch-20260609.md) · prior leave balance [`pcomp-w8-mob-ess-leave-01-r3-20260609.md`](pcomp-w8-mob-ess-leave-01-r3-20260609.md) |

---

## Executive verdict

**FAIL_TO_PM (GWC partial)** — Rebuilt **W7 qa-device APK** (bundle contains `LeaveAttachmentPicker` / `leave-attachment-picker`). nip.io API probes **PASS** (`leave-balance` 8/3, `x-company-id` UUID). **J-MOB-16 PASS** (directory 213 rows + row→detail). **J-MOB-12 GWC** (Thông tin tab shell; profile API empty + «Không tìm thấy hồ sơ»). **J-MOB-25 / J-MOB-11 FAIL** — `home-action-tile-time_off` → **blank white screen** (2822 B empty hierarchy); cannot reach leave list balance header or sick-leave attachment wizard on device.

**pm_dispatch_hint:** `dev-mobile` leave-list navigation regression (P0 before re-test J-MOB-11/25). `dev-be` + `devops` profile `custom_fields` seed. **Not** `PCOMP-W7-BE-LEAVE-DOC` — attachment upload never reached.

---

## Environment & commands

```powershell
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
$apk = "apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk"

# Rebuild W7 batch (junction path)
Set-Location C:\xevn-ecosystem\apps\mobile\hrm-mobile
pnpm run android:apk:qa-device   # exit 0 · ~4 min

Get-FileHash $apk -Algorithm SHA256
& $adb -s emulator-5554 shell wm size reset
& $adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile
& $adb -s emulator-5554 install -r $apk

node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026
node scripts/tmp-pcomp-w7-mob-batch-qa-device.mjs
```

Machine JSON: [`pcomp-w7-mob-batch-qa-20260609.json`](pcomp-w7-mob-batch-qa-20260609.json)  
Screens/XML: `docs/qa/evidence/pcomp-w7-mob-batch-qa-screens/`

---

## API probe (nip.io)

| Endpoint | HTTP | Code | Notes |
|----------|------|------|-------|
| `POST /auth/mobile/login` | **201** | HRM-AUTH-200 | `uat.nv0001@xe.vn` |
| `GET /attendance/leave-balance` (annual, 2026) | **200** | HRM-LEAVE-BAL-200 | `available_days=8`, `used_days=3` |
| `GET /employees/{id}` | **200** | — | `custom_fields` empty (no phone/gender seed) |
| `x-company-id` | UUID | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` | ≠ `main` |

---

## Journey verdicts

| ID | Verdict | Device evidence |
|----|---------|-----------------|
| **J-MOB-11** | **FAIL** | Cannot open leave create flow — `home-action-tile-time_off` / `Nghỉ phép` tile → blank screen (`w7-leaves-list.xml` 2822 B, no nodes). `leave-attachment-picker` not reachable. |
| **J-MOB-12** | **GWC** | Profile tab + `Thông tin` segmented control **PASS** (`w7-profile-info.xml`). Hero shows «Không tìm thấy hồ sơ»; no `Số điện thoại`/`Giới tính` (API `custom_fields` empty). HR edit block visible. |
| **J-MOB-16** | **PASS** | After profile-tab prime: `w7-directory.xml` — search, `Tất cả (213)`, rows `Bùi Quốc An`… Row tap → `w7-directory-detail.xml` — «Thông tin nhân viên», Email `uat.nv0091@xe.vn`, Mã NV. Screens: `w7-directory.png`, `w7-directory-detail.png`. |
| **J-MOB-25** | **FAIL** | Same blank-screen blocker as J-MOB-11; API balance 8/3 OK but no `Còn lại`/`Đã dùng`/`Kỳ nghỉ` on device (`w7-leaves-blank.png` if captured). Regression vs R3 [`r3-leaves-list.xml`](../pcomp-w8-mob-ess-leave-01-r3-screens/r3-leaves-list.xml). |

---

## Residual / dispatch

| ID | Item | Owner | Trigger |
|----|------|-------|---------|
| **R-W7-MOB-LEAVE-NAV-01** | `Nghỉ phép` home tile → white screen (blocks J-MOB-11/25) | `dev-mobile` | Fix stack trace / nav target; retest qa-device |
| **R-W7-MOB-PROFILE-01** | Profile GET empty on nip.io for `uat.nv0001` | `dev-be` | Employee scope + seed `custom_fields` phone/gender |
| **R-W7-MOB-SEED-01** | `custom_fields` empty blocks J-MOB-12 full AC | `devops` / `dev-be` | Seed per `MOBILE_W7_DATA_CONTRACTS.md` §7 |
| **R-W7-MOB-TEAM-NAV-01** | Team tab needs profile-tab prime on cold home (flaky adb) | `dev-mobile` | Optional UX fix |
| **R-G3-DEV-REQCYCLE** | RN require-cycle toast `teamDirectory.ts` | `dev-mobile` | Remove cycle before partner demo |

---

## Handoff

```yaml
completion_report: |
  PCOMP-W7-MOB-BATCH-QA FAIL_TO_PM. Rebuilt qa-device APK SHA 676E097F with W7 leave-doc + profile-full bundle.
  J-MOB-16 directory PASS @ nip.io. J-MOB-12 GWC (UI shell, profile data missing).
  J-MOB-11 sick-leave attachment and J-MOB-25 balance header FAIL — leave list route white screen after Nghỉ phép tile.
  API leave-balance 8/3 PASS; attachment BE not exercised (UI unreachable).
next_owner: pm
next_dispatch_prompt: |
  Task dev-mobile — work_item_id R-W7-MOB-LEAVE-NAV-01 / PCOMP-W7-MOB-BATCH-FIX.
  Entry: qa-device evidence docs/qa/evidence/pcomp-w7-mob-batch-qa-20260609.md — home-action-tile-time_off blank screen.
  Exit: Nghỉ phép tile opens LeaveRequestsListScreen with balance header; sick-leave create shows leave-attachment-picker; jest unchanged; new APK SHA + qa-device retest J-MOB-11/25 PASS.
  Parallel: Task dev-be R-W7-MOB-PROFILE-01 — nip.io profile custom_fields for uat.nv0001; then qa-device J-MOB-12 re-run.
  Do NOT dispatch PCOMP-W7-BE-LEAVE-DOC until attachment UI reachable and upload fails.
evidence_path: docs/qa/evidence/pcomp-w7-mob-batch-qa-20260609.md
ack_status: FAIL_TO_PM
pm_dispatch_hint: dev-mobile R-W7-MOB-LEAVE-NAV-01 (not PCOMP-W7-BE-LEAVE-DOC — attachment not reached)
```
