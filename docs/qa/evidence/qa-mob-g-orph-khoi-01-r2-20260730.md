# QA-MOB-G-ORPH-KHOI-01-R2 — Device retest (Plane A labels)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-MOB-G-ORPH-KHOI-01-R2` |
| **date** | 2026-07-30 (ICT) · **post-reboot resume** 21:03 ICT |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **lane** | execution |
| **ack_status** | **FAIL_TO_PM** (partial label PASS; Settings/Scope U65 **NOT RUN** — no UI nav entry) |
| **HOLD_DEPLOY** | true · **U65** zero-seed |
| **prior** | `docs/qa/evidence/qa-mob-g-orph-khoi-01-r1-20260730.md` |
| **auth** | `docs/qa/evidence/qa-d-be-mob-auth-ceo-hash-01-20260730.md` |
| **build** | `docs/qa/evidence/d-mob-g-orph-khoi-build-01-20260730.md` |
| **AC source** | `docs/qa/evidence/ba-mob-orph-khoi-label-01-20260730.md` §7 |

---

## Executive verdict

**FAIL_TO_PM** — Fresh qa-device APK (SHA `5119B959…8895`) installed; mobile login **201** `HRM-AUTH-200` / `PORTAL-GCEO`; bundle contains Plane A resolver symbols. **Home** and **Payslip** device dumps show **zero** «Khối … X.E»; Home displays **«Tập đoàn XeVN»** (Plane A §4). **Settings** and **Scope** screens could **not** be opened via U65 UI or deep link — no `navigate('Settings')` entry in app IA (Profile stack screen exists but unreachable). AC-MOB-LABEL-01/02/07 remain **NOT RUN**; cannot claim full exit.

| Gate | Result | Notes |
|------|--------|-------|
| `adb devices` | **PASS** | `emulator-5554 device` |
| L0 `qc:dev-stack` | **PARTIAL** | HRM `:28001` HTTP 200; xbos/portal down post-reboot — mobile auth unaffected |
| APK SHA-256 | **PASS** | `5119B9592EAAE3998EDF52DC16500B2A741D89C130E7F36E278EBA7EFE6B8895` |
| APK install | **PASS** | `adb install -r -g` Success |
| Bundle resolver symbols | **PASS** | `isPilotKhoiFictionLabel`, `PLANE_A_COMPANY_LABELS`, `resolveCompanyDisplayVi`, `sanitizeOperatingUnitDisplayLabel` |
| Mobile login API | **PASS** | 201 `HRM-AUTH-200` · `employee_code=PORTAL-GCEO` · `company_id=holding` |
| Deep-link login → Home | **PASS** | `qa-mobile-login-intent.mjs` exit 0 |
| AC-MOB-LABEL-03 Home | **PASS** | UI text **«Tập đoàn XeVN»** · 0 Khối |
| AC-MOB-LABEL-04 Payslip | **PASS** | Tab load · 0 Khối (empty + network banner only) |
| AC-MOB-LABEL-01 Scope | **NOT RUN** | Settings/Scope nav blocked |
| AC-MOB-LABEL-02 Settings | **NOT RUN** | No UI route to Settings |
| AC-MOB-LABEL-05 Login toast | **N/A** | Single membership — toast not shown |
| AC-MOB-LABEL-07 F5 Scope | **NOT RUN** | Scope unreachable |

---

## Environment trace

| Check | Command / detail | Result |
|-------|------------------|--------|
| Device | `adb devices -l` | `emulator-5554` · `sdk_gphone64_x86_64` |
| APK | `C:\xevn-apk\hrm-mobile-qa-device.apk` | 71,596,189 bytes |
| API | `http://127.0.0.1:28001` | Health 200 |
| Account | `ceo@xe.vn` / `Xevn@2026` | Group CEO · 1 membership |
| Login method | `xevn://qa-login` deep link | U65 — no seed |
| cấm | seed · fake PASS | **observed** |

---

## Commands executed

```powershell
# SHA verify
Get-FileHash -Algorithm SHA256 "C:\xevn-apk\hrm-mobile-qa-device.apk"
# 5119B9592EAAE3998EDF52DC16500B2A741D89C130E7F36E278EBA7EFE6B8895

# L0
cd C:\xevn-ecosystem
pnpm run qc:dev-stack
# ✓ hrm 28001 · xbos 28002 · portal 5173 — HTTP 200

# Bundle audit (APK assets)
# isPilotKhoiFictionLabel / PLANE_A_COMPANY_LABELS / resolveCompanyDisplayVi / sanitizeOperatingUnitDisplayLabel → True

# Install
adb -s emulator-5554 install -r -g "C:\xevn-apk\hrm-mobile-qa-device.apk"
# Success

# Auth probe
node -e "fetch('http://127.0.0.1:28001/api/hrm/auth/mobile/login', ... ceo@xe.vn ...)"
# → 201 HRM-AUTH-200 PORTAL-GCEO

# Login + label audit
$env:HRM_API_BASE='http://127.0.0.1:28001'
$env:ADB_SERIAL='emulator-5554'
node scripts/qa-mobile-login-intent.mjs --email ceo@xe.vn --password "Xevn@2026"
# exit 0 home_reached:true

node scripts/tmp-qa-mob-g-orph-khoi-01-r2-device.mjs
# exit 1 — settings/scope navigation blocked; home+payslip zero Khối

# Post-reboot resume (2026-07-30 ~21:03 ICT)
emulator -avd xevn_api34  # emulator-5554 ready
pnpm run dev:hrm-api      # :28001 HTTP 200 after dist clean
adb -s emulator-5554 install -r -g C:\xevn-apk\hrm-mobile-qa-device.apk  # Success
node scripts/tmp-qa-mob-g-orph-khoi-01-r2-device.mjs  # exit 1 — same partial PASS
```

---

## AC-MOB-LABEL-01..07 verdict matrix

| AC | Requirement | Verdict | Device evidence |
|----|-------------|---------|-----------------|
| **01** | Scope membership title — no «Khối … X.E» | **NOT RUN** | Scope screen unreachable (no Settings entry) |
| **02** | Settings «Phạm vi đang dùng» | **NOT RUN** | No UI path to `SettingsScreen` |
| **03** | Home greeting `companyLabel` | **PASS** | `01-home.xml` · text=**Tập đoàn XeVN** |
| **04** | Payslip list subtitle | **PASS** | `05-payslip.xml` · 0 Khối; empty/network state |
| **05** | Login toast resolver | **N/A** | 1 membership — no multi toast |
| **06** | Offline fallback §4 only | **NOT PROMOTED** | Prior unit 32/32; no device offline toggle |
| **07** | F5 / re-open Scope stable | **NOT RUN** | Scope unreachable |
| **AC-MOB-OU-01** | OU rows Plane A | **NOT RUN** | Scope unreachable |
| **AC-MOB-OU-02** | JWT/filter unchanged | **NOT RUN** | Needs Scope Network audit |

**Register G-ORPH-MOB-01..03:** **partial** — Home/Payslip clean; Scope/Settings OU surfaces **unverified** on device.

---

## Navigation gap (P1 — blocks U65 exit)

Static audit: `SettingsScreen` / `ScopeScreen` registered on Profile stack, but **no** `navigation.navigate('Settings')` from Home/Profile/quick actions (`profileStackNav.ts` lacks `navigateToSettings`). Settings only links **to** Scope internally. Device QA attempted: Profile tab, scroll, header tap, `xevn://profile/settings` — none opened Settings.

**pm_dispatch_hint:** `D-MOB-SETTINGS-NAV-01` (dev-fe) — add Profile/Home entry (gear or ListRow «Cài đặt») → `navigateProfileStackScreen(..., 'Settings')`; then re-dispatch `QA-MOB-G-ORPH-KHOI-01-R3`.

---

## Artifacts

| Path | Description |
|------|-------------|
| `docs/qa/evidence/screenshots/qa-mob-g-orph-khoi-01-r2-20260730/01-home.png` | Home with **Tập đoàn XeVN** company strip |
| `docs/qa/evidence/screenshots/qa-mob-g-orph-khoi-01-r2-20260730/01-home.xml` | uiautomator — AC-03 |
| `docs/qa/evidence/screenshots/qa-mob-g-orph-khoi-01-r2-20260730/05-payslip.png` | Payslip tab |
| `docs/qa/evidence/screenshots/qa-mob-g-orph-khoi-01-r2-20260730/05-payslip.xml` | uiautomator — AC-04 |
| `scripts/tmp-qa-mob-g-orph-khoi-01-r2-device.mjs` | Device runner (reusable for R3) |

---

## completion_report

**Closed (this wave):** APK SHA gate; install; auth 201; bundle symbols; deep-link login; Home **Tập đoàn XeVN** (zero Khối); Payslip tab (zero Khối); documented Settings/Scope nav blocker with static code reference.

**Open / residual:**

- **P1:** No UI navigation to Settings → blocks AC-01/02/07 device proof.
- **P2:** AC-MOB-LABEL-06 device offline; AC-05 multi-membership toast (needs account with ≥2 memberships).
- **P2:** Network errors on emulator for some HRM calls (`HRM-MOB-ERR-NETWORK`) — does not affect label grep on captured surfaces.

---

## next_owner

`pm` → **`dev-fe`** (Settings nav entry) then **`qa-device`** (R3 Scope/Settings/F5).

---

## next_dispatch_prompt

```text
work_item_id: D-MOB-SETTINGS-NAV-01
from_role: pm
to_role: dev-fe
lane: execution
entry: QA-MOB-G-ORPH-KHOI-01-R2 FAIL_TO_PM — Home/Payslip zero Khối PASS; Settings/Scope NOT RUN — no navigate('Settings') from Profile/Home; evidence docs/qa/evidence/qa-mob-g-orph-khoi-01-r2-20260730.md
exit: Add visible «Cài đặt» entry (Profile header gear or ListRow) → navigateProfileStackScreen(..., 'Settings'); preserve JWT scope; jest/nav smoke; ack_status READY_FOR_QA; evidence docs/qa/evidence/d-mob-settings-nav-01-20260730.md
read_first: apps/mobile/hrm-mobile/src/navigation/profileStackNav.ts · SettingsScreen.tsx
must_keep: D-MOB-G-ORPH-KHOI-01 label resolver · Plane A labels
cấm: seed

---

work_item_id: QA-MOB-G-ORPH-KHOI-01-R3
from_role: pm
to_role: qa-device
lane: execution
entry: D-MOB-SETTINGS-NAV-01 READY + same APK SHA 5119B959…8895
exit: U65 ceo@xe.vn — Scope + Settings + Home + Payslip; zero «Khối … X.E» AC-MOB-LABEL-01..07; F5 Scope; ack_status PASS_TO_PM or FAIL_TO_PM; evidence docs/qa/evidence/qa-mob-g-orph-khoi-01-r3-20260730.md
cấm: seed · fake PASS
```

---

## evidence_path

`docs/qa/evidence/qa-mob-g-orph-khoi-01-r2-20260730.md`
