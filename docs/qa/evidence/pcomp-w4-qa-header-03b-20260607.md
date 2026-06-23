# PCOMP-W4-QA-HEADER-03b — J-MOB-05 write header UUID retest

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W4-QA-HEADER-03b` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-07 |
| **ack_status** | **PASS_TO_PM** (GWC — API write PASS; device UI blocked on APK inject) |
| **entry** | `PCOMP-W4-MOB-HEADER-03b` READY_FOR_QA — `resolveHrmWriteHeaderId` on POST approve/reject |
| **device** | `emulator-5554` · AVD `xevn_hrm_api33` |
| **APK** | `apps/mobile/hrm-mobile/dist/hrm-mobile-release-header03b.apk` (Metro bundle inject → `hrm-mobile-release.apk` base, 67 078 518 B) |
| **API base** | `https://14-225-217-232.nip.io` |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |

## Verdict

**PASS_TO_PM (GWC)** — **MOB-HEADER-03b write contract PASS** @ nip.io: GET pending uses `x-company-id: holding`; POST approve/reject with **UUID** `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` returns **201** (`HRM-ATT-REQ-203` / `HRM-ATT-REQ-204`); POST with `holding` returns **409** (`HRM-ATT-REQ-409`). **MUX-03b regression closed** vs [`pcomp-w4-qa-mux-03b-20260607.md`](pcomp-w4-qa-mux-03b-20260607.md) (device 409 on write).

**Device J-MOB-05 tap retest:** **BLOCKED** — fresh Metro bundle (8 259 157 B) injected into release APK crashes on boot: `Cannot find native module 'ExponentImagePicker'` (`AvatarUploadField` / `expo-image-picker` in JS bundle, not linked in release native shell). Gradle `assembleRelease` still **FAIL** Windows MAX_PATH.

Machine JSON: [`pcomp-w4-qa-header-03b-20260607.json`](pcomp-w4-qa-header-03b-20260607.json)

---

## 1. Preconditions

| Step | Command | Exit |
|------|---------|------|
| Emulator | `adb devices` | **0** — `emulator-5554 device` (after `adb kill-server` / `start-server` when offline) |
| Qual seed | `pnpm run seed:hrm:uat-mob-pilot-qual` | **0** — `pending_update_requests=1`, `pending_manager_leave_requests=1` |
| Pilot probe | `HRM_API_BASE_URL=… HRM_MOBILE_EMAIL=uat.nv0001@xe.vn node scripts/tmp-p1-resid-c03-probe.mjs` | **0** — leave≥1 payslip≥1 pending≥1 |
| Metro bundle | `npx expo export:embed` @ `apps/mobile/hrm-mobile` | **0** — bundle 8 259 157 B |
| Gradle APK | `node scripts/build-apk.cjs` | **1** — CMake MAX_PATH (`Filename longer than 260 characters`) |
| Bundle inject | `jar uf` + `zipalign` + `apksigner` → `hrm-mobile-release-header03b.apk` | **0** |
| Install | `adb uninstall` + `adb install -r dist/hrm-mobile-release-header03b.apk` | **0** |

---

## 2. API header probe (write contract — primary gate)

| Step | Command | Exit |
|------|---------|------|
| Probe | `node scripts/tmp-pcomp-w4-qa-header-03b-api-probe.mjs` | **0** |

| Call | Method | `x-company-id` | HTTP | Code | Pass |
|------|--------|----------------|------|------|------|
| Pending inbox | GET | `holding` | 200 | — | **PASS** |
| Approve (negative) | POST | `holding` | 409 | `HRM-ATT-REQ-409` | **PASS** |
| Approve (UUID) | POST | `6efaa5d6-…4013` | 201 | `HRM-ATT-REQ-203` | **PASS** |
| Reject (negative) | POST | `holding` | 409 | `HRM-ATT-REQ-409` | **PASS** |
| Reject (UUID) | POST | `6efaa5d6-…4013` | 201 | `HRM-ATT-REQ-204` | **PASS** |

Reject body: `{ approver_name, rejected_reason }` per `ManagerApprovalsScreen.tsx` / `decide-attendance-update-request.dto.ts`.

---

## 3. Device L2.5 — J-MOB-05 (adb strict)

| Step | Command | Exit |
|------|---------|------|
| Automation | `JMOB_EMAIL=uat.nv0001@xe.vn node scripts/tmp-pcomp-w4-qa-header-03b-device.mjs` | **1** — login / boot blocked |

| Check | Requirement | Result | Notes |
|-------|-------------|--------|-------|
| APK boot | Login screen loads | **FAIL** | RN red screen: `ExponentImagePicker` native module missing |
| Login | `uat.nv0001@xe.vn` home | **FAIL** | adb `input text` hyphen in `xevn-uat-2026` truncates password unless keyevent `69`; fixed in script but app does not reach login after bundle inject crash |
| **Duyệt** | Thành công, not 409 | **NOT RUN** | blocked by APK boot |
| **Từ chối** | Modal → success | **NOT RUN** | blocked by APK boot |

**Partial session note:** Earlier run (same APK base, bundle 8 158 678 B) reached **Trang chủ** (`hdr03b-post-login.xml` — `Xin chào, Nguyễn Văn An`) before emulator `offline` during More-tab dump; not re-promoted after ImagePicker regression on rebundle.

Screens/XML: `docs/qa/evidence/pcomp-w4-qa-header-03b-screens/` (`hdr03b-*`, `boot2.xml` crash text)

---

## 4. Promoted / not promoted

| Item | Status |
|------|--------|
| `resolveHrmWriteHeaderId` POST UUID vs GET holding | **Promoted** (API probe) |
| Approve write 201 not 409 | **Promoted** (API) |
| Reject write 201 not 409 | **Promoted** (API) |
| J-MOB-05 device Duyệt/Từ chối tap | **Not promoted** — APK inject native gap |
| MUX-03b C-MUX03B-WRITE-01 | **Closed** @ API layer |

---

## completion_report

- Rebuilt Metro bundle with MOB-HEADER-03b JS; injected into `hrm-mobile-release.apk` (Gradle native build blocked MAX_PATH).
- Seeded pilot qual; API probes **PASS** for GET `holding` + POST approve/reject UUID **201** / holding **409** (closes MUX-03b 409 write residual).
- Device J-MOB-05 retest **blocked**: injected bundle references `expo-image-picker` not in release APK native binaries → crash before login.
- Documented adb lessons: password hyphens need `keyevent 69` between segments; emulator adb offline recovery via `kill-server`.

## next_owner

`pm` → optional `dev-mobile` full release APK (CI/short path) + `qa-device` device tap confirmation

## next_dispatch_prompt

```
work_item_id: PCOMP-W4-MOB-APK-HEADER-03b
Role: dev-mobile
Entry: QA HEADER-03b GWC — API write PASS; device blocked ExponentImagePicker on bundle-inject APK
Task: Produce installable release APK with header03b JS + native modules aligned (expo-image-picker linked OR lazy-guard AvatarUploadField); or CI assembleRelease bypass MAX_PATH
Exit: READY_FOR_QA — qa-device J-MOB-05 Duyệt+Từ chối tap Thành công on emulator
Evidence: docs/qa/evidence/pcomp-w4-qa-header-03b-20260607.md
```

## evidence_path

`docs/qa/evidence/pcomp-w4-qa-header-03b-20260607.md`

## pm_dispatch_hint

`PCOMP-W4-MOB-APK-HEADER-03b` — API MOB-HEADER write closed; device tap needs native-aligned release APK (ImagePicker / MAX_PATH).
