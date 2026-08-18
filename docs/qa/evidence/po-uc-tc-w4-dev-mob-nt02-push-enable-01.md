# Evidence — PO-UC-TC-W4-DEV-MOB-NT02-PUSH-ENABLE-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W4-DEV-MOB-NT02-PUSH-ENABLE-01` |
| **uc_id** | `HRM-NT-02` |
| **from_role** | dev-mobile |
| **to_role** | qa-device |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-04 |
| **prior_fail** | `docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-mob-01.md` |

---

## completion_report

**Closed**

1. **qa-device bundle push flag** — `scripts/build-apk.cjs` `resolveBundleEnvFlags`: `BUILD_TARGET=qa-device` (via `pnpm run android:apk:qa-device` or `--qa-device`) now defaults **`EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION=1`** unless env overrides. Sponsor **release** APK remains default **`0`**.
2. **API platform contract** — `pushRegistration.ts` POST body uses **`platform: 'expo'`** via `resolvePushTokenPlatformForApi()` (matches `register-push-token.dto.ts` `expo|fcm`; fixes prior `android|ios` → **400** `HRM-VAL-001`).
3. **Sign-in path unchanged** — `AuthContext` / `RealtimeContext` still call `tryRegisterExpoPushToken` (HDSD side effect on login; no seed).
4. **@CODE-MEMORY** appended on `pushRegistration.ts`.
5. **Vitest** — `src/integrations/__tests__/pushRegistration.test.ts` **7/7 PASS** (includes POST body `platform: expo` assertion).

**APK build (2026-08-04)** — `pnpm run android:apk:qa-device` @ `C:\xevn-ecosystem` · bundle log **`PUSH_REG=1`** · **BUILD SUCCESSFUL** · output `dist/hrm-mobile-qa-device.apk` (71,602,685 B) · twin `C:\xevn-apk\hrm-mobile-qa-device.apk` · SHA256 see build section below.

**Residual (qa-device seat)**

- **Device token** — If emulator denies notification permission or Expo/FCM init fails, logcat may show permission flow without POST; QA should **grant** notifications when prompted after login.
- **dev-be** — No BE change required for NT-02 narrow fix; mobile maps to `expo`. Optional future: accept legacy `android` alias (not in scope this wave).

---

## Build flags (qa-device NT-02)

| Target | Command | Embedded flags (defaults) |
|--------|---------|---------------------------|
| **qa-device** | `pnpm run android:apk:qa-device` | `QA_DEV_LOGIN=1`, `QA_DEEP_LINK=1`, **`PUSH_REG=1`** |
| **release (pilot)** | `pnpm run android:apk` | `PUSH_REG=0` (unchanged — no google-services unless sponsor enables) |

**Recommended Windows rebuild (same as prior MOB waves):**

```powershell
# Junction ASCII path (if not already)
# mklink /J C:\xevn-ecosystem "<repo NFD path>"

cd C:\xevn-ecosystem\apps\mobile\hrm-mobile
$env:GRADLE_PATH_RN_DIR = "C:\rn74"   # if used on this machine
pnpm exec vitest run src/integrations/__tests__/pushRegistration.test.ts
pnpm run android:apk:qa-device
# Output: dist\hrm-mobile-qa-device.apk
# Publish twin: copy to C:\xevn-apk\hrm-mobile-qa-device.apk
# Install: adb install -r C:\xevn-apk\hrm-mobile-qa-device.apk
```

**Build artifact (2026-08-04):** SHA256 `50C8F7D5912F75A38A2E2107CF2E29286FBFA5D45635A6D8284DEC70BCA2389F` · 71,602,685 bytes · bundle confirmed `PUSH_REG=1`.

**Override (force push off on qa-device bundle):**  
`$env:EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION = "0"; pnpm run android:apk:qa-device`

**Log line during bundle:**  
`PUSH_REG=1` in `[build-apk] Bundle JS @ …` message.

---

## Files touched

| Path | Change |
|------|--------|
| `apps/mobile/hrm-mobile/src/integrations/pushRegistration.ts` | `platform: expo`; CODE-MEMORY |
| `apps/mobile/hrm-mobile/scripts/build-apk.cjs` | qa-device default push enable |
| `apps/mobile/hrm-mobile/.env.example` | qa-device rebuild note |
| `apps/mobile/hrm-mobile/src/integrations/__tests__/pushRegistration.test.ts` | platform expo contract test |

---

## Verify (dev-mobile)

```text
pnpm exec vitest run src/integrations/__tests__/pushRegistration.test.ts
→ 7 passed
```

---

## next_owner

**qa-device**

## next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-QA-B3-HRM-NT-MOB-R1
from_role: qa-device
to_role: pm
lane: execution
priority: P0
entry_criteria: PO-UC-TC-W4-DEV-MOB-NT02-PUSH-ENABLE-01 READY_FOR_QA; rebuild qa-device APK (PUSH_REG=1) installed on emulator-5554
exit_criteria: uat.nv0007@xe.vn login (deep-link or form) → grant notification permission if prompted → logcat shows POST …/notifications/push-tokens 2xx and HRM-NOTIF-201; no seed; evidence po-uc-tc-w4-qa-b3-hrm-nt-mob-01-r1.md
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-mob-01-r1.md
ack_status: PASS_TO_PM or FAIL with layer (APK stale / permission / FCM init)
```

---

## evidence_path

`docs/qa/evidence/po-uc-tc-w4-dev-mob-nt02-push-enable-01.md`
