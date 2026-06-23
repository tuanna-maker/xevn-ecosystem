# P1-HRM-H9-MOB-FUNC — J-MOB-01..05 functional audit

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-H9-MOB-FUNC` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-06-06 |
| **ack_status** | **PASS_TO_PM** |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **API base** | `http://127.0.0.1:28001` (local hrm-api) |
| **device** | **None** — `adb devices -l` returned 0 attached |
| **method** | hrm-mobile vitest (37/37) + BE scope jest (2/2) + live API probe (J-MOB simulation) |

## Verdict

**PASS_TO_PM** (functional L2.5 via API + unit/integration — no physical device this session).

All in-scope **J-MOB-01..05** flows pass against localhost `:28001` with UAT workforce account. No **HRM-AUTH-001**, no **409** scope, no empty lists where seed provides data, no raw error codes exposed to UI layer ( **`HRM-ATT-REQ-203`** mapped to Vietnamese in `mapApiError` ).

**GWC:** Device/emulator L2.5 not re-run — prior strict device PASS on R4 (2026-06-04) remains baseline; this wave confirms API + FE integration contracts still hold.

---

## 1. Preconditions

| Step | Command / check | Result |
|------|-----------------|--------|
| L0 stack | `GET http://127.0.0.1:28001/api/hrm/` | **200** `HRM-HEALTH-200` |
| hrm-api port | `netstat -ano \| findstr :28001` | PID **9920** LISTENING |
| Device | `adb devices -l` | **0** devices (emulator unavailable) |
| APK on disk | `apps/mobile/hrm-mobile/dist/hrm-mobile-release.apk` | **Not present** — build via `node scripts/build-apk.cjs` → `dist/hrm-mobile-release.apk` |
| Qual seed | `pnpm run seed:hrm:uat-mob-pilot-qual` | **0** — `pending_update_requests=1`, payslip id preserved |

---

## 2. Automated integration (hrm-mobile vitest)

```text
pnpm --filter hrm-mobile test
Test Files  9 passed (9)
Tests       37 passed (37)
Duration    ~2.5s
```

Key coverage for this wave:

| File | Relevance |
|------|-----------|
| `companyWireScope.test.ts` | holding slug + UUID wire parity (J-MOB-01 scope) |
| `hrmApiClient.test.ts` | `x-company-id: holding` not `main` slug |
| `p1-phase1-mob-p5-jwt.test.ts` | attendance write scope header/body split |
| `payrollPayslips.test.ts` | J-MOB-04 period filter fallback |
| `mapApiError.test.ts` | `HRM-ATT-REQ-203` → «Đã duyệt đơn chỉnh sửa chấm công» (J-MOB-05 UI) |
| `mobileAuthSession.test.ts` | JWT TTL parity |

---

## 3. BE scope parity (hrm-api jest)

```text
pnpm exec jest src/common/p1-phase1-be-mob-jmob-04-05.spec.ts
Test Suites: 1 passed
Tests:       2 passed
```

- J-MOB-04 payslip list with UUID `company_id` + holding header
- J-MOB-05 manager pending update-requests with holding scope

---

## 4. Live API journey probe (`uat.nv0001@xe.vn`)

Script: `scripts/tmp-p1-hrm-h9-mob-func-probe.mjs`  
Machine JSON: `docs/qa/evidence/p1-hrm-mob-func-audit-probe-20260606.json`

Login scope (J-MOB-01):

| Field | Value |
|-------|-------|
| `company_uuid` | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` |
| `default_company_id` | `holding` |
| `x-company-id` header | `holding` (not literal `main`) |
| `employee_id` | `3796d949-4513-45c0-88fa-33030a062b17` |
| memberships | 1 |

| J-ID | Step | HTTP | Code | Result | Notes |
|------|------|------|------|--------|-------|
| **J-MOB-01** | POST `/auth/mobile/login` | 201 | `HRM-AUTH-200` | **PASS** | No HRM-AUTH-001 |
| **J-MOB-01** | Scope UUID on home | — | — | **PASS** | UUID present; header `holding` |
| **J-MOB-02** | POST `/attendance/records` GPS | 201 | `HRM-ATT-201` | **PASS** | First run: record created lat/lng 21.0285/105.8542 |
| **J-MOB-02** | Idempotent re-check same day | 400 | `HRM-ATT-001` | **PASS (idempotent)** | Duplicate constraint expected; not a zero-defect fail |
| **J-MOB-03** | GET leave-requests list | 200 | `HRM-LEAVE-200` | **PASS** | rows=**6** |
| **J-MOB-03** | list→detail by id | 200 | `HRM-LEAVE-DETAIL-OK` | **PASS** | `1d73b1b4-d4da-48ab-8473-5afe03b22c22` |
| **J-MOB-04** | GET payslips list | 200 | `HRM-PAY-200` | **PASS** | rows=**1** |
| **J-MOB-04** | list→detail net pay | 200 | `HRM-PAY-DETAIL-OK` | **PASS** | net=**82,340,000** VND |
| **J-MOB-05** | GET pending update-requests | 200 | `HRM-ATT-REQ-200` | **PASS** | pending=**1** after qual seed |
| **J-MOB-05** | POST approve | 201 | `HRM-ATT-REQ-203` | **PASS** | API code OK; UI maps to Vietnamese success |

**Fail criteria check:** No 409 scope · no HRM-AUTH-001 · no empty leave/payslip when seed present · approve code not shown raw in app (`formatHrmSuccess` covered).

---

## 5. Emulator / APK path (when device available)

| Artifact | Path / command |
|----------|----------------|
| Build release APK | `cd apps/mobile/hrm-mobile && node scripts/build-apk.cjs` |
| Output APK | `apps/mobile/hrm-mobile/dist/hrm-mobile-release.apk` |
| Gradle fallback | `pnpm --filter hrm-mobile android:apk-debug` → `android/app/build/outputs/apk/` |
| Device automation | `JMOB_EMAIL=uat.nv0001@xe.vn node scripts/tmp-p1-phase1-qa-mob-jmob-device.mjs` |
| Prior strict device PASS | [`p1-phase1-qa-mob-jmob-20260604-r4.md`](p1-phase1-qa-mob-jmob-20260604-r4.md) |

Local dev API URL for Expo: `EXPO_PUBLIC_HRM_API_BASE_URL=http://127.0.0.1:28001` (see `.env.example`).

---

## 6. Promoted / not promoted

| Item | Status |
|------|--------|
| J-MOB-01 login + scope | **Promoted** |
| J-MOB-02 check-in GPS API | **Promoted** (201 create) |
| J-MOB-03 leave list→detail | **Promoted** |
| J-MOB-04 payslip list→detail | **Promoted** |
| J-MOB-05 manager approve | **Promoted** (after qual seed) |
| hrm-mobile vitest 37/37 | **Promoted** |
| BE mob scope jest 2/2 | **Promoted** |
| Device L2.5 strict (adb UI tap) | **Not promoted** this session — no device; defer to `qa-device` when emulator/APK available |
| Pilot nip.io parity | **Not promoted** — local-only probe; nip.io last PASS R4 |

---

## 7. Residual / conditions

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| C-MOB-H9-DEVICE-01 | P2 | No adb device this run — UI tap L2.5 not re-verified | `qa-device` when hardware/emulator up |
| C-MOB-H9-APK-01 | P2 | `dist/hrm-mobile-release.apk` absent locally — rebuild before device retest | `dev-mobile` / DevOps |
| C-MOB-H9-SEED-01 | P3 | J-MOB-05 requires `seed:hrm:uat-mob-pilot-qual` if pending queue consumed | DevOps / QA pre-device |

No P0/P1 defects open from this audit.

---

## completion_report

- Confirmed hrm-api **200** on `127.0.0.1:28001`.
- Ran **37/37** hrm-mobile vitest + **2/2** BE J-MOB scope jest — all PASS.
- Live API probe for `uat.nv0001@xe.vn`: **J-MOB-01..05 PASS** (check-in 201; approve 201/`HRM-ATT-REQ-203` with UI mapping; 6 leaves, 1 payslip 82.34M VND).
- No device attached — documented APK/emulator path from repo scripts; prior R4 device evidence cited for strict UI L2.5.

## next_owner

`pm` — optional `qa-device` for strict adb retest when emulator available; no dev dispatch required unless nip.io drift reported.

## next_dispatch_prompt

PM: Accept **PASS_TO_PM** for `P1-HRM-H9-MOB-FUNC`. If sponsor requires device evidence this sprint, dispatch **qa-device** with: account `uat.nv0001@xe.vn` / `xevn-uat-2026`, run `pnpm run seed:hrm:uat-mob-pilot-qual`, build/install APK from `apps/mobile/hrm-mobile/scripts/build-apk.cjs`, execute `scripts/tmp-p1-phase1-qa-mob-jmob-device.mjs`, evidence `docs/qa/evidence/p1-hrm-mob-device-retest-YYYYMMDD.md`. No `pm_dispatch_hint` for dev-be/dev-mobile — API and integration layers PASS.

## evidence_path

- `docs/qa/evidence/p1-hrm-mob-func-audit-20260606.md`
- `docs/qa/evidence/p1-hrm-mob-func-audit-probe-20260606.json`

## pm_dispatch_hint

None (PASS — residual P2 device-only).
