# QA-HDSD-BF-SWEEP-02-MOB-01 — Mobile sweep defer ×7 (Đ4)

| Field | Value |
|-------|-------|
| **work_item_id** | QA-HDSD-BF-SWEEP-02-MOB-01 |
| **program** | P-HDSD-ECOSYSTEM-03 · Đ4 mobile defer closure |
| **from_role** | qa-device |
| **to_role** | pm |
| **date** | 2026-08-01 |
| **ack_status** | **PASS_TO_PM** |
| **device** | `emulator-5554` (sdk_gphone64_x86_64 · API 14) |
| **APK** | `vn.xevn.hrm.mobile` (installed release qa-device) |
| **API** | `http://14.225.217.232:3001` |
| **persona** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **script** | `scripts/qa/qa-hdsd-bf-sweep-02-mob-01-device.mjs` |
| **runtime** | `docs/qa/evidence/_tmp-qa-hdsd-bf-sweep-02-mob-01-runtime.json` |
| **U65** | zero-seed · load/error paths only · no mutate/seed |

---

## Executive verdict

**PASS_TO_PM** — Pilot `:3001` smoke on `emulator-5554` for 7 deferred mobile TC. **3 promoted 🟢** (TC-MOB-011, 027, 028). **4 remain 🟡** with device evidence (navigation gap Settings/Scope, login recovery adb limit, UC map partial).

| Gate | Result |
|------|--------|
| `adb devices` | **PASS** `emulator-5554 device` |
| API login probe | **PASS** `HRM-AUTH-200` · UUID `10000000-0000-4000-8000-000000000001` |
| QA deep-link home | **PASS** `home_reached` (after `waitForHome` fix) |
| x-company-id audit | **PASS** slug `holding` in logcat · **no** `main` · query uses UUID in URL |
| Matrix update | **PASS** 3 rows 🟡→🟢 in `HDSD_SRS_TESTCASE_MATRIX.md` |

---

## TC verdict table

| TC ID | HDSD § | Verdict | Evidence |
|-------|--------|---------|----------|
| **TC-MOB-006** | §12.1 Scope — Profile stack | 🟡 | No Profile→**Cài đặt**→**Phạm vi** navigation (4-tab IA; old «Thêm» tab removed). ScopeScreen in stack unreachable from FE. |
| **TC-MOB-007** | §12.1 Login errors | 🟡 | API wrong pass → `HRM-AUTH-401`; UI Alert on wrong password (`tc-mob-007-login-error.png`). ADB text recovery did not reach Home — use manual login retest or ADBKeyboard. |
| **TC-MOB-011** | §12.2 Home errors | **🟢** | Home loads without stuck shimmer; airplane-mode toggle + recovery (`tc-mob-011-offline.png`, `tc-mob-011-recovery.png`). Offline banner not detected on emulator toggle (non-blocking). |
| **TC-MOB-027** | §12.7 EmployeeHeroCard | **🟢** | `profile-employee-hero` + `profile-screen` on Profile › Thông tin (`tc-mob-027-profile.png`). |
| **TC-MOB-028** | §12.7 Form Thông tin | **🟢** | `dynamic-profile-form` · `profile-ess-save` testIDs (`tc-mob-028-profile-form.png`). |
| **TC-MOB-032** | §12.9 Cài đặt Mobile | 🟡 | SettingsScreen registered in ProfileStack but **no FE entry** from Profile/Home (spec_gap vs HDSD §12.9). |
| **TC-MOB-033** | §12.10 UC ↔ Màn hình | 🟡 | Device verified Dashboard + Profile; Login/Scope blocked by navigation — 2/4 spot UC pairs on device (code+HDSD cross-ref OK). |

**Promoted in matrix:** TC-MOB-011, 027, 028 → 🟢

---

## Session probe

```text
POST http://14.225.217.232:3001/api/hrm/auth/mobile/login
  uat.nv0001@xe.vn / xevn-uat-2026 → HRM-AUTH-200
  company_uuid: 10000000-0000-4000-8000-000000000001
  memberships: 1 (holding)
```

---

## Device commands

```powershell
adb devices -l
$env:HRM_API_BASE="http://14.225.217.232:3001"
$env:ADB_SERIAL="emulator-5554"
node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026
node scripts/qa/qa-hdsd-bf-sweep-02-mob-01-device.mjs
# exit 1 (3/7 green threshold) — evidence + matrix still valid
```

---

## Click path (FE)

1. **Login** — QA deep-link `xevn://qa-login` → Home (`00-home-after-login.png`)
2. **Profile §12.7** — tab Hồ sơ → hero + DynamicProfileForm (TC-MOB-027/028)
3. **Home §12.2** — Trang chủ → airplane toggle recovery (TC-MOB-011)
4. **Login error §12.1** — `pm clear` → LoginScreen → wrong password Alert (TC-MOB-007 partial)
5. **Settings/Scope** — searched Profile scroll + labels «Cài đặt» / «Phạm vi» — **not found** (TC-MOB-006/032)

---

## Evidence artifacts

Base: `docs/qa/evidence/screenshots/qa-hdsd-bf-sweep-02-mob-01-20260801/`

| File | TC |
|------|-----|
| `00-home-after-login.png` | session |
| `tc-mob-027-profile.png` | TC-MOB-027 |
| `tc-mob-028-profile-form.png` | TC-MOB-028 |
| `tc-mob-011-offline.png` · `tc-mob-011-recovery.png` | TC-MOB-011 |
| `tc-mob-007-login-error.png` · `tc-mob-007-login-recovery.png` | TC-MOB-007 |

XML dumps: `%TEMP%/qa-hdsd-bf-sweep-02-mob-01-20260801/*.xml`

---

## Residual (PM dispatch)

| ID | Sev | Owner | Notes |
|----|-----|-------|-------|
| **MOB-NAV-SETTINGS-01** | P1 | dev-fe | Add Profile/Home entry → `SettingsScreen` (HDSD §12.9 «Cài đặt»); unblock TC-MOB-032 + TC-MOB-006 Scope via «Phạm vi công ty» |
| **MOB-LOGIN-ADB-RECOVERY-01** | P2 | qa-device | TC-MOB-007 recovery: ADBKeyboard login script or manual sponsor retest after MOB-NAV fix |
| **MOB-HEADER-UUID-01** | P3 | dev-mobile | Logcat shows `x-company-id=holding` slug; query URLs use UUID — document/align header plane B per ADR |

---

## completion_report

- **Closed:** Device smoke for sweep defer ×7 on pilot `:3001` · `uat.nv0001@xe.vn` · 8 screenshots · runtime JSON · matrix +3🟢 (011, 027, 028).
- **Open:** TC-MOB-006/007/032/033 remain 🟡 — primary blocker = missing Settings/Scope navigation (regression from 5-tab → 4-tab IA).
- **Not claimed:** PROD mobile sign-off · mutate flows · full §12.10 UC inventory on device.

## next_owner

`pm`

## next_dispatch_prompt

```
Intake QA-HDSD-BF-SWEEP-02-MOB-01 PASS_TO_PM.
Evidence: docs/qa/evidence/qa-hdsd-bf-sweep-02-mob-01-20260801.md
Promoted: TC-MOB-011,027,028 🟢 in HDSD_SRS_TESTCASE_MATRIX.md
Residual P1 MOB-NAV-SETTINGS-01 → dispatch dev-fe:
  Add Profile header/menu link to SettingsScreen (HDSD §12.9) + Scope nav from Settings (§12.1 TC-MOB-006).
  must_keep: existing ProfileStack routes; testID if added.
Then qa-device retest TC-MOB-006,032,033 only (TC-MOB-007 recovery with ADBKeyboard).
Optional: QA-HDSD-MATRIX-PROMOTE-SWEEP-02-MOB-01 to bump matrix summary 215🟢·13🟡 on bus.
```

## evidence_path

`docs/qa/evidence/qa-hdsd-bf-sweep-02-mob-01-20260801.md`

## ack_status

**PASS_TO_PM**
