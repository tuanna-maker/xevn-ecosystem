# PCOMP-W7-MOB-LOGIN-UX-01 — Sponsor login UX split (release vs qa-device)

**Date:** 2026-06-07  
**work_item_id:** PCOMP-W7-MOB-LOGIN-UX-01  
**role:** dev-mobile  
**ack_status:** READY_FOR_QA

## Problem

Release APK bundled `EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN=1` (default in `build-apk.cjs` line 130), exposing dev URL, tenantId, Bearer fields on the login screen. QA-device used **Dev sign-in** because adb `input text` mangles email on API 33 — not the intended sponsor journey (email + password → `POST /auth/mobile/login`).

## Changes

| File | Change |
|------|--------|
| `apps/mobile/hrm-mobile/scripts/build-apk.cjs` | Split `BUILD_TARGET`: **release** (default) sets `EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN=0`, `EXPO_PUBLIC_ENABLE_QA_DEEP_LINK=0`; **qa-device** (`--qa-device`) sets both `1`. Outputs `hrm-mobile-release*.apk` vs `hrm-mobile-qa-device.apk`. |
| `apps/mobile/hrm-mobile/package.json` | Added `android:apk:qa-device` → `node scripts/build-apk.cjs --qa-device`. |
| `apps/mobile/hrm-mobile/src/config/qaLogin.ts` | Explicit `0/false/no` disables dev login even when `__DEV__`; documented sponsor vs qa-device targets. |
| `apps/mobile/hrm-mobile/src/config/__tests__/qaLogin.test.ts` | 5 tests for flag matrix. |
| `scripts/qa-mobile-login-intent.mjs` | Header documents qa-device APK requirement. |
| `LoginScreen.tsx` | **No code change** — production path already correct: `onMobileLogin` → `hrmRequest('/auth/mobile/login')` → `signInWithMobileLogin`. Dev UI gated by `isQaDevLoginEnabled()`. |

## Build targets

| Command | `EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN` | `EXPO_PUBLIC_ENABLE_QA_DEEP_LINK` | Output | Login UI |
|---------|-----------------------------------|-----------------------------------|--------|----------|
| `pnpm --filter hrm-mobile run android:apk` | `0` | `0` | `dist/hrm-mobile-release.apk` (+ w7, fullstack aliases) | Email + password + hint only |
| `pnpm --filter hrm-mobile run android:apk:qa-device` | `1` | `1` | `dist/hrm-mobile-qa-device.apk` | + dev URL, JWT form, `xevn://qa-login` deep link |

Override via env still supported: `EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN=1 pnpm … android:apk`.

## Verification

### Unit / typecheck

```text
pnpm test:hrm-mobile  → 25 files, 143 tests PASS
pnpm --filter hrm-mobile run lint → tsc PASS
```

### API — `onMobileLogin` contract (uat.nv0001 @ nip.io)

```text
POST https://14-225-217-232.nip.io/api/hrm/auth/mobile/login
{ "email": "uat.nv0001@xe.vn", "password": "xevn-uat-2026" }
→ HRM-AUTH-200, tenant=xevn, company=holding, roles=[employee,manager,hr_manager], access_token present
```

`signInWithMobileLogin` maps `active_membership` → `tenantId`, `companyId`, `companyUuid`, `employeeId` from API (AuthContext).

### Bundle flag smoke (prebundle log)

```text
node scripts/build-apk.cjs --qa-device  (prebundle only)
→ BUILD_TARGET=qa-device, QA_DEV_LOGIN=1, QA_DEEP_LINK=1

BUILD_TARGET=release (default)
→ QA_DEV_LOGIN=0, QA_DEEP_LINK=0
```

### PCOMP-W7-MOB-DEVICE-LOGIN-01

- **Root cause:** QA used Dev sign-in on release APK with QA flags on; adb cannot type email for standard button on API 33.
- **Fix:** Sponsor APK hides dev form; qa-device APK keeps dev + deep link (`scripts/qa-mobile-login-intent.mjs`).
- **Device retest:** QA must install **fresh** `android:apk` (flags 0) for sponsor login screenshot, or `android:apk:qa-device` + deep-link script for automated J-MOB-01.

### Device note (this session)

`qa-mobile-login-intent.mjs` exit 1 — `vn.xevn.hrm.mobile` not installed on `emulator-5554`. QA retest after APK install.

## QA dispatch (L2.5)

| Journey | Account | Method | Expect |
|---------|---------|--------|--------|
| J-MOB-01 | `uat.nv0001@xe.vn` / `xevn-uat-2026` | Manual email+password on **release** APK | Home (Trang chủ / Việc cần làm) |
| J-MOB-01 (automated) | same | `node scripts/qa-mobile-login-intent.mjs` on **qa-device** APK | Home via deep link |

## Residual

- Full Gradle release APK not rebuilt in this wave (prebundle flag log verified; prior bundle in `android/app/src/main/assets` still has `QA_DEV_LOGIN=1` until QA/DevOps runs `android:apk`).
- Sponsor manual login on device pending fresh release install.

## completion_report

Closed: build split release vs qa-device; qaLogin explicit false; tests 143/143; nip.io mobile login API PASS for uat.nv0001; LoginScreen production path confirmed unchanged.

Open: device Home verification on new release APK; Gradle rebuild artifact for sponsor demo.

## next_owner

`qa` (then `qa-device` for J-MOB-01 automated path)

## next_dispatch_prompt

```
work_item_id: PCOMP-W7-MOB-LOGIN-UX-01
from_role: dev-mobile
to_role: qa
entry_criteria: build-apk.cjs defaults QA_DEV_LOGIN=0 for android:apk; qaLogin.test.ts PASS; nip.io POST /auth/mobile/login uat.nv0001 HRM-AUTH-200 — docs/qa/evidence/pcomp-w7-mob-login-ux-01-20260607.md
exit_criteria: Rebuild release APK (`pnpm --filter hrm-mobile run android:apk`); install on emulator; J-MOB-01 manual email+password reaches Home (no dev URL/JWT fields visible); grep bundle EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN=0; L0 qc:dev-stack if stack touched
evidence_path: docs/qa/evidence/pcomp-w7-mob-login-ux-01-qa-YYYYMMDD.md
pm_dispatch_hint: automated adb path → qa-device APK + scripts/qa-mobile-login-intent.mjs
```
