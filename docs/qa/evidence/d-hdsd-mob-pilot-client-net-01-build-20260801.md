# D-HDSD-MOB-PILOT-CLIENT-NET-01-BUILD — qa-device APK (cleartext pilot :3001)

| Field | Value |
|-------|-------|
| **work_item_id** | `D-HDSD-MOB-PILOT-CLIENT-NET-01-BUILD` |
| **date** | 2026-08-01 (ICT) |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **ack_status** | **READY_FOR_QA** |
| **U65** | zero-seed — no `pnpm seed:*` |
| **HOLD_DEPLOY** | yes — local Hermes/APK only; no store / VPS / :8088 |
| **source wave** | `docs/qa/evidence/d-hdsd-mob-pilot-client-net-01-20260731.md` |
| **paired BE** | `D-HDSD-MOB-PILOT-TXN-NET-01` @ `c7fa7613` (deployed) |
| **git HEAD (build tree)** | `45208ed7ca34f1511cfcd9c7cda728fe251bf4cf` (`45208ed`) |

---

## Why rebuild

QA-HDSD-MOB-CH12-01-R5 FAIL on stale APK SHA `5119B959…8895` (2026-07-30) — bundle lacked **release** cleartext manifest from `D-HDSD-MOB-PILOT-CLIENT-NET-01`. Deep-link auth succeeded but leave/payslip showed `HRM-MOB-ERR-NETWORK` because Android blocked HTTP to `http://14.225.217.232:3001`.

| Check | Stale APK | This build |
|-------|-----------|------------|
| SHA-256 | `5119B9592EAAE3998EDF52DC16500B2A741D89C130E7F36E278EBA7EFE6B8895` | **`E17E7D83489E01927F54608D9F8574AB0B6E2C359439E03BEE1E92CAB7E98082`** |
| Bytes | `71596189` | **`71597624`** |
| mtime | 2026-07-30 17:09 | **2026-07-30 23:35 (+07)** |
| Release cleartext manifest | **missing in installed binary** | **embedded** (`network_security_config.xml` + `usesCleartextTraffic`) |

---

## APK publish (canonical)

| Field | Value |
|-------|-------|
| **Absolute path (junction)** | `C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk` |
| **Absolute path (ASCII twin)** | `C:\xevn-apk\hrm-mobile-qa-device.apk` (**same SHA**) |
| **Bytes** | `71597624` (68.28 MiB) |
| **SHA-256** | `E17E7D83489E01927F54608D9F8574AB0B6E2C359439E03BEE1E92CAB7E98082` |
| **BUILD_TARGET** | `qa-device` (`EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN=1`, `EXPO_PUBLIC_ENABLE_QA_DEEP_LINK=1`) |
| **ABI** | multi (`arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64`) |

APK contents include `res/xml/network_security_config.xml` and Hermes bundle with `normalizeHrmBaseUrl` + pilot `:3001` base.

---

## Pre-build verification

```text
cd apps/mobile/hrm-mobile
pnpm exec vitest run \
  src/integrations/__tests__/hrmApiClient.test.ts \
  src/integrations/__tests__/qaLoginDeepLink.test.ts \
  src/integrations/__tests__/normalizeHrmBaseUrl.test.ts
# → 3 files, 23 tests passed
```

---

## Build notes

| Item | Status |
|------|--------|
| Junction `C:\xevn-ecosystem` | Present → OneDrive repo |
| Junction `C:\rn74` | Present → react-native 0.74.5 |
| `GRADLE_PATH_RN_DIR` | `C:\rn74` |
| `GRADLE_USE_SUBST` | `1` |
| Command | `pnpm run android:apk:qa-device` @ `C:\xevn-ecosystem\apps\mobile\hrm-mobile` |
| Result | **BUILD SUCCESSFUL in 1m 30s** · exit 0 |

---

## Device smoke (emulator-5554)

```powershell
Get-FileHash -Algorithm SHA256 "C:\xevn-apk\hrm-mobile-qa-device.apk"
# E17E7D83489E01927F54608D9F8574AB0B6E2C359439E03BEE1E92CAB7E98082
# MUST ≠ 5119B9592EAAE3998EDF52DC16500B2A741D89C130E7F36E278EBA7EFE6B8895

adb -s emulator-5554 install -r -g "C:\xevn-apk\hrm-mobile-qa-device.apk"
adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile

$env:HRM_API_BASE='http://14.225.217.232:3001'
$env:ADB_SERIAL='emulator-5554'
node scripts/qa-mobile-login-intent.mjs
# → home_reached=true, fatal_logcat=false, api_base=http://14.225.217.232:3001
```

### Logcat — transactional tabs (no ERR-NETWORK)

After tab navigation (leave + payslip), logcat sample:

```text
[HRM-MOB] GET http://14.225.217.232:3001/api/hrm/attendance/leave-requests?company_id=holding&status=approved… x-company-id=holding Authorization=Bearer …
[HRM-MOB] GET http://14.225.217.232:3001/api/hrm/payroll/payslips?company_id=holding&employee_id=3796d949-… x-company-id=holding Authorization=Bearer …
[HRM-MOB] GET http://14.225.217.232:3001/api/hrm/attendance/leave-requests?company_id=10000000-0000-4000-8000-000000000001&employee_id=3796d949-… x-company-id=holding Authorization=Bearer …
```

| Metric | Result |
|--------|--------|
| `[HRM-MOB]` lines (post-nav sample) | **42** |
| `ERR-NETWORK` / `HRM-MOB-ERR-NETWORK` / Cleartext | **0** |
| Pilot base in requests | **`http://14.225.217.232:3001`** |
| `x-company-id` on GET | **`holding`** (not blocked `main`) |

---

## completion_report

**Closed:**

- Fresh qa-device APK built with release cleartext `network_security_config` + `D-HDSD-MOB-PILOT-CLIENT-NET-01` client bundle.
- Published to `dist/` + synced `C:\xevn-apk\` twin (same SHA).
- Installed emulator-5554; `uat.nv0001@xe.vn` deep-link @ pilot `:3001` → Home PASS.
- Logcat confirms leave/payslip API calls to pilot HTTP **without** `ERR-NETWORK`.
- Vitest 23/23 scoped pre-build; HOLD_DEPLOY respected.

**Residual (not this WI):**

- **J-MOB-05** manager pending count may still be 0 until `D-HDSD-MOB-PILOT-DATA-PENDING-01` (dev-be, U65).
- Payslip list may be empty or populated depending on BE data — network layer fixed; QA validates UI honest empty vs rows on R6.

---

## next_owner

`qa-device`

## next_dispatch_prompt

```text
work_item_id: QA-HDSD-MOB-CH12-01-R6
from_role: pm
to_role: qa-device
entry_criteria: APK SHA E17E7D83489E01927F54608D9F8574AB0B6E2C359439E03BEE1E92CAB7E98082 installed (C:\xevn-apk\hrm-mobile-qa-device.apk); emulator-5554 or physical device; pilot HRM http://14.225.217.232:3001; uat.nv0001@xe.vn / xevn-uat-2026 strict U65
exit_criteria: J-MOB-03 leave tab loads without HRM-MOB-ERR-NETWORK; J-MOB-04 payslip tab loads without ERR-NETWORK; logcat [HRM-MOB] GET :3001 on transactional paths; x-company-id ≠ main on wire; F5-equivalent cold restart still loads; screenshots for HDSD Ch.12 FIG if in-scope; ack_status PASS_TO_PM or FAIL_TO_PM with evidence
cấm: pnpm seed:* · probe-only UF 🟢 · stale APK 5119B959
evidence_path: docs/qa/evidence/qa-hdsd-mob-ch12-01-r6-20260801.md
HOLD_DEPLOY · no prod
```

## evidence_path

`docs/qa/evidence/d-hdsd-mob-pilot-client-net-01-build-20260801.md`
