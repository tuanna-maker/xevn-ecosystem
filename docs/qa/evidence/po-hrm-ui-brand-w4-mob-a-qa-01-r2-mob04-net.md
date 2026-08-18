# PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R2-MOB04-NET — MOB-04 POST 2xx network proof

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R2-MOB04-NET` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **Date** | 2026-08-05 |
| **parent_R2** | `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01-r2.md` |
| **QC_ref** | `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qc-01-r3.md` — **C-MOB-04 OPEN** |
| **U65** | zero-seed · network proof primary (no UI-only promote) |
| **ack_status** | **FAIL_TO_PM** |

## Honesty locks

| Flag | Expected | Observed |
|------|----------|----------|
| **face_live** | false | **false** |
| **remaster_program_done** | false | **false** |
| **fake_2xx** | forbidden | **not used** |
| **MOB-04 POST 2xx promoted** | required | **NOT promoted** |

---

## APK verify (pre-run)

| Field | Value |
|-------|--------|
| **apk_path** | `C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk` |
| **sha256** | `EB65FD6FF658FA2575DDFB7299347CDC2DE4985A2AE5FFDA1CEC5ED78DF5D066` |
| **verify_cmd** | `certutil -hashfile … SHA256` |
| **verify_result** | **MATCH** |

---

## ENV / stack

| Item | Value |
|------|--------|
| **serial** | `emulator-5554` |
| **package** | `vn.xevn.hrm.mobile` |
| **Persona (target)** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **Local HRM** | `http://127.0.0.1:28001` (restarted `pnpm run dev:hrm-api` mid-run) |
| **adb reverse** | `tcp:28001 → tcp:17801` (host log proxy) |
| **Log proxy** | `apps/mobile/hrm-mobile/scripts/_hrm-log-proxy.mjs` → `17801 → 28001` |
| **Seed** | **None** |

---

## MOB-04 network proof (result)

| Layer | Expected | Observed |
|-------|----------|----------|
| **Host proxy** | `POST /api/hrm/attendance/records` + `-> status=20x` | **No POST** in proxy log during submit windows |
| **logcat `[HRM-MOB]`** | `POST …/attendance/records` + 2xx correlate | **GET** `/attendance/records` seen; **no POST** `/attendance/records` in submit window |
| **UI submit** | GPS channel → `check-in-submit` | Automation **did not** reliably reach submit on check-in screen in net-only reruns |

### Proxy log (SoT tail)

Path: `docs/qa/evidence/screenshots/po-hrm-ui-brand-w4-mob-a-qa-01-r2-mob04-net/hrm-proxy-access.log`

```
listening http://127.0.0.1:17801 -> 127.0.0.1:28001
# MOB04_SUBMIT_WINDOW … (no POST /api/hrm/attendance/records line followed)
```

### logcat (ReactNativeJS filter)

Path: `docs/qa/evidence/screenshots/po-hrm-ui-brand-w4-mob-a-qa-01-r2-mob04-net/logcat-mob04-post.txt`

Representative lines from capture window (session still pointed at **pilot** before local redirect):

```
[HRM-MOB] GET http://14.225.217.232:3001/api/hrm/attendance/records?…
[HRM-MOB] POST http://14.225.217.232:3001/api/hrm/notifications/push-tokens …
[HRM-MOB] push-tokens POST ok=true code=HRM-NOTIF-201 http=
```

**Gap:** `hrmApiClient` logs **request URL** for QA builds but **does not** emit `POST ok=… http=` for `/attendance/records` (unlike `pushRegistration.ts`). Release logcat alone cannot prove **2xx** for attendance POST.

---

## Root cause (honest)

1. **Cached `baseUrl`** on device (`http://14.225.217.232:3001`) bypassed `adb reverse` / host proxy — traffic never hit `17801` during reruns.
2. **Local stack gap:** `hrm-api` was **down** early in session (`ECONNREFUSED` on proxy); restarted later — login/automation windows inconsistent.
3. **Automation:** Notification permission dialog + FAB/sheet instability; `pm clear` + UI login did not consistently reach `check-in-submit` in net-only scripts.
4. **Observability:** No attendance POST response line in QA logcat → cannot promote MOB-04 without **proxy/mitm** or **dev-mobile** parity logging.

---

## Artifacts

| Artifact | Path |
|----------|------|
| Proxy access log | `docs/qa/evidence/screenshots/po-hrm-ui-brand-w4-mob-a-qa-01-r2-mob04-net/hrm-proxy-access.log` |
| logcat (submit window) | `docs/qa/evidence/screenshots/po-hrm-ui-brand-w4-mob-a-qa-01-r2-mob04-net/logcat-mob04-post.txt` |
| Deeplink / nav XML | `docs/qa/evidence/screenshots/po-hrm-ui-brand-w4-mob-a-qa-01-r2-mob04-net/deeplink-home.xml`, `checkin-pre-submit.xml` |
| Run result JSON | `docs/qa/evidence/screenshots/po-hrm-ui-brand-w4-mob-a-qa-01-r2-mob04-net/mob04-net-result.json` (if present) |
| Helper scripts (qa-device) | `apps/mobile/hrm-mobile/scripts/_hrm-log-proxy.mjs`, `_mob04-net-deeplink-run.cjs` |
| R2 UI evidence (unchanged PASS chrome) | `docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01-r2.md` |

---

## completion_report

- Verified APK **EB65FD6F…** on `emulator-5554`.
- Stood up **host HTTP log proxy** (`17801 → 28001`) + `adb reverse`; **no** captured `POST /api/hrm/attendance/records` **2xx** through proxy.
- Captured **logcat `[HRM-MOB]`** proving QA logging works for other endpoints; **attendance POST 2xx not provable** from logcat alone.
- **C-MOB-04** remains **OPEN** — MOB-04 **not promoted**.

## next_owner

`pm` → dispatch **`dev-mobile`** (observability) + **`qa-device`** (retry R3)

## next_dispatch_prompt

```text
dev-mobile: Add QA-only log line on attendance POST success (mirror push-tokens: ok/code/httpStatus) in hrmApiClient or CheckInScreen; rebuild qa-device APK; hand SHA to qa-device.

qa-device: PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R2-MOB04-NET-R3 — pm clear → UI login uat.nv0001 with dev URL http://10.0.2.2:28001 ONLY → FAB/tile → GPS submit; adb reverse to log proxy; MUST capture POST /api/hrm/attendance/records status=201 in hrm-proxy-access.log OR logcat ok=true for attendance POST. U65 zero-seed. ack PASS_TO_PM only if 2xx network proof.
```

## pm_dispatch_hint

`C-MOB-04` blocked on **baseUrl pilot vs local proxy** + **missing attendance POST response telemetry** on qa-device APK.
