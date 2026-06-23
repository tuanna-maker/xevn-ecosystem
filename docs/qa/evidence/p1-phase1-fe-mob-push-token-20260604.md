# P1-PHASE1-FE-MOB-PUSH-TOKEN-01 — Push token guard (QA R3 strict)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-PHASE1-FE-MOB-PUSH-TOKEN-01` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa` |
| **date** | 2026-06-04 |
| **ack_status** | **READY_FOR_QA** |
| **parent_qa** | `P1-PHASE1-QA-MOB-JMOB-01-R3` FAIL strict (`p1-phase1-qa-mob-jmob-20260604-r3.md`) |

## Root cause

| Symptom | Cause | Fix |
|---------|-------|-----|
| RN toast *Possible unhandled promise rejection* (`ExpoPushTokenManager.getDevicePushTokenAsync` / Firebase not initialized) on payslip + approve screens | `AuthContext.signIn` called `void registerHrmPushToken(...)` without catch; release APK has no `google-services.json` but still invoked native FCM path after login + `RealtimeProvider` | Gate push via `isPushRegistrationEnabled()` (`EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION=0` on release bundle); `safeGetExpoPushToken()` try/catch; all callers use `tryRegisterExpoPushToken().catch(() => undefined)` |

## Code touchpoints

- `apps/mobile/hrm-mobile/src/integrations/pushRegistration.ts` — `isPushRegistrationEnabled`, `safeGetExpoPushToken`, hardened `registerHrmPushToken` / `tryRegisterExpoPushToken`
- `apps/mobile/hrm-mobile/src/context/AuthContext.tsx` — sign-in uses safe wrapper + `.catch`
- `apps/mobile/hrm-mobile/src/context/RealtimeContext.tsx` — explicit `.catch` on void registration
- `apps/mobile/hrm-mobile/scripts/build-apk.cjs` — bundle `EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION=0` by default
- `apps/mobile/hrm-mobile/src/integrations/__tests__/pushRegistration.test.ts` — disabled path + Firebase rejection swallow

## Verification

| Check | Command / artifact | Result |
|-------|-------------------|--------|
| Unit | `pnpm test:hrm-mobile` | **28/28 PASS** |
| Bundle audit | `index.android.bundle` | `EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION":"0"` + `isPushRegistrationEnabled` present |
| Release APK | `pnpm run android:apk` (`GRADLE_USE_SUBST=1`, nip.io base) | **PASS** |

## APK (qa-device R4)

| Property | Value |
|----------|-------|
| Path | `apps/mobile/hrm-mobile/dist/hrm-mobile-release.apk` |
| Size | 66,192,045 bytes (2026-06-04 push-guard build) |
| Base URL (bundled) | `https://14-225-217-232.nip.io` |
| Push registration | **Off** (`EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION=0`) until FCM/`google-services.json` wired |
| Account | `uat.nv0001@xe.vn` / `xevn-uat-2026` |

**Pre-test:** `adb shell pm clear vn.xevn.hrm.mobile` before install.

## J-* retest scope (qa-device R4 strict)

| J-ID | Expect |
|------|--------|
| **J-MOB-04** | Payslip list ≥1 → detail **Thực lĩnh**; **no** RN rejection toast |
| **J-MOB-05** | Pending **Duyệt** → **Thành công** Vietnamese; **no** RN rejection toast |

Regression: **J-MOB-01**, **J-MOB-03** unchanged.

## Residual

- Expo push to HRM API **disabled** on this pilot APK — enable with `EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION=1` after `google-services.json` + FCM credentials per `EXPO_BUILD_CHECKLIST.md`.
- nip.io `pending=0` without seed — DevOps parity (unchanged from R3).

## completion_report

- Closed QA R3 strict blocker: unhandled `getDevicePushTokenAsync` / Firebase rejection on J-MOB-04/05 routes.
- Auth + Realtime push paths now best-effort and non-fatal; release bundle skips native push until FCM configured.
- Rebuilt `dist/hrm-mobile-release.apk`; vitest 28/28 PASS.

## next_owner

`qa` (qa-device R4)

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-QA-MOB-JMOB-01-R4
from_role: pm
to_role: qa
entry_criteria: P1-PHASE1-FE-MOB-PUSH-TOKEN-01 READY_FOR_QA — APK apps/mobile/hrm-mobile/dist/hrm-mobile-release.apk (66,192,045 B, push guard 2026-06-04); evidence p1-phase1-fe-mob-push-token-20260604.md; bundle EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION=0
exit_criteria: adb pm clear + install APK; J-MOB-04/05 strict PASS — payslip/approve functional + no RN ExpoPushToken/Firebase rejection toast; screens under docs/qa/evidence/p1-phase1-qa-mob-jmob-screens/; verdict PASS_TO_PM or FAIL with layer
evidence_path: docs/qa/evidence/p1-phase1-qa-mob-jmob-20260604-r4.md
ack_status: PASS_TO_PM
```

## evidence_path

`docs/qa/evidence/p1-phase1-fe-mob-push-token-20260604.md`
