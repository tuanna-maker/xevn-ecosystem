# PCOMP-W7-MOB-LEAVE-BAL — QA-device retest J-MOB-25/28 · AC-LEAVE-BAL-01/02

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-MOB-LEAVE-BAL` |
| **from_role** | `qa-device` |
| **to_role** | `pm` / `dev-mobile` |
| **date** | 2026-07-19 |
| **ack_status** | **FAIL** |
| **device** | `emulator-5554` (`sdk_gphone64_x86_64`) |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **API** | `https://14-225-217-232.nip.io` |
| **U65** | zero-seed — no `pnpm seed:*`; no DB fake; probe = L1 aux only |
| **prior Dev** | `docs/qa/evidence/pcomp-w7-mob-leave-bal-20260719.md` (READY_FOR_QA · unit 14/14) |
| **spec_ref** | `docs/hrm/MOBILE_W7_SRS_DELTA.md` §4.3 UC-HRM-MOB-06c · TechSpec §3.6 / §4.2 |

---

## Executive verdict

**FAIL → dev-mobile** — Cannot promote J-MOB-28 / AC-LEAVE-BAL-01/02 for the **2026-07-19** `LeaveBalanceChip` wave.

1. **No wave release APK** — Dev-mobile READY_FOR_QA published source + Vitest only; **no APK path/SHA**.
2. **Installed binary stale** — `vn.xevn.hrm.mobile` `versionName=1.0.0` · `lastUpdateTime=2026-06-16 14:20:01` · SHA256 `49B95D0EA2BD9879D32A799DE844676C2BC79D0F4B4E39BD91C4DCA5333EDB2D`.
3. **Bundle audit** — embedded `assets/index.android.bundle` has `leave-balance-header=True` but **`LeaveBalanceChip=False`**, **`leave-balance-chip=False`**, **`formatLeaveBalanceChipText=False`**, **`LEAVE_BALANCE_MISSING=False`**.
4. Device wizard step 0 shows date picker only — **no** «Số dư phép» / «Còn lại: R / E ngày phép năm Y» chip.

Vitest source suite **14/14 PASS** — **not** a substitute for device L2.5 (U65).

Same APK-stale class as `PCOMP-W7-MOB-LEAVE-DOC` FAIL same day.

---

## Matrix

| ID | Expect | Device result | Notes |
|----|--------|---------------|-------|
| **J-MOB-25** | My Leaves balance cards | **PASS** (stale APK) | `leave-balance-header`: Kỳ nghỉ **2026** · Còn lại **8** · Đã dùng **3** |
| **J-MOB-28** | Wizard `LeaveBalanceChip` copy «Còn lại: R / E ngày phép năm Y» | **FAIL** | No `leave-balance-chip` in UI hierarchy; not in APK bundle |
| **AC-LEAVE-BAL-01** | Wizard số dư ≠ «—» when API 200 | **FAIL** | Chip absent on step 0 |
| **AC-LEAVE-BAL-02** | After approve 3d — remaining drops on refresh | **BLOCKED** | Needs chip + approve path on wave APK |
| **B1** HR copy «Chưa có số dư — liên hệ HR» | Source aligned | **NOT TESTED** device | Bundle lacks `LEAVE_BALANCE_MISSING` string |
| **B2/B3** warn-only, no hard block | BR-LEAVE-BAL-02 | **BLOCKED** | Cannot exercise exceed/depleted banners without chip |

---

## L1 aux (not UF PASS)

```text
POST /api/hrm/auth/mobile/login  uat.nv0001@xe.vn → 200
GET /api/hrm/attendance/leave-balance?company_id=holding&employee_id=3796d949-…&leave_type=annual&year=2026
→ 200 HRM-LEAVE-BAL-200
  remaining_days=8 · available_days=8 · entitled_days=12 · used_days=3 · year=2026
```

Expected chip text (SRS): **`Còn lại: 8 / 12 ngày phép năm 2026`**

---

## Unit verify (source — corroboration only)

```text
pnpm test:hrm-mobile -- leaveBalanceChip hrmLeaveBalance
→ Test Files 2 passed | Tests 14 passed
```

---

## Device setup / commands

```powershell
adb devices -l
# emulator-5554 device

adb shell dumpsys package vn.xevn.hrm.mobile | findstr versionName lastUpdateTime
# versionName=1.0.0 · lastUpdateTime=2026-06-16 14:20:01

adb pull …/base.apk
Get-FileHash base.apk -Algorithm SHA256
# 49B95D0EA2BD9879D32A799DE844676C2BC79D0F4B4E39BD91C4DCA5333EDB2D

$env:HRM_API_BASE="https://14-225-217-232.nip.io"
node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026
# home_reached=true · pass=true
```

### Click path (U65 FE)

1. Deep-link login `uat.nv0001@xe.vn` @ nip.io → Home.
2. Tap `home-action-tile-time_off` (Nghỉ phép) → **My Leaves**.
3. Assert `leave-balance-header` texts 8 / 3 / Kỳ nghỉ 2026.
4. FAB `check-in-fab` → `fab-action-create-leave` (Tạo đơn nghỉ).
5. Wizard step 0 «Chọn ngày» — assert **absence** of `leave-balance-chip` / SRS chip copy.

Screens (PNG magic OK):

- `docs/qa/evidence/screenshots/pcomp-w7-mob-leave-bal-qa-20260719/01-my-leaves.png`
- `docs/qa/evidence/screenshots/pcomp-w7-mob-leave-bal-qa-20260719/03-create-wizard-step0.png`

XML dumps (session): `%TEMP%\hrm-leave-bal-myleaves.xml`, `%TEMP%\hrm-leave-bal-wizard.xml`

---

## Defects

| ID | Layer | Summary | Owner |
|----|-------|---------|-------|
| **D-W7-LEAVE-BAL-APK-01** | Mobile release | No 2026-07-19 APK with `LeaveBalanceChip`; device still on 2026-06-16 embed | **dev-mobile** |

---

## Residual / not promoted

- J-MOB-28 chip copy + touch target ≥44px on device
- AC-LEAVE-BAL-01/02 device
- B2 yellow / B3 red warn banners + confirm still allows submit
- B1 404 path on chip (optional if persona has balance row)

---

## Handoff

- **completion_report:** Device retest **FAIL**. J-MOB-25 numeric header **PASS** on stale APK (8/3). J-MOB-28 / AC-LEAVE-BAL-01 **FAIL** — wizard has no `LeaveBalanceChip` (bundle + UI). AC-LEAVE-BAL-02 / B2/B3 **BLOCKED**. Source Vitest 14/14 + nip.io balance 8/12 OK. Root cause: missing wave APK (same class as leave-doc).
- **next_owner:** `dev-mobile`
- **ack_status:** **FAIL**
- **evidence_path:** `docs/qa/evidence/pcomp-w7-mob-leave-bal-qa-20260719.md`
- **pm_dispatch_hint:** `PCOMP-W7-MOB-LEAVE-BAL-APK` — build/install qa-device or release APK from 2026-07-19 tree containing `LeaveBalanceChip`; publish path+SHA; then re-dispatch qa-device.

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PCOMP-W7-MOB-LEAVE-BAL-APK
from_role: pm
to_role: dev-mobile
lane: execution

## Entry
qa-device FAIL: docs/qa/evidence/pcomp-w7-mob-leave-bal-qa-20260719.md
Installed APK SHA256 49B95D0E… lastUpdate 2026-06-16 — missing LeaveBalanceChip.

## Do
1. BUILD_TARGET=qa-device (or release) APK from current tree with LeaveBalanceChip + warn B2/B3.
2. Publish path + SHA256 in evidence docs/qa/evidence/pcomp-w7-mob-leave-bal-apk-20260719.md
3. Confirm bundle contains leave-balance-chip + formatLeaveBalanceChipText / «ngày phép năm».
4. READY_FOR_QA qa-device — J-MOB-25/28 · AC-LEAVE-BAL-01/02 · B1/B2/B3 warn-only.

## Cấm
seed; claim device PASS without APK SHA matching install
```
