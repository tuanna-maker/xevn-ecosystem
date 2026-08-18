# QA-MOB-NAV-SETTINGS-01-RET — Profile → Cài đặt → Phạm vi device retest

| Field | Value |
|-------|-------|
| **work_item_id** | QA-MOB-NAV-SETTINGS-01-RET |
| **program** | P-HDSD-ECOSYSTEM-03 · mobile nav retest |
| **from_role** | qa-device |
| **to_role** | pm |
| **date** | 2026-08-01 |
| **ack_status** | **PASS_TO_PM** |
| **device** | `emulator-5554` (sdk_gphone64_x86_64 · API 14) |
| **APK** | `hrm-mobile-qa-device.apk` SHA-256 `24CDF95FD1F295200BE1D622FC8AE1BC26F90E1D4F732A0E3C8B50F50CD6C55F` |
| **API** | `http://14.225.217.232:3001` |
| **persona** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **script** | `scripts/qa/qa-mob-nav-settings-01-ret-device.mjs` |
| **runtime** | `docs/qa/evidence/_tmp-qa-mob-nav-settings-01-ret-runtime.json` |
| **U65** | zero-seed · QA deep-link login only |

---

## Executive verdict

**PASS_TO_PM** — MOB-NAV-SETTINGS-01 navigation wired and verified on pilot `:3001`. **6/7 TC 🟢**; TC-MOB-007 recovery remains 🟡 (known ADB input limit — MOB-LOGIN-ADB-RECOVERY-01).

| Gate | Result |
|------|--------|
| `adb devices` | **PASS** `emulator-5554 device` |
| API login probe | **PASS** `HRM-AUTH-200` · UUID `10000000-0000-4000-8000-000000000001` |
| QA deep-link home | **PASS** |
| Click path Hồ sơ → Cài đặt → Phạm vi | **PASS** testIDs `profile-settings-entry` → `settings-screen` → `settings-scope-link` → `scope-screen` |
| Regression TC-MOB-011/027/028 | **PASS** 🟢 unchanged |
| Matrix update | **PASS** TC-MOB-006/032/033 🟡→🟢 |

---

## TC verdict table

| TC ID | HDSD § | Verdict | Evidence |
|-------|--------|---------|----------|
| **TC-MOB-006** | §12.1 Scope — Profile stack | **🟢** | Profile → Cài đặt → scroll → Phạm vi công ty → Scope «Đơn vị vận hành» (`03-scope-screen.png`) |
| **TC-MOB-032** | §12.9 Cài đặt Mobile | **🟢** | `profile-settings-entry` → Settings «Phạm vi đang dùng» + logout (`02-settings-screen.png`) |
| **TC-MOB-033** | §12.10 UC ↔ Màn hình | **🟢** | 4/4 spot UC pairs on device (Login, Scope/Settings, Dashboard, Profile) |
| **TC-MOB-011** | §12.2 Home errors | **🟢** | Regression — home recovery after airplane toggle |
| **TC-MOB-027** | §12.7 EmployeeHeroCard | **🟢** | Regression — `profile-employee-hero` before stack nav |
| **TC-MOB-028** | §12.7 Form Thông tin | **🟢** | Regression — `dynamic-profile-form` + `profile-ess-save` |
| **TC-MOB-007** | §12.1 Login errors | 🟡 | Wrong-password Alert shown; ADB recovery login did not reach Home (prior sweep residual) |

**Promoted in matrix:** TC-MOB-006, 032, 033 → 🟢

---

## Click path (FE)

1. **Login** — QA deep-link `xevn://qa-login` → Home (`00-home-after-login.png`)
2. **Profile** — tab Hồ sơ → hero + form (`01-profile-before-settings.png`, `tc-mob-027/028`)
3. **Settings** — tap `profile-settings-entry` «Cài đặt» (`02-settings-screen.png`)
4. **Scope** — scroll «Điều hướng nhanh» → tap `settings-scope-link` → Scope «Phạm vi công ty» (`03-scope-screen.png`)

---

## Device commands

```powershell
cd C:\xevn-ecosystem\apps\mobile\hrm-mobile
node scripts/build-apk.cjs --qa-device
# SHA-256 24CDF95F… · install emulator-5554

cd <repo-root>
$env:HRM_API_BASE="http://14.225.217.232:3001"
$env:ADB_SERIAL="emulator-5554"
adb -s emulator-5554 install -r -g C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk
node scripts/qa/qa-mob-nav-settings-01-ret-device.mjs
# exit 0
```

---

## Header audit

- Logcat `x-company-id=holding` (slug) on API calls; query URLs use UUID `10000000-0000-4000-8000-000000000001`
- **No** `main` in header audit — residual MOB-HEADER-UUID-01 (document only)

---

## Evidence artifacts

Base: `docs/qa/evidence/screenshots/qa-mob-nav-settings-01-ret-20260801/`

| File | TC |
|------|-----|
| `00-home-after-login.png` | session |
| `01-profile-before-settings.png` | profile-settings-entry |
| `02-settings-screen.png` | TC-MOB-032 |
| `03-scope-screen.png` | TC-MOB-006 |
| `tc-mob-027-profile.png` · `tc-mob-028-profile-form.png` | regression |
| `tc-mob-011-offline.png` · `tc-mob-011-recovery.png` | TC-MOB-011 |
| `tc-mob-007-login-error.png` · `tc-mob-007-login-recovery.png` | TC-MOB-007 partial |

---

## Residual (PM)

| ID | Sev | Owner | Notes |
|----|-----|-------|-------|
| **MOB-LOGIN-ADB-RECOVERY-01** | P2 | qa-device | TC-MOB-007 recovery — ADBKeyboard or manual sponsor retest |
| **MOB-HEADER-UUID-01** | P3 | dev-mobile | Logcat slug `holding`; query uses UUID — align per ADR |

---

## completion_report

- **Closed:** MOB-NAV-SETTINGS-01 device retest on pilot `:3001` · fresh qa-device APK · 6 TC 🟢 · matrix +3🟢 (006/032/033) · regression 011/027/028 intact.
- **Open:** TC-MOB-007 🟡 — ADB password recovery only (not nav blocker).
- **Not claimed:** PROD mobile sign-off · mutate flows.

## next_owner

`pm`

## next_dispatch_prompt

```
Intake QA-MOB-NAV-SETTINGS-01-RET PASS_TO_PM.
Evidence: docs/qa/evidence/qa-mob-nav-settings-01-ret-20260801.md
Promoted: TC-MOB-006,032,033 🟢 in HDSD_SRS_TESTCASE_MATRIX.md
MOB-NAV-SETTINGS-01 → mark DONE on bus.
Optional: dispatch MOB-LOGIN-ADB-RECOVERY-01 (TC-MOB-007 ADBKeyboard) P2.
QC spot: matrix summary 218🟢·10🟡.
```

## evidence_path

`docs/qa/evidence/qa-mob-nav-settings-01-ret-20260801.md`

## ack_status

**PASS_TO_PM**
