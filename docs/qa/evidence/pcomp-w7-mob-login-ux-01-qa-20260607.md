# PCOMP-W7-MOB-LOGIN-UX-01 — QA retest (J-MOB-01 sponsor login UX)

**Date:** 2026-06-07  
**work_item_id:** PCOMP-W7-MOB-LOGIN-UX-01  
**role:** qa  
**journey:** J-MOB-01  
**pilot:** https://14-225-217-232.nip.io  
**account:** uat.nv0001@xe.vn / xevn-uat-2026  
**ack_status:** PASS_TO_PM

## Scope

Validate dev-mobile split: **release** APK (`EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN=0`) shows sponsor email+password only; bundle flag grep; fresh Gradle artifact; nip.io mobile login API.

## Environment

| Item | Value |
|------|-------|
| Device | emulator-5554 (API 33) |
| APK (release) | `apps/mobile/hrm-mobile/dist/hrm-mobile-release-login-ux-01.apk` (63,950,548 B) |
| APK aliases | `hrm-mobile-release.apk`, `hrm-mobile-release-w7.apk`, `hrm-mobile-release-fullstack.apk` |
| Build | `GRADLE_SKIP_BUNDLE_TASK=1` + `GRADLE_USE_SUBST=1` + `-PreactNativeArchitectures=x86_64` |
| L0 stack | **Skipped** — mobile-only wave; backend not changed |

## Results

| # | Exit criterion | Result | Evidence |
|---|----------------|--------|----------|
| 1 | Rebuild release APK | **PASS** | Gradle `assembleRelease` exit 0 (subst drive; first `android:apk` failed MAX_PATH on CMake) |
| 2 | Login UI sponsor-only (no dev URL/JWT) | **PASS** | Screenshot `login9.png`; UI dump baseline `login3.xml` (pre-fix old APK) showed dev fields |
| 3 | Manual login → Home | **NOT adb-verified** | Clipboard `cmd clipboard set` → «No shell command implementation»; `input text` + keyevent mangled → white screen / launcher; **API HRM-AUTH-200** confirms contract |
| 4 | Bundle `EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN=0` | **PASS** | Grep staged bundle + installed release APK extract |
| 5 | qa-device + `scripts/qa-mobile-login-intent.mjs` | **Documented** | See § Automated path below |
| 6 | L0 `qc:dev-stack` | **N/A** | Stack untouched |
| 7 | Evidence file | **PASS** | This file |

### Bundle flag grep (release APK)

```text
EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN": { value: "0" }
EXPO_PUBLIC_ENABLE_QA_DEEP_LINK": { value: "0" }
```

Source: `dist/verify-apk/assets/index.android.bundle` after fresh Gradle build.

### API — mobile login (nip.io)

```text
POST https://14-225-217-232.nip.io/api/hrm/auth/mobile/login
{ "email": "uat.nv0001@xe.vn", "password": "xevn-uat-2026" }
→ success: true, code: HRM-AUTH-200, company_id: holding, roles: [employee, manager, hr_manager]
```

### Unit tests

```text
pnpm test:hrm-mobile -- src/config/__tests__/qaLogin.test.ts → 5/5 PASS
pnpm test:hrm-mobile → 25 files, 143 tests PASS
```

### Login UI (release APK, `pm clear` + cold start)

Screenshot `docs/qa/evidence/pcomp-w7-mob-login-ux-01-screens/login9.png`:

- Email + Mật khẩu + «Đăng nhập» only
- Hint: «Đăng nhập bằng email và mật khẩu…»
- **Absent:** URL máy chủ (dev), «Đăng nhập dev», tenantId, Bearer token

**Pre-fix baseline** (`login3.xml` on old 66,851,388 B APK): dev URL + «Ẩn đăng nhập dev» + tenantId visible — **fixed** in new artifact.

### Install note

`adb install -r` did not replace APK bytes (device kept 66,851,388 B old build). **`adb uninstall` + fresh install** required to get 63,950,548 B release with flag 0.

## Automated path (qa-device — separate from sponsor release)

| Target | Command | Flags | Automation |
|--------|---------|-------|------------|
| **Sponsor / pilot** | `pnpm --filter hrm-mobile run android:apk` | `QA_DEV_LOGIN=0`, `QA_DEEP_LINK=0` | Manual email+password (sponsor UAT) |
| **QA device / adb** | `pnpm --filter hrm-mobile run android:apk:qa-device` | `QA_DEV_LOGIN=1`, `QA_DEEP_LINK=1` | `node scripts/qa-mobile-login-intent.mjs` (`xevn://qa-login` deep link; bypasses API33 TextInput) |

`scripts/qa-mobile-login-intent.mjs` header documents qa-device APK requirement. **Do not** use on release APK (deep link disabled).

## Residual / PM dispatch

| ID | Item | Owner | Notes |
|----|------|-------|-------|
| **C-W4QC-SAFE-ADB-01** | adb sponsor email+password → Home on API33 | qa-device | Reuse `ADBKeyboard` / Appium; API + UI PASS; not product defect |
| **D-W7-MOB-GRADLE-MAXPATH-01** | Default `android:apk` CMake MAX_PATH on Windows without `GRADLE_USE_SUBST=1` | dev-mobile/devops | Document in `build-apk.cjs` / runbook |

## Defects

None **product** P0/P1 for sponsor login UX split. Tooling gap only (adb manual login).

## completion_report

**Closed:** Fresh release APK with `QA_DEV_LOGIN=0` / `QA_DEEP_LINK=0`; sponsor login screen verified (screenshot); bundle grep PASS; nip.io `HRM-AUTH-200` for uat.nv0001; qaLogin + full mobile unit suite PASS; qa-device automation path documented.

**Open:** J-MOB-01 device Home via adb email+password (tooling); sponsor manual tap sign-off optional for QC GWC.

## next_owner

`pm` → optional `qa-device` for adb Home automation on qa-device APK; `qc` for release UX gate.

## next_dispatch_prompt

```
work_item_id: PCOMP-W7-MOB-LOGIN-UX-01
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
summary: Release APK sponsor login UX PASS — QA_DEV_LOGIN=0 bundle grep + login9.png (email/password only); API HRM-AUTH-200 uat.nv0001 @ nip.io; Gradle release 63.9MB installed after uninstall. Residual: adb manual login→Home blocked API33 (C-W4QC-SAFE-ADB-01); qa-device deep-link path documented separately.
evidence_path: docs/qa/evidence/pcomp-w7-mob-login-ux-01-qa-20260607.md
pm_dispatch_hint: optional qa-device PCOMP-W7-MOB-DEVICE-LOGIN-01 retest with android:apk:qa-device + scripts/qa-mobile-login-intent.mjs for J-MOB-01 Home automation; QC gate sponsor UX with login9.png
```
