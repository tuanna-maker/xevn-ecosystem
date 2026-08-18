# Evidence — PO-UC-TC-W4-DEV-MOB-NT02-FCM-QA-DEVICE-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W4-DEV-MOB-NT02-FCM-QA-DEVICE-01` |
| **uc_id** | `HRM-NT-02` |
| **from_role** | dev-mobile |
| **to_role** | qa-device |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-04 |
| **prior_fail** | `docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-mob-01-r1.md` |
| **u65_zero_seed** | true |
| **change_mode** | FIX |

---

## Option choice (least-risk that works on emulator)

| Option | Decision |
|--------|----------|
| **A** Wire `google-services.json` + Gradle plugin | **DONE (scaffolding)** — `google-services.json.example` + conditional `com.google.gms.google-services`; sync via `GOOGLE_SERVICES_JSON` or local gitignored file. **No real Firebase file on this machine** → plugin not applied this build. |
| **B** qa-device Expo-format path without FirebaseApp | **SELECTED for R2 unblock** — when `getExpoPushTokenAsync` fails and `EXPO_PUBLIC_QA_PUSH_TOKEN_FALLBACK=1` (qa-device default), POST `ExponentPushToken[qa-device-<slug>]` via same FE register chain. Release stays `0`. Aligns U47 (outbound push = Phase 2 / real FCM). |
| **C** BLOCKED-EXTERNAL | **Not selected as terminal state** — sponsor Firebase Android config still required for **real** Expo/FCM tokens + delivery; documented below. |

**Not done:** fake DB rows · seed inbox · commit prod secrets · claim `uat_done`.

---

## Root cause (R1)

On APK SHA `50C8F7…389F` with `PUSH_REG=1`:

1. `FirebaseApp` failed — no `google-services.json` / Gradle plugin.
2. `Notifications.getExpoPushTokenAsync` throws → `safeGetExpoPushToken` returned `null`.
3. Chain stopped **before** `POST …/notifications/push-tokens` → 0× `HRM-NOTIF-201` in logcat.

---

## How token forms on emulator (R2 expect)

```text
login (deep-link uat.nv0007) → permission granted
  → getExpoPushTokenAsync
       ├─ success (+ google-services present) → token source=expo-fcm → POST platform=expo
       └─ fail (FirebaseApp missing) + QA_PUSH_FALLBACK=1
            → ExponentPushToken[qa-device-<employeeIdSlug>]
            → logcat [HRM-MOB] push-token-source=qa-device-fallback
            → POST …/notifications/push-tokens
            → logcat [HRM-MOB] push-tokens POST ok=true code=HRM-NOTIF-201
            → (+ QA_DEEP_LINK) [HRM-MOB] POST <url>/notifications/push-tokens …
```

---

## Files touched

| Path | Change |
|------|--------|
| `apps/mobile/hrm-mobile/android/app/google-services.json.example` | Placeholder Firebase Android config (package `vn.xevn.hrm.mobile`) |
| `apps/mobile/hrm-mobile/android/build.gradle` | `classpath com.google.gms:google-services:4.4.2` |
| `apps/mobile/hrm-mobile/android/app/build.gradle` | Apply plugin **only if** `google-services.json` exists |
| `apps/mobile/hrm-mobile/.gitignore` | Ignore real `android/app/google-services.json` |
| `apps/mobile/hrm-mobile/scripts/build-apk.cjs` | `ensureGoogleServicesJson`; qa-device default `QA_PUSH_FALLBACK=1` |
| `apps/mobile/hrm-mobile/src/integrations/pushRegistration.ts` | Fallback + logcat; CODE-MEMORY APPEND |
| `apps/mobile/hrm-mobile/src/integrations/__tests__/pushRegistration.test.ts` | 11 tests incl. fallback POST |
| `apps/mobile/hrm-mobile/.env.example` | Document Option A path + fallback flag |

---

## Verify (dev-mobile)

```text
pnpm exec vitest run src/integrations/__tests__/pushRegistration.test.ts
→ 11 passed
```

Bundle audit (Hermes source strings present): `push-token-source=qa-device-fallback`, `push-token-source=expo-fcm`.

Build log: `PUSH_REG=1`, `QA_PUSH_FALLBACK=1`, `google-services.json absent`.

---

## APK artifact

| Item | Value |
|------|--------|
| Command | `pnpm run android:apk:qa-device` @ `C:\xevn-ecosystem\apps\mobile\hrm-mobile` · `GRADLE_PATH_RN_DIR=C:\rn74` |
| Output | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| Twin | `C:\xevn-apk\hrm-mobile-qa-device.apk` |
| Bytes | 71,602,809 |
| **SHA256** | `4963D5FA8C165C987929475B35775659018E3353B34B7AEAD3644EE265A4BBB1` |
| Supersedes R1 | `50C8F7D5912F75A38A2E2107CF2E29286FBFA5D45635A6D8284DEC70BCA2389F` |
| Gradle | **BUILD SUCCESSFUL** |

---

## Sponsor Firebase file (Option A — real FCM)

Exact file needed for native Expo push token (not this R2 fallback):

| Field | Value |
|-------|--------|
| Path (gitignored) | `apps/mobile/hrm-mobile/android/app/google-services.json` |
| Or env | `GOOGLE_SERVICES_JSON=<absolute path to real JSON>` before `android:apk:qa-device` |
| Template | `android/app/google-services.json.example` |
| Package | `vn.xevn.hrm.mobile` |
| Source | Firebase Console → Android app for Expo project `xevn-hrm-mobile` (`projectId` `36a4e288-7b45-4019-abaa-d2460c21c5b7`) |
| EAS | Upload FCM V1 credentials / keep file in secret store — **never commit** |

Until that file exists: R2 uses **qa-device fallback** registration (POST 2xx) — **not** outbound push delivery proof.

---

## completion_report

**Closed**

- Root cause documented (FirebaseApp / missing google-services).
- Option A scaffolding wired (example + Gradle conditional + env sync).
- Option B qa-device fallback so emulator can POST register without FCM.
- Logcat markers for token source + `HRM-NOTIF-201` code.
- qa-device APK rebuilt; new SHA recorded; twin published.
- Vitest **11/11** PASS.

**Residual**

- Real Expo/FCM token + push **delivery** still need sponsor `google-services.json` (Option A file).
- P2 deep-link `base_url` (R1 residual) out of this narrow FCM wave.
- **uat_done** remains false until qa-device R2 PASS.

---

## next_owner

**qa-device**

## next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-QA-B3-HRM-NT-MOB-R2
from_role: pm
to_role: qa-device
lane: execution
priority: P0
u65_zero_seed: true
entry_criteria: PO-UC-TC-W4-DEV-MOB-NT02-FCM-QA-DEVICE-01 READY_FOR_QA; install APK SHA256 4963D5FA8C165C987929475B35775659018E3353B34B7AEAD3644EE265A4BBB1 from C:\xevn-apk\hrm-mobile-qa-device.apk (≠ 50C8F7…389F)
exit_criteria: emulator-5554 · uat.nv0007@xe.vn / xevn-uat-2026 · company trsport · same deep-link as R1 · POST_NOTIFICATIONS granted · logcat shows POST …/notifications/push-tokens 2xx and HRM-NOTIF-201 (accept push-token-source=qa-device-fallback OR expo-fcm); no seed; evidence docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-mob-01-r2.md; update by-uc HRM-NT-02 execution stamp
cấm: seed; claim uat_done without device POST proof
```

---

## evidence_path

`docs/qa/evidence/po-uc-tc-w4-dev-mob-nt02-fcm-qa-device-01.md`
