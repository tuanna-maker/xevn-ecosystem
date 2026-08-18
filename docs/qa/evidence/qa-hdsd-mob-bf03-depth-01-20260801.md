# QA-HDSD-MOB-BF03-DEPTH-01 — Mobile payslip/contracts depth (C-BF03-MOB-DEPTH-01)

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-HDSD-MOB-BF03-DEPTH-01` |
| **program** | `P-HDSD-ECOSYSTEM-03` · **C-BF03-MOB-DEPTH-01** · Cursor sole |
| **from_role** | qa-device |
| **to_role** | pm |
| **date** | 2026-08-01 |
| **ack_status** | **PASS_TO_PM** |
| **prior** | `qc-hdsd-bf-03-profile-close-01-20260801.md` GWC · C-BF03-PROFILE-01 CLOSED · residual MOB-020/021/022/030 |
| **device** | `emulator-5554` (sdk_gphone64_x86_64 · API 34) |
| **APK** | `C:\xevn-apk\hrm-mobile-qa-device.apk` · SHA-256 `24CDF95FD1F295200BE1D622FC8AE1BC26F90E1D4F732A0E3C8B50F50CD6C55F` |
| **API** | `http://14.225.217.232:3001` |
| **persona** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **U65** | zero-seed · load/error/nav only · no mutate/seed |
| **script** | `scripts/qa/qa-hdsd-mob-bf03-depth-01-device.mjs` · retry `…-retry-021-030.mjs` |
| **runtime** | `docs/qa/evidence/_tmp-qa-hdsd-mob-bf03-depth-01-runtime.json` |

---

## Executive verdict

**PASS_TO_PM** — Device smoke **4/4 🟢** for C-BF03-MOB-DEPTH-01. Matrix promoted **TC-MOB-020/021/022/030** · rollup **317🟢 · 43🟡 · 0⬜** (yellow −4 vs prior 47🟡 header). **J-MOB-04 spine PASS** (list→detail · Thực lĩnh). must_keep **TC-MOB-011/027/028** regression **🟢 intact** (0 downgrade).

| Gate | Result |
|------|--------|
| `adb devices` | **PASS** `emulator-5554 device` |
| API login | **PASS** `HRM-AUTH-200` · company `holding` · UUID `10000000-0000-4000-8000-000000000001` |
| Pilot probe | **PASS** payslips total=1 · periods=1 · contracts=8 |
| J-MOB-04 | **PASS** PayslipList → PayslipDetail · no ERR-NETWORK · `x-company-id=holding` · **hasMain=false** |
| Matrix promote | **PASS** 4 rows 🟡→🟢 · must_keep 011/027/028 unchanged 🟢 |

---

## TC verdict table

| TC ID | HDSD § | Verdict | Evidence |
|-------|--------|---------|----------|
| **TC-MOB-020** | §12.5 PayslipDetail | **🟢** | Tab Phiếu lương → row «Thực lĩnh» → detail · `tc-mob-020-list/detail.png` · J-MOB-04 PASS |
| **TC-MOB-021** | §12.5 PayrollSummary | **🟢** | Profile → Cài đặt → scroll → **Lương** → kỳ lương list · `tc-mob-021-summary-retry.png` |
| **TC-MOB-022** | §12.5 Payslip errors | **🟢** | Online → `svc wifi disable` offline banner → enable + pull refresh recovery · `tc-mob-022-*.png` |
| **TC-MOB-030** | §12.7 ContractsScreen | **🟢** | Settings → **Hợp đồng** → ContractsScreen · `tc-mob-030-contracts-retry.png` |

### must_keep regression (spot)

| TC | Verdict | Note |
|----|---------|------|
| **TC-MOB-011** | **🟢** | Home shell reachable — not demoted |
| **TC-MOB-027** | **🟢** | `profile-employee-hero` / `profile-screen` |
| **TC-MOB-028** | **🟢** | `dynamic-profile-form` intact |
| **J-MOB-04** | **🟢 PASS** | Prior spine preserved + reconfirmed this wave |

---

## Session probe (API — U65 read-only)

```text
POST http://14.225.217.232:3001/api/hrm/auth/mobile/login
  uat.nv0001@xe.vn / xevn-uat-2026 → HRM-AUTH-200
  company_id: holding · company_uuid: 10000000-0000-4000-8000-000000000001
GET /api/hrm/payroll/payslips?company_id=holding → 200 total=1
GET /api/hrm/payroll/periods?company_id=holding → 200 total=1
GET /api/hrm/contracts-insurance/contracts?company_id=holding → 200 total=8
```

---

## Device commands

```powershell
adb devices -l
# emulator-5554 device

Get-FileHash -Algorithm SHA256 C:\xevn-apk\hrm-mobile-qa-device.apk
# 24CDF95FD1F295200BE1D622FC8AE1BC26F90E1D4F732A0E3C8B50F50CD6C55F

adb -s emulator-5554 install -r -g C:\xevn-apk\hrm-mobile-qa-device.apk
adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile

$env:HRM_API_BASE='http://14.225.217.232:3001'
$env:ADB_SERIAL='emulator-5554'
$env:QA_DEVICE_APK='C:\xevn-apk\hrm-mobile-qa-device.apk'
node scripts/qa/qa-hdsd-mob-bf03-depth-01-device.mjs
# then Settings-scroll retry for 021/030:
node scripts/qa/qa-hdsd-mob-bf03-depth-01-retry-021-030.mjs
# exit 0 — 4/4 🟢
```

---

## Click path (FE)

1. **Login** — QA deep-link `xevn://qa-login` + pilot `base_url` → Home
2. **TC-MOB-020 / J-MOB-04** — Tab Phiếu lương → tap row Thực lĩnh → PayslipDetail
3. **TC-MOB-022** — Payslip online → disable wifi → offline error → enable wifi → pull refresh recovery
4. **TC-MOB-021** — Hồ sơ → Cài đặt → scroll Điều hướng nhanh → **Lương** → PayrollSummary (kỳ)
5. **TC-MOB-030** — Settings → **Hợp đồng** → ContractsScreen (list/sections)
6. **Regression** — Home + Profile hero/form markers for 011/027/028

---

## Logcat / scope

```text
[HRM-MOB] GET .../payroll/payslips?... x-company-id=holding Authorization=Bearer …
```

| Check | Result |
|-------|--------|
| Pilot `:3001` hits | 🟢 present on payslip journey |
| `x-company-id=main` | 🟢 **absent** (`hasMain: false`) |
| ERR-NETWORK on detail | 🟢 absent after recovery |

---

## Evidence artifacts

Base: `docs/qa/evidence/screenshots/qa-hdsd-mob-bf03-depth-01-20260801/`

| File | TC |
|------|-----|
| `00-home-after-login.png` | session |
| `tc-mob-020-list.png` · `tc-mob-020-detail.png` | TC-MOB-020 / J-MOB-04 |
| `tc-mob-021-settings-retry.png` · `tc-mob-021-summary-retry.png` | TC-MOB-021 |
| `tc-mob-022-online.png` · `tc-mob-022-offline.png` · `tc-mob-022-recovery.png` | TC-MOB-022 |
| `tc-mob-030-contracts-retry.png` | TC-MOB-030 |
| `reg-home.png` · `reg-profile.png` | must_keep 011/027/028 |

XML dumps: `%TEMP%/qa-hdsd-mob-bf03-depth-01-20260801/*.xml`

---

## Matrix update

| Before | After | Delta |
|--------|-------|-------|
| 317🟢 · 47🟡 · 0⬜ (prior header) | **317🟢 · 43🟡 · 0⬜** (body grep) | TC-MOB-020/021/022/030 🟡→🟢 · yellow −4 · must_keep 011/027/028 still 🟢 |

`HDSD_SRS_TESTCASE_MATRIX.md` Mobile rows promoted. **No** 🟢→⬜/🟡 regression.

---

## Residual

| ID | Sev | Owner | Notes |
|----|-----|-------|-------|
| ~~**C-BF03-MOB-DEPTH-01**~~ | P2 | — | **CLOSED** — 4/4 device 🟢 |
| Home quick-grid «Hợp đồng» | P3 info | — | Not on current home tiles for nv0001; Settings path sufficient for HDSD AC |
| Airplane broadcast | P3 | qa-device | API34 emu blocks `AIRPLANE_MODE` broadcast — used `svc wifi` instead |

---

## completion_report

- **Closed:** C-BF03-MOB-DEPTH-01 device depth — TC-MOB-020/021/022/030 all 🟢 on pilot `:3001` · emulator-5554 · U65 · matrix +4🟢 · J-MOB-04 PASS · must_keep 011/027/028 intact.
- **Open:** None for this residual. Broader program yellows (mutate defer, etc.) out of slice.
- **Not claimed:** PROD mobile · mutate payslip/contracts · `:8088`.

## next_owner

`pm` → optional `qc` closeout for C-BF03-MOB-DEPTH-01

## next_dispatch_prompt

```
Intake QA-HDSD-MOB-BF03-DEPTH-01 PASS_TO_PM.
Evidence: docs/qa/evidence/qa-hdsd-mob-bf03-depth-01-20260801.md
Runtime: docs/qa/evidence/_tmp-qa-hdsd-mob-bf03-depth-01-runtime.json
Promoted: TC-MOB-020,021,022,030 🟢 · matrix 317🟢/43🟡 (yellow −4) · J-MOB-04 PASS · must_keep 011/027/028 intact.
C-BF03-MOB-DEPTH-01 CLOSED.
Next: QC close residual C-BF03-MOB-DEPTH-01 OR continue C-BF03-MUTATE-DEFER-01 (qa browser U65).
cấm: seed · Claude · demote prior 🟢
```

## evidence_path

`docs/qa/evidence/qa-hdsd-mob-bf03-depth-01-20260801.md`

## ack_status

**PASS_TO_PM**
