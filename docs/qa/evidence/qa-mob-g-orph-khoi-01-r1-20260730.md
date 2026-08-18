# QA-MOB-G-ORPH-KHOI-01-R1 — Device retest (Plane A labels)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-MOB-G-ORPH-KHOI-01-R1` |
| **date** | 2026-07-30 (ICT) |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **lane** | execution |
| **ack_status** | **FAIL_TO_PM** (device **partial unblock**; U65 label ACs **NOT RUN** — auth + stale APK) |
| **HOLD_DEPLOY** | true · **U65** zero-seed |
| **post-reset** | `D-DEV-RESET-TENANT-MASTER-01` — HRM employees=0 OK for empty state |
| **prior** | `docs/qa/evidence/qa-mob-g-orph-khoi-01-20260730.md` (adb empty) |
| **AC source** | `docs/qa/evidence/ba-mob-orph-khoi-label-01-20260730.md` §7 |

---

## Executive verdict

**FAIL_TO_PM** — Emulator **unblocked** (`emulator-5554`); qa-device APK **installed**; L0 stack **200**. Cannot execute U65 login → Scope → Settings → Home → Payslip for `ceo@xe.vn` because **mobile auth returns HRM-AUTH-401** (local + pilot) after tenant-master wipe, and installed APK **predates** `D-MOB-G-ORPH-KHOI-01` (2026-07-28 bundle lacks resolver symbols). **No fake PASS** on AC-MOB-LABEL-01..07.

| Gate | Result | Notes |
|------|--------|-------|
| `adb devices` | **PASS** | `emulator-5554 device` · AVD `xevn_api34` |
| L0 `qc:dev-stack` | **PASS** | HRM/XBOS/portal HTTP 200 (Node UV_HANDLE exit noise) |
| APK install | **PASS** | `adb install -r -g` Success |
| APK SHA-256 | **B9DCC6BC948A26F1B35FEADE01F84BB184CE5B333E35DBBEB6C66E100A644A31` | Built **2026-07-28 12:05** — **before** D-MOB fix **2026-07-30** |
| Bundle contains `isPilotKhoiFictionLabel` / `PLANE_A_COMPANY_LABELS` | **FAIL** | Grep `assets/index.android.bundle` — **no matches** |
| `POST …/auth/mobile/login` ceo@xe.vn local `:28001` | **401** `HRM-AUTH-401` | Body: «Email hoặc mật khẩu không đúng» |
| Pilot nip.io / `:3001` ceo login | **401** | Same code |
| `uat.nv0001@xe.vn` local after reset | **401** | Expected — zero employees post-reset |
| Deep-link login script ceo | **FAIL** | `qa-mobile-login-intent.mjs` exit 1 — API login failed |
| AC-MOB-LABEL-01..05, 07 device | **NOT RUN** | Blocked by auth + stale bundle |
| AC-MOB-LABEL-06 | **NOT PROMOTED** | Unit PASS in prior QA only — not device F5 |

---

## Environment trace

| Check | Command / detail | Result |
|-------|------------------|--------|
| Device | `adb devices -l` | `emulator-5554` · `sdk_gphone64_x86_64` |
| Emulator boot | `getprop sys.boot_completed` | `1` |
| Package | `pm path vn.xevn.hrm.mobile` | Installed; `versionName=1.0.0` · `firstInstallTime=2026-07-28` |
| APK path | `C:\xevn-apk\hrm-mobile-qa-device.apk` | 71,594,803 bytes |
| API (intended local) | `http://127.0.0.1:28001` | Health 200; auth 401 |
| Account (in-scope) | `ceo@xe.vn` / `Xevn@2026` | Group CEO per matrix |
| cấm | seed · probe-only UF 🟢 | **observed** — no seed, no fake PASS |

---

## Commands executed

```powershell
# L0
pnpm run qc:dev-stack
# ✓ hrm-api 28001 · xbos 28002 · portal 5173 — HTTP 200

# Emulator
Start-Process "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -ArgumentList "-avd","xevn_api34","-no-snapshot-load","-gpu","swiftshader_indirect"
adb devices
# emulator-5554    device

# APK gate
Get-FileHash -Algorithm SHA256 "C:\xevn-apk\hrm-mobile-qa-device.apk"
# B9DCC6BC948A26F1B35FEADE01F84BB184CE5B333E35DBBEB6C66E100A644A31

adb -s emulator-5554 install -r -g "C:\xevn-apk\hrm-mobile-qa-device.apk"
# Success

# Auth probe
node -e "fetch('http://127.0.0.1:28001/api/hrm/auth/mobile/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'ceo@xe.vn',password:'Xevn@2026'})}).then(r=>r.text()).then(console.log)"
# {"success":false,"code":"HRM-AUTH-401","message":"Email hoặc mật khẩu không đúng",...}

# Device login attempt
$env:HRM_API_BASE="http://127.0.0.1:28001"
$env:ADB_SERIAL="emulator-5554"
node scripts/qa-mobile-login-intent.mjs --email ceo@xe.vn --password "Xevn@2026"
# Error: API login failed: HRM-AUTH-401 · exit 1

# Screenshot (login shell — app launched, uiautomator idle timeout)
adb -s emulator-5554 shell am start -n vn.xevn.hrm.mobile/.MainActivity
adb -s emulator-5554 exec-out screencap -p > docs/qa/evidence/screenshots/qa-mob-g-orph-khoi-01-r1-20260730/01-login-screen.png
```

---

## AC-MOB-LABEL-01..07 verdict matrix

| AC | Requirement | Verdict | Notes |
|----|-------------|---------|-------|
| **01** | Scope membership title — no «Khối … X.E» | **NOT RUN** | Auth 401 |
| **02** | Settings «Phạm vi đang dùng» | **NOT RUN** | Auth 401 |
| **03** | Home greeting `companyLabel` | **NOT RUN** | Auth 401 |
| **04** | Payslip list subtitle | **NOT RUN** | Auth 401 |
| **05** | Login toast resolver | **NOT RUN** | Auth 401 |
| **06** | Offline fallback §4 only | **NOT PROMOTED** | Prior unit 32/32 only |
| **07** | F5 Scope stable | **NOT RUN** | Auth 401 |
| **AC-MOB-OU-01** | OU rows Plane A | **NOT RUN** | Auth 401 |
| **AC-MOB-OU-02** | JWT/filter unchanged | **NOT RUN** | Auth 401 |

**Register G-ORPH-MOB-01..03:** remain **OPEN**.

---

## Artifacts

| Path | Description |
|------|-------------|
| `docs/qa/evidence/screenshots/qa-mob-g-orph-khoi-01-r1-20260730/01-login-screen.png` | App login shell on emulator (pre-auth) |
| `docs/qa/evidence/qa-mob-g-orph-khoi-01-20260730.md` | Prior QA unit PASS + device BLOCKED |
| `docs/qa/evidence/d-mob-g-orph-khoi-01-20260730.md` | Dev vitest 32/32 · HOLD_DEPLOY |

---

## Unblock chain (concrete)

1. **`D-BE-MOB-AUTH-CEO-HASH-01`** (already DISPATCHED) — `POST /api/hrm/auth/mobile/login` for `ceo@xe.vn` / `Xevn@2026` must return **200** after tenant-master wipe (portal CEO row bootstrap per `mobile-auth.service.ts`). **Exit:** curl/node probe 200 before device retest.
2. **`D-MOB-G-ORPH-KHOI-BUILD-01`** (dev-mobile) — `BUILD_TARGET=qa-device` rebuild APK embedding `D-MOB-G-ORPH-KHOI-01`; publish path + SHA under `C:\xevn-apk\` or `apps/mobile/hrm-mobile/dist/`. **Exit:** bundle grep finds `isPilotKhoiFictionLabel` or `resolveCompanyDisplayVi`.
3. **Re-dispatch `QA-MOB-G-ORPH-KHOI-01-R2`** (qa-device) — emulator up; install new SHA; U65 path Scope/Settings/Home/Payslip; grep UI dumps for «Khối» / «Khối … X.E»; F5 Scope; **no seed**.

Optional parallel: authenticated `GET /operating-units` OU body audit → `D-HRM-EMP-COL-BE` only if raw Khối in JSON **and** sanitizer insufficient.

---

## completion_report

**Closed (this wave):** Emulator pipeline unblocked vs prior R0 (empty adb); APK install gate; auth failure documented with response body; stale-bundle proof (date + bundle grep); login screenshot captured; L0 stack confirmed post-reset.

**Open / residual:**

- **P0:** Mobile login **401** blocks all in-scope persona U65 paths post-reset.
- **P0:** QA-device APK **stale** — does not contain `D-MOB-G-ORPH-KHOI-01` label resolver.
- **P0:** AC-MOB-LABEL-01..05, 07 + AC-MOB-OU-01..02 device execution pending auth + BUILD.

---

## next_owner

`pm` → **`dev-be`** (auth) then **`dev-mobile`** (BUILD) then **`qa-device`** (R2).

---

## next_dispatch_prompt

```text
work_item_id: D-BE-MOB-AUTH-CEO-HASH-01
from_role: pm
to_role: dev-be
lane: execution
entry: QA-MOB-G-ORPH-KHOI-01-R1 FAIL — ceo@xe.vn mobile login HRM-AUTH-401 on :28001 after D-DEV-RESET-TENANT-MASTER-01; evidence docs/qa/evidence/qa-mob-g-orph-khoi-01-r1-20260730.md
exit: POST /api/hrm/auth/mobile/login ceo@xe.vn / Xevn@2026 → 200 HRM-AUTH-200; ensurePortalGroupCeoEmployeeRow without seed bulk; jest mobile-auth.service.spec; restart hrm-api if needed; ack_status READY_FOR_QA; evidence docs/qa/evidence/d-be-mob-auth-ceo-hash-01-20260730.md
then_chain: D-MOB-G-ORPH-KHOI-BUILD-01 (dev-mobile qa-device APK) → QA-MOB-G-ORPH-KHOI-01-R2 (qa-device AC-MOB-LABEL-01..07 U65)
cấm: seed bulk · fake PASS
```

---

## evidence_path

`docs/qa/evidence/qa-mob-g-orph-khoi-01-r1-20260730.md`
