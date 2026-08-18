# PO-HRM-UI-BRAND-W4-MOB-A-MOB04-LOG-01 — QA logcat for attendance POST

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-MOB-A-MOB04-LOG-01` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **Date** | 2026-08-05 |
| **parent_FAIL** | `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01-r2-mob04-net.md` |
| **ack_status** | **READY_FOR_QA** |

## Honesty locks

| Flag | Expected | Observed |
|------|----------|----------|
| **face_live** | false | **false** (unchanged) |
| **remaster_program_done** | false | **false** (unchanged) |
| **fake_2xx** | forbidden | **not used** |
| **MOB-04 POST 2xx promoted** | qa-device only | **not claimed** — observability only |

---

## Change summary

| Item | Detail |
|------|--------|
| **Problem** | qa-device APK logged `[HRM-MOB] POST …/attendance/records` request URL but no response line; push-tokens had `ok=/code=/http=` |
| **Fix** | After `hrmRequest` completes for **POST `/attendance/records`** (check-in, not GET history), emit logcat line when `isQaDeepLinkLoginEnabled()` (qa-device bundle: `EXPO_PUBLIC_ENABLE_QA_DEEP_LINK=1`) |
| **Log format** | `[HRM-MOB] attendance/records POST ok={bool} code={envelope} http={status}` |
| **Pilot release** | Unchanged — QA flags off → no new line |

### Code touch

| Path | Change |
|------|--------|
| `apps/mobile/hrm-mobile/src/integrations/hrmApiClient.ts` | `logAttendanceRecordsPostResult`, `formatAttendanceRecordsPostLogLine`, `isAttendanceRecordsCheckInPost` |
| `apps/mobile/hrm-mobile/src/integrations/__tests__/hrmApiClient.test.ts` | Contract + console.info integration test |
| `apps/mobile/hrm-mobile/.env.example` | Document emulator `http://10.0.2.2:28001` (optional; pilot default unchanged) |

---

## QA grep (logcat)

```text
adb logcat -s ReactNativeJS | findstr /I "HRM-MOB attendance/records POST"
```

**PASS correlate (after real check-in submit):**

```text
[HRM-MOB] POST http://10.0.2.2:28001/api/hrm/attendance/records …
[HRM-MOB] attendance/records POST ok=true code=HRM-ATT-* http=201
```

Fail path example: `ok=false` + `http=4xx` or `HRM-MOB-ERR-NETWORK` with empty http.

---

## Emulator base URL (optional — do not break pilot)

| Surface | URL |
|---------|-----|
| **Settings dev URL (qa-device R3)** | `http://10.0.2.2:28001` |
| **Host hrm-api** | `pnpm run dev:hrm-api` → `:28001` |
| **adb reverse** | `adb reverse tcp:28001 tcp:28001` or proxy `17801→28001` per `_hrm-log-proxy.mjs` |
| **Release pilot default** | Still `RELEASE_PILOT_HRM_API_BASE_URL` when env unset |

---

## Verify (dev-mobile)

```bash
cd apps/mobile/hrm-mobile
pnpm exec vitest run src/integrations/__tests__/hrmApiClient.test.ts
```

| Check | Result |
|-------|--------|
| vitest `hrmApiClient.test.ts` | **PASS** — 16 tests, exit 0 (2026-08-05) |
| APK rebuild | **Required for qa-device** — `pnpm run android:apk:qa-device` → new SHA |

---

## completion_report

- Added QA-only **response** log for attendance check-in POST, mirroring push-tokens observability.
- Documented **10.0.2.2:28001** for emulator without changing pilot release default.
- Unit/contract tests for log line shape and qa-flag gating.

## next_owner

`qa-device`

## next_dispatch_prompt

```text
qa-device: PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R2-MOB04-NET-R3 — Rebuild/install qa-device APK after MOB04-LOG-01 (record SHA256). pm clear → login uat.nv0001 with dev URL http://10.0.2.2:28001 → check-in GPS submit (testID check-in-submit). MUST capture either (a) proxy POST /api/hrm/attendance/records status=201 OR (b) logcat [HRM-MOB] attendance/records POST ok=true http=201. U65 zero-seed. face_live=false. ack PASS_TO_PM only with 2xx network proof.
```

## pm_dispatch_hint

Rebuild `hrm-mobile-qa-device.apk` before R3; prior SHA `EB65FD6F…` lacks attendance POST response line.
