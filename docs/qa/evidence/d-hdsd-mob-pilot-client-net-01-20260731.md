# D-HDSD-MOB-PILOT-CLIENT-NET-01 — Pilot HTTP cleartext + API client audit

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HDSD-MOB-PILOT-CLIENT-NET-01` |
| **date** | 2026-07-31 (ICT) |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **ack_status** | **READY_FOR_QA** |
| **HOLD_DEPLOY** | true — **qa-device APK rebuild required** for cleartext manifest |
| **paired BE** | `D-HDSD-MOB-PILOT-TXN-NET-01` (no duplicate BE change in this WI) |
| **upstream QA** | `docs/qa/evidence/qa-hdsd-mob-ch12-01-r4-20260731.md` |

---

## completion_report

**Root cause (client P0):** Release `qa-device` APK `AndroidManifest.xml` (main) did **not** allow cleartext HTTP. Pilot HRM base is `http://14.225.217.232:3001`. Deep-link auth injects JWT **without** device fetch → login appears OK; transactional `fetch()` to leave/payslip throws → `HRM-MOB-ERR-NETWORK` (not BE 4xx).

**Closed in source:**

1. `android/app/src/main/res/xml/network_security_config.xml` — cleartext for pilot IP + loopback/emulator.
2. `android/app/src/main/AndroidManifest.xml` — `usesCleartextTraffic` + `networkSecurityConfig` on release application.
3. `normalizeHrmBaseUrl.ts` + wire in `hrmApiClient`, `AuthContext`, `qaLoginDeepLink` — reject malformed deep-link `base_url`.
4. QA logcat trace: `[HRM-MOB] METHOD url x-company-id=… Authorization=Bearer …` when `EXPO_PUBLIC_ENABLE_QA_DEEP_LINK=1` (qa-device bundle).

**API client audit (uat.nv0001 @ holding):**

| Check | Result |
|-------|--------|
| Deep-link `base_url` | Parsed → `http://14.225.217.232:3001` via `normalizeHrmBaseUrl` |
| `Authorization` | Bearer from deep-link JWT on all `hrmRequest` |
| `x-company-id` GET | `holding` (scope slug — BE accepts; not blocked `main`) |
| `x-company-id` POST/PATCH | Legal UUID `10000000-0000-4000-8000-000000000001` via `resolveHrmWriteHeaderId` |
| `companyUuid` wire | Backfilled from JWT / membership in `buildHrmAuthConfig` |

**BE healthy (host probe @ 2026-07-31):**

```text
GET  http://14.225.217.232:3001/api/hrm                     → 200 HRM-HEALTH-200
POST /api/hrm/auth/mobile/login uat.nv0001@xe.vn            → 201 HRM-AUTH-200
GET  /attendance/leave-requests?company_id=holding&…        → 200 HRM-LEAVE-200
GET  /payroll/payslips?company_id=holding&employee_id=…     → 200 HRM-PAY-200 total=1
```

**Tests:** vitest 23/23 scoped (`hrmApiClient`, `qaLoginDeepLink`, `normalizeHrmBaseUrl`).

**Open / not in this WI:**

- Device retest needs **fresh `android:apk:qa-device`** (manifest native change).
- J-MOB-05 manager `pending=0` → `D-HDSD-MOB-PILOT-DATA-PENDING-01` (dev-be, U65).
- Payslip empty on R4 probe may be resolved on BE — client will show list or honest empty after network fix.

---

## Files changed

| Path | Change |
|------|--------|
| `apps/mobile/hrm-mobile/android/app/src/main/res/xml/network_security_config.xml` | ADD pilot cleartext domains |
| `apps/mobile/hrm-mobile/android/app/src/main/AndroidManifest.xml` | cleartext + config ref |
| `apps/mobile/hrm-mobile/src/integrations/normalizeHrmBaseUrl.ts` | ADD URL sanitizer |
| `apps/mobile/hrm-mobile/src/integrations/hrmApiClient.ts` | resolve base + QA logcat |
| `apps/mobile/hrm-mobile/src/integrations/qaLoginDeepLink.ts` | normalize `base_url` on sign-in payload |
| `apps/mobile/hrm-mobile/src/context/AuthContext.tsx` | persist normalized baseUrl |
| `apps/mobile/hrm-mobile/src/integrations/__tests__/*.test.ts` | regression |

---

## QA retest entry (qa-device)

```powershell
$env:HRM_API_BASE='http://14.225.217.232:3001'
$env:ADB_SERIAL='emulator-5554'
# After fresh qa-device APK install:
adb logcat -c
node scripts/qa-mobile-login-intent.mjs
# Expect logcat lines: [HRM-MOB] GET http://14.225.217.232:3001/api/hrm/attendance/leave-requests… x-company-id=holding
# Navigate Phiếu lương / Nghỉ phép — no HRM-MOB-ERR-NETWORK banner
```

---

## next_owner

`qa-device` (after `dev-mobile` or DevOps rebuilds qa-device APK with new manifest)

---

## next_dispatch_prompt

```text
work_item_id: D-HDSD-MOB-PILOT-CLIENT-NET-01-BUILD
from_role: pm
to_role: dev-mobile
entry_criteria: D-HDSD-MOB-PILOT-CLIENT-NET-01 source merged; cleartext network_security_config in main manifest
exit_criteria: pnpm android:apk:qa-device fresh SHA; install emulator-5554; logcat shows [HRM-MOB] GET pilot :3001 without ERR-NETWORK on leave/payslip tabs; ack_status READY_FOR_QA

work_item_id: QA-HDSD-MOB-CH12-01-R5
from_role: pm
to_role: qa-device
entry_criteria: qa-device APK rebuilt post D-HDSD-MOB-PILOT-CLIENT-NET-01-BUILD; pilot :3001; uat.nv0001/0002 strict U65
exit_criteria: J-MOB-03/04 without ERR-NETWORK; logcat x-company-id ≠ main; J-MOB-05 if dev-be pending data ready; ack_status PASS_TO_PM
```

---

## evidence_path

`docs/qa/evidence/d-hdsd-mob-pilot-client-net-01-20260731.md`
