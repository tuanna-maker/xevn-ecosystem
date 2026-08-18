# D-HDSD-MOB-BUILD-R7-01 — qa-device APK (JMOB05 profile-approvals-entry)

| Field | Value |
|-------|-------|
| **work_item_id** | `D-HDSD-MOB-BUILD-R7-01` |
| **date** | 2026-08-01 (ICT) |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **ack_status** | **READY_FOR_QA** |
| **U65** | zero-seed — no `pnpm seed:*` |
| **HOLD_DEPLOY** | yes — local Hermes/APK only; no store / VPS / :8088 |
| **source wave** | `docs/qa/evidence/d-hdsd-mob-jmob05-approvals-nav-01-20260801.md` |
| **git HEAD (build tree)** | `45208ed7ca34f1511cfcd9c7cda728fe251bf4cf` (`45208ed`) |

---

## Why rebuild

QA R6 J-MOB-05 FAIL — device stayed on Profile **Thông tin** without reaching **Duyệt**. Source fix `D-HDSD-MOB-JMOB05-APPROVALS-NAV-01` adds `ProfileManagerApprovalsEntry` (`testID profile-approvals-entry`) on the default info tab. Prior APK SHA `E17E7D83…98082` lacked this bundle.

| Check | Prior APK (R6) | This build |
|-------|----------------|------------|
| SHA-256 | `E17E7D83489E01927F54608D9F8574AB0B6E2C359439E03BEE1E92CAB7E98082` | **`EF82AED951525F62B5B5220A6BA288F335226D279F58129968164605581F4681`** |
| Bytes | `71597624` | **`71600690`** |
| `profile-approvals-entry` in bundle | **false** | **true** |
| `manager-approve-button` in bundle | partial/stale | **true** |
| Release cleartext manifest | yes | **yes** (`usesCleartextTraffic=true`, `networkSecurityConfig`) |

---

## APK publish (canonical)

| Field | Value |
|-------|-------|
| **Absolute path (junction)** | `C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk` |
| **Absolute path (ASCII twin)** | `C:\xevn-apk\hrm-mobile-qa-device.apk` (**same SHA**) |
| **Bytes** | `71600690` (68.28 MiB) |
| **SHA-256** | `EF82AED951525F62B5B5220A6BA288F335226D279F58129968164605581F4681` |
| **BUILD_TARGET** | `qa-device` (`EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN=1`, `EXPO_PUBLIC_ENABLE_QA_DEEP_LINK=1`) |
| **ABI** | multi (`arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64`) |

---

## Pre-build verification

```powershell
cd apps/mobile/hrm-mobile
pnpm exec vitest run
# → 93 files, 559 tests passed (incl. profileManagerApprovals + profileStackNav)
```

Minor test alignment: `dashboardHome.test.ts` — empty `companyId` → «Chưa chọn công ty»; raw slug without membership → `—` (Plane A fail-closed).

---

## Bundle audit (Hermes `index.android.bundle`)

| Marker | Present |
|--------|---------|
| `profile-approvals-entry` | **true** |
| `ProfileManagerApprovalsEntry` | **true** |
| `manager-approve-button` | **true** |
| `normalizeHrmBaseUrl` | **true** |

APK manifest (aapt2): `usesCleartextTraffic=true`, `networkSecurityConfig=@0x7f140003` — pilot HTTP `:3001` supported.

---

## Build notes

| Item | Status |
|------|--------|
| Junction `C:\xevn-ecosystem` | Present → OneDrive repo |
| Junction `C:\rn74` | Present → react-native 0.74.5 |
| `GRADLE_PATH_RN_DIR` | `C:\rn74` |
| `GRADLE_USE_SUBST` | `1` |
| Command | `pnpm run android:apk:qa-device` @ `C:\xevn-ecosystem\apps\mobile\hrm-mobile` |
| Result | **BUILD SUCCESSFUL in 2m 12s** · exit 0 |

---

## QA handoff (J-MOB-05 R7)

```powershell
Get-FileHash -Algorithm SHA256 "C:\xevn-apk\hrm-mobile-qa-device.apk"
# EF82AED951525F62B5B5220A6BA288F335226D279F58129968164605581F4681
# MUST ≠ E17E7D83489E01927F54608D9F8574AB0B6E2C359439E03BEE1E92CAB7E98082

adb install -r -g "C:\xevn-apk\hrm-mobile-qa-device.apk"
adb shell pm clear vn.xevn.hrm.mobile

$env:HRM_API_BASE='http://14.225.217.232:3001'
$env:ADB_SERIAL='emulator-5554'
node scripts/qa-mobile-login-intent.mjs  # uat.nv0001 smoke
# uat.nv0002 for J-MOB-05 manager path
```

Navigation paths: see `d-hdsd-mob-jmob05-approvals-nav-01-20260801.md` § Path A/B/C.

---

## completion_report

**Closed:**

- Fresh qa-device APK bundling **JMOB05** `profile-approvals-entry` + `manager-approve-button` on manager inbox cards.
- Published to `dist/` + synced `C:\xevn-apk\` twin (same SHA).
- Vitest **559/559** PASS; cleartext pilot `:3001` manifest retained; HOLD_DEPLOY respected.

**Residual (not this WI):**

- Device J-MOB-05 approve action + toast — **qa-device** `QA-HDSD-MOB-CH12-01-R7`.
- J-MOB-03/04 regression on leave/payslip tabs after install.

---

## next_owner

`qa-device`

## next_dispatch_prompt

```text
work_item_id: QA-HDSD-MOB-CH12-01-R7
from_role: pm
to_role: qa-device
entry_criteria: APK SHA EF82AED951525F62B5B5220A6BA288F335226D279F58129968164605581F4681 installed (C:\xevn-apk\hrm-mobile-qa-device.apk); pilot HRM http://14.225.217.232:3001; uat.nv0002@xe.vn / xevn-uat-2026; pendingAtt+pendingLeave≥1; U65 zero-seed
exit_criteria:
- Tab Hồ sơ (default Thông tin) → tap profile-approvals-entry OR «Cần duyệt (n)» → manager-approvals-screen with Duyệt (manager-approve-button) visible
- Tap Duyệt → confirm → success toast; no ERR-NETWORK / HRM-MOB-ERR-NETWORK
- J-MOB-03 leave + J-MOB-04 payslip regression PASS (no ERR-NETWORK @ :3001)
- evidence docs/qa/evidence/qa-hdsd-mob-ch12-01-r7-20260801.md
ack_status: PASS_TO_PM or FAIL_TO_PM
cấm: pnpm seed:* · stale APK E17E7D83…98082
read_first: docs/qa/evidence/d-hdsd-mob-jmob05-approvals-nav-01-20260801.md · docs/qa/evidence/d-hdsd-mob-build-r7-01-20260801.md
HOLD_DEPLOY · no prod
```

## evidence_path

`docs/qa/evidence/d-hdsd-mob-build-r7-01-20260801.md`
