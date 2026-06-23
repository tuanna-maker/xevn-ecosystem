# PCOMP-W7-MOB-LEAVE-BAL — QA retest R2

| Field | Value |
|-------|-------|
| work_item_id | PCOMP-W7-MOB-LEAVE-BAL |
| role | qa |
| date | 2026-06-08 |
| ack_status | **PASS_TO_PM** |
| account (primary) | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| account (VAL-W7-LBAL-02) | `uat.nv0016@xe.vn` / `xevn-uat-2026` (employee-only JWT) |
| pilot base | `https://14-225-217-232.nip.io` |
| prior | `docs/qa/evidence/pcomp-w7-mob-leave-bal-qa-20260608.md` (FAIL 404) |
| deploy evidence | `docs/qa/evidence/pcomp-w7-leave-bal-deploy-20260608.md` |
| build evidence | `docs/qa/evidence/pcomp-w7-leave-bal-build-fix-20260608.md` |

## Verdict summary

| # | Exit criterion | Result |
|---|----------------|--------|
| 1 | nip.io login `uat.nv0001@xe.vn` + self GET leave-balance → 200 `HRM-LEAVE-BAL-200`, `available_days=8`, `used_days=3` | **PASS** |
| 2 | VAL-W7-LBAL-02 foreign `employee_id` (non-HR) → 403 `HRM-LEAVE-403` (not 404) | **PASS** — `uat.nv0016@xe.vn` employee JWT → 403 |
| 3 | J-MOB-25 API dependency unblocked for MOB-UX-07 | **PASS** — pilot route live; balance cards can consume API |
| 4 | L0 `qc:fe-be-health:pilot` | **PASS** exit 0 |
| 5 | Jest leave-balance regression | **PASS** 26/26 |

**Overall: PASS_TO_PM**

## L0 stack

```bash
pnpm run qc:fe-be-health:pilot
# exit 0 — hrm-api :28001 200, portal proxy 200, pilot flows 13/13 PASS
```

## nip.io probe — exit 1 (uat.nv0001 self)

Script: `scripts/tmp-pcomp-w7-leave-bal-qa-r2-probe.mjs`

```http
POST /api/hrm/auth/mobile/login
{"email":"uat.nv0001@xe.vn","password":"xevn-uat-2026"}

GET /api/hrm/attendance/leave-balance?company_id=holding&employee_id=3796d949-4513-45c0-88fa-33030a062b17&leave_type=annual&year=2026
Authorization: Bearer {token}
x-tenant-id: xevn
x-company-id: holding
```

| Field | Expected | Actual |
|-------|----------|--------|
| HTTP | 200 | **200** |
| code | `HRM-LEAVE-BAL-200` | **`HRM-LEAVE-BAL-200`** |
| `available_days` | 8 | **8** |
| `used_days` | 3 | **3** |
| `entitled_days` | 12 | **12** |
| `source` | `employee_leave_balances` | **`employee_leave_balances`** |

JWT claims (`uat.nv0001`): `employee_id=3796d949-…`, `roles=["employee","manager","hr_manager"]`.

## VAL-W7-LBAL-02 — exit 2 (non-HR foreign id)

Per `MOBILE_W7_DATA_CONTRACTS.md` VAL-W7-LBAL-02: **non-HR** JWT querying foreign `employee_id` must return **403** `HRM-LEAVE-403`.

`uat.nv0001` has `hr_manager` + `manager` → `canFullEmployeeUpdate()` bypasses self-only check → **200** for foreign id is **correct HR behavior**, not a defect.

**Authoritative runtime proof (employee-only persona):**

```http
POST /api/hrm/auth/mobile/login  {"email":"uat.nv0016@xe.vn","password":"xevn-uat-2026"}

GET /api/hrm/attendance/leave-balance?company_id=holding&employee_id=8ac84520-0d6b-4737-8341-2f9a929b5f81&leave_type=annual&year=2026
Authorization: Bearer {uat.nv0016 token}
```

| Field | Expected | Actual |
|-------|----------|--------|
| HTTP | 403 | **403** |
| code | `HRM-LEAVE-403` | **`HRM-LEAVE-403`** |
| Not 404 | yes | **yes** (route present; auth enforced) |

JWT claims (`uat.nv0016`): `roles=["employee"]` only.

**Note:** Some holding employees (e.g. `uat.nv0005`) return **409** `SCOPE_CONTEXT_MISMATCH` for cross-company foreign ids — out of scope for VAL-W7-LBAL-02 (403 vs 404 auth test).

## J-MOB-25 — MOB-UX-07 API dependency (exit 3)

| Journey | Dependency | Pilot status |
|---------|--------------|--------------|
| **J-MOB-25** | `GET /attendance/leave-balance` → `LeaveBalanceHeader` cards (Kỳ nghỉ + Còn lại/Đã dùng) | **UNBLOCKED** — nip.io 200 for `uat.nv0001` with seeded 8/3 |
| J-MOB-26..28 | Same API + leave list/create | API ready; device L2.5 deferred to **PCOMP-W8-MOB-ESS-LEAVE-01-R2** |

Prior MOB-UX-07 QA (`pcomp-w8-mob-ess-leave-01-qa-20260608.md`) had J-MOB-25 **GWC** (local 200, pilot 502/404). **R2 closes API blocker** for balance header wiring on pilot.

## Unit regression

```bash
pnpm --filter hrm-api exec npx jest leave-balance.service.spec.ts attendance.controller.spec.ts --no-cache
# Test Suites: 2 passed | Tests: 26 passed
```

Includes mocked VAL-W7-LBAL-02, VAL-W7-LBAL-03, W7-4 controller path.

## Defects closed

| ID | Status |
|----|--------|
| D-W7-LEAVE-BAL-DEPLOY-01 | **CLOSED** — route on pilot, self 200 |
| D-W7-LEAVE-BAL-BUILD-01 | **CLOSED** — nest build exit 0 (dev-be evidence) |

## Residual / not promoted

| Item | Owner | Notes |
|------|-------|-------|
| J-MOB-25..28 device L2.5 | qa-device / qa | **PCOMP-W8-MOB-ESS-LEAVE-01-R2** — needs MOB-UX-07 APK + emulator walk |
| J-MOB-23..24 inline approve device | qa-device | Same wave |
| VAL-W7-LBAL-03 zeros + `source: default` | qa (optional) | Verified on `uat.nv0016` self (0/0/default) — not P0 |

## Handoff

- **completion_report:** Exit 1–3 PASS on nip.io after D-W7-LEAVE-BAL-DEPLOY/BUILD; self balance 8/3; VAL-W7-LBAL-02 proven via employee-only `uat.nv0016` → 403; J-MOB-25 API unblocked for MOB-UX-07.
- **next_owner:** pm → dev-mobile + qa (PCOMP-W8-MOB-ESS-LEAVE-01-R2)
- **pm_dispatch_hint:** PCOMP-W8-MOB-ESS-LEAVE-01-R2 — build MOB-UX-07 qa-device APK, retest J-MOB-23..29 L2.5 on nip.io with leave-balance 200 confirmed
- **evidence_path:** `docs/qa/evidence/pcomp-w7-mob-leave-bal-qa-r2-20260608.md`
- **ack_status:** **PASS_TO_PM**
