# QA-HDSD-MOB-CH12-01 — HDSD Ch.12 Mobile device UAT

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HDSD-MOB-CH12-01` |
| **program** | `HDSD-P2-FULL-01` |
| **date** | 2026-07-30 (ICT) |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **lane** | execution |
| **ack_status** | **PASS_TO_PM** (GWC — UAT persona auth blocked; UI shell partial PASS) |
| **HOLD_DEPLOY** | true · **U65** zero-seed |
| **spec** | `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH12_MOBILE_HRM.md` |
| **matrix** | `docs/qa/HDSD_SRS_TESTCASE_MATRIX.md` TC-MOB-001..033 |

---

## Executive verdict

**PASS_TO_PM with conditions** — Release qa-device APK installed on `emulator-5554`; CH12 **navigation shell** (4-tab bar, Home quick-access grid, CheckIn, Profile segmented tabs) verified on device via UI dump. **HDSD W3 persona blocked:** `uat.nv####@xe.vn` / `xevn-uat-2026` returns **`HRM-AUTH-401`** on pilot `:3001` and local `:28001` (U65 — no seed). Session fallback `ceo@xe.vn` used for deep-link bootstrap only; not a substitute for TC-MOB-003/004 UAT NV acceptance.

| Gate | Result | Notes |
|------|--------|-------|
| `adb devices` | **PASS** | `emulator-5554` · `sdk_gphone64_x86_64` |
| Pilot API `:3001` | **PASS** | `GET /api/hrm` HTTP 200 |
| Local `:28001` | **INTERMITTENT** | Up during probe; `dev:hrm-api` crash `spreadsheet.module` missing — mobile used pilot |
| APK install | **PASS** | `C:\xevn-apk\hrm-mobile-qa-device.apk` |
| APK SHA-256 | **PASS** | `5119B9592EAAE3998EDF52DC16500B2A741D89C130E7F36E278EBA7EFE6B8895` |
| UAT login `uat.nv0001` | **FAIL** | 401 `HRM-AUTH-401` local + pilot |
| UAT login `uat.nv0002` | **FAIL** | 401 `HRM-AUTH-401` pilot |
| Fallback `ceo@xe.vn` login | **PASS** | 201 `HRM-AUTH-200` · deep-link home reached |
| CH12 §12.0 4-tab bar | **PASS** | Trang chủ · Đội nhóm · Phiếu lương · Hồ sơ |
| CH12 §12.2 Home | **PASS** | QuickAccessGrid tiles + FAB |
| CH12 §12.3 CheckIn | **PASS** | GPS + submit markers |
| CH12 §12.4 Leave list | **NOT RUN** | Automation back-key exited app; UAT persona blocked |
| CH12 §12.5 Payslip | **PARTIAL** | Tab label present run-1; later nav hit Gmail overlay — re-test after auth fix |
| CH12 §12.6 Approvals | **NOT RUN** | Requires manager UAT persona + pending queue |
| CH12 §12.7 Profile | **PASS (shell)** | Segmented tabs; CEO shows «Không tìm thấy hồ sơ» (expected persona gap) |

---

## Environment

| Item | Value |
|------|--------|
| Device | `emulator-5554` (API 34) |
| APK | `C:\xevn-apk\hrm-mobile-qa-device.apk` (71,596,189 bytes) |
| API base (session) | `http://14.225.217.232:3001` |
| Intended UAT account | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| Fallback (deep-link only) | `ceo@xe.vn` / `Xevn@2026` |
| Login method | `xevn://qa-login` via `scripts/qa-mobile-login-intent.mjs` (U65 — API auth, no seed) |
| Evidence screenshots/XML | `docs/qa/evidence/screenshots/hdsd-uat-mobile-ch12-20260730/` |

---

## Auth probe (U65 — no seed)

```text
POST http://127.0.0.1:28001/api/hrm/auth/mobile/login
  uat.nv0001@xe.vn / xevn-uat-2026 → 401 HRM-AUTH-401
  uat.nv0016@xe.vn / xevn-uat-2026 → 401 HRM-AUTH-401
  ceo@xe.vn / Xevn@2026           → 201 HRM-AUTH-200

POST http://14.225.217.232:3001/api/hrm/auth/mobile/login
  uat.nv0001@xe.vn / xevn-uat-2026 → 401 HRM-AUTH-401
  uat.nv0002@xe.vn / xevn-uat-2026 → 401 HRM-AUTH-401
  ceo@xe.vn / Xevn@2026           → 201 HRM-AUTH-200 · default_company_id=holding
```

**Blocker class:** `D-HDSD-MOB-UAT-AUTH-01` — mobile UAT workforce credentials absent/disabled on pilot + local without seed bootstrap.

---

## Commands executed

```powershell
adb devices -l
# emulator-5554 device

Get-FileHash -Algorithm SHA256 C:\xevn-apk\hrm-mobile-qa-device.apk
# 5119B9592EAAE3998EDF52DC16500B2A741D89C130E7F36E278EBA7EFE6B8895

adb -s emulator-5554 install -r -g C:\xevn-apk\hrm-mobile-qa-device.apk
# Success

$env:HRM_API_BASE='http://14.225.217.232:3001'
$env:ADB_SERIAL='emulator-5554'
node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026
# exit 1 — API login failed HRM-AUTH-401

node scripts/qa-mobile-login-intent.mjs --email ceo@xe.vn --password Xevn@2026
# exit 0 home_reached:true

node scripts/tmp-hdsd-ch12-device-walk-20260730.mjs
# exit 1 — partial; back-key exited app on leave step

node scripts/tmp-hdsd-ch12-r2-device-20260730.mjs
# exit 1 — uiautomator flake + Gmail overlay on emulator
```

---

## CH12 / J-MOB journey matrix (device)

| HDSD § | J-MOB | UF | Device verdict | Evidence |
|--------|-------|-----|----------------|----------|
| 12.0 Tab bar (4 tab) | J-MOB-01 | — | 🟢 PASS | `01-home.xml` — Trang chủ/Đội nhóm/Phiếu lương/Hồ sơ |
| 12.0 FAB CheckIn | J-MOB-02 | UF-HRM-05 | 🟢 PASS | `01-home.xml` `check-in-fab` · `02-checkin.xml` |
| 12.1 UAT login | J-MOB-01 | UF-XBOS-01 | 🔴 **BLOCKED** | uat.nv#### 401 — TC-MOB-003/004 |
| 12.2 Home / QuickAccess | J-MOB-06..08 | UF-HRM-05 | 🟢 PASS | `01-home.xml` tiles: Chấm công, Nghỉ phép, Phiếu lương, Duyệt |
| 12.3 Team directory | J-MOB-30 | UF-HRM-04 | 🟡 NOT RUN | Nav flake (Gmail overlay); tab visible on Home |
| 12.3 CheckIn GPS | J-MOB-02 | UF-HRM-04 | 🟢 PASS | `02-checkin.xml` Vị trí + check-in-submit |
| 12.4 Leave list → detail | J-MOB-03 | UF-HRM-23 | 🟡 NOT RUN | UAT persona + automation exit |
| 12.5 Payslip list → detail | J-MOB-04 | UF-HRM-06 | 🟡 PARTIAL | Home tile + tab label; full list not stable this run |
| 12.6 Manager approvals / Duyệt | J-MOB-05 | — | 🟡 NOT RUN | Needs uat.nv0002 manager + pending≥1 (U65) |
| 12.7 Profile tabs | J-MOB-17 | J-MOB-06 | 🟢 PASS (shell) | `05-profile.xml` profile-screen · Thông tin/Công việc/Tài liệu |
| 12.8 Notifications | J-MOB-07 | — | 🟡 NOT RUN | Bell present Home; screen not captured cleanly |

---

## TC-MOB spot verdicts (CH12 scope)

| ID | HDSD anchor | Verdict | Notes |
|----|-------------|---------|-------|
| TC-MOB-001 | §12.0 4-tab | 🟢 | Device dump |
| TC-MOB-002 | §12.0 FAB | 🟢 | `check-in-fab` + CheckIn screen |
| TC-MOB-003 | §12.0 UAT account | 🔴 | uat.nv#### 401 |
| TC-MOB-004 | §12.1 Login | 🔴 | Cannot exercise UAT password path |
| TC-MOB-005 | §12.1 post-login | 🟡 | ceo deep-link only |
| TC-MOB-008..011 | §12.2 Home | 🟢 | HomeTopBar + QuickAccessGrid |
| TC-MOB-012..014 | §12.3 Attendance/Team | 🟡 | CheckIn PASS; Team NOT RUN |
| TC-MOB-015..018 | §12.4 Leave | 🟡 | NOT RUN (auth + nav) |
| TC-MOB-019..022 | §12.5 Payslip | 🟡 | PARTIAL |
| TC-MOB-023..025 | §12.6 Approvals | 🟡 | NOT RUN |
| TC-MOB-026..030 | §12.7 Profile | 🟢 | Shell IA PASS |
| TC-MOB-031..032 | §12.8–12.9 | 🟡 | NOT RUN |

---

## Observations (persona / network)

- Home (`01-home.xml`) shows **«Tập đoàn XeVN»** scope label (Plane A — no «Khối … X.E»).
- Intermittent **«Network request failed»** / `HRM-MOB-ERR-NETWORK` on attendance stats — emulator → pilot latency; login/session still OK.
- Profile (`05-profile.xml`): **«Không tìm thấy hồ sơ»** for `ceo@xe.vn` — portal CEO lacks ESS employee row; expected until UAT NV auth restored.
- `x-company-id: main` **not** observed in session; holding slug used for group CEO (prior MOB-HEADER gate class).

---

## Residual / conditions (PM dispatch)

| ID | Severity | Owner | Trigger |
|----|----------|-------|---------|
| **C1** | P0 | `dev-be` / `devops` | Restore `uat.nv####@xe.vn` mobile login on pilot `:3001` **without seed** (auth/DB workforce row regression) |
| **C2** | P0 | `qa-device` | Re-run full CH12 walk with `uat.nv0001` after C1 — J-MOB-03/04/05 list→detail→Duyệt |
| **C3** | P1 | `qa-device` | Stabilize walk script: tab-nav only (no `KEYCODE_BACK`); dismiss Gmail overlay on cold emulator |
| **C4** | P2 | `devops` | Local `:28001` dev stack — fix `spreadsheet.module` missing in `hrm-api` dist for L0 parity |

---

## completion_report

**Closed this wave:** APK SHA gate + install; pilot API probe; UAT auth matrix documented (401); device evidence for CH12 **§12.0–12.3 CheckIn + §12.2 Home + §12.7 Profile shell** with XML/screenshot paths; automation scripts `tmp-hdsd-ch12-device-walk-20260730.mjs` + `tmp-hdsd-ch12-r2-device-20260730.mjs` committed for re-run.

**Open:** UAT NV login; Leave list/detail; Payslip detail; Manager Duyệt (J-MOB-05); Team directory tab load; Notifications screen — all blocked on **C1** or nav flake **C3**.

---

## next_owner

`pm` → dispatch **`dev-be`** (C1 auth) then **`qa-device`** (C2 retest)

---

## next_dispatch_prompt

```text
work_item_id: D-HDSD-MOB-UAT-AUTH-01
from_role: pm
to_role: dev-be
entry_criteria: POST /api/hrm/auth/mobile/login uat.nv0001@xe.vn / xevn-uat-2026 returns 401 on pilot :3001 and local :28001; evidence docs/qa/evidence/hdsd-uat-mobile-20260730.md; U65 no seed
exit_criteria: uat.nv0001 + uat.nv0002 mobile login 201 HRM-AUTH-200 on pilot :3001; no password/hash regression for xevn-uat-2026; READY_FOR_QA
evidence_path: docs/qa/evidence/d-hdsd-mob-uat-auth-01-20260730.md
ack_status: READY_FOR_QA

Then:
work_item_id: QA-HDSD-MOB-CH12-01-R2
to_role: qa-device
entry: C1 closed; uat.nv0001 login; APK SHA 5119B959…8895
exit: Full CH12 J-MOB-03/04/05 device PASS; update hdsd-uat-mobile evidence; PASS_TO_PM
```

---

## R2 retest — QA-HDSD-MOB-CH12-01-R2 (2026-07-30 PM)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HDSD-MOB-CH12-01-R2` |
| **ack_status** | **PASS_TO_PM** (entry gate FAIL — auth still blocked) |
| **detail evidence** | `docs/qa/evidence/qa-hdsd-mob-ch12-01-r2-20260730.md` |

### Entry gate

| Check | Result |
|-------|--------|
| `D-HDSD-MOB-UAT-AUTH-01` READY_FOR_QA | **FAIL** — still IN FLIGHT on bus |
| `uat.nv0001@xe.vn` pilot login 201 | **FAIL** — 401 `HRM-AUTH-401` |
| APK SHA / install | **PASS** — unchanged `5119B959…8895` |

### J-MOB strict (uat.nv persona)

| J-ID | R2 verdict |
|------|------------|
| J-MOB-03 leave list→detail | 🔴 BLOCKED (auth) |
| J-MOB-04 payslip list→detail | 🔴 BLOCKED (auth) |
| J-MOB-05 approvals / Duyệt | 🔴 BLOCKED (auth) |

**Next:** PM → dev-be close `D-HDSD-MOB-UAT-AUTH-01` → qa-device `QA-HDSD-MOB-CH12-01-R3`.
