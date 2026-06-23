# PCOMP-W7-MOB-LEAVE-BAL — QA retest

| Field | Value |
|-------|-------|
| work_item_id | PCOMP-W7-MOB-LEAVE-BAL |
| role | qa |
| date | 2026-06-08 |
| ack_status | **FAIL_TO_PM** |
| account | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| pilot base | `https://14-225-217-232.nip.io` |
| dev evidence | `docs/qa/evidence/pcomp-w7-mob-leave-bal-20260608.md` |
| journeys | J-MOB-25..28 (MOB-UX-07 API dependency — **not unblocked**) |

## Verdict summary

| # | Exit criterion | Result |
|---|----------------|--------|
| 1 | `pnpm run seed:hrm:uat-mob-pilot-qual` on pilot DB | **PASS** exit 0 — `ceo_leave_balance_entitled=12.0`, `leave_balance` row upserted |
| 2 | nip.io self GET leave-balance → 200 `HRM-LEAVE-BAL-200`, `available_days=8`, `used_days=3` | **FAIL** HTTP **404** `HRM-DATA-404` (route not on pilot) |
| 3 | VAL-W7-LBAL-02 foreign `employee_id` → 403 `HRM-LEAVE-403` | **FAIL** HTTP **404** `HRM-DATA-404` (same — endpoint absent) |
| 4 | Unblocks MOB-UX-07 J-MOB-25..28 | **NOT MET** — mobile cannot consume balance API on pilot |
| 5 | L0 `qc:fe-be-health:pilot` | **FAIL** — `:28001` ECONNREFUSED local; pilot probe independent |

**Overall: FAIL_TO_PM** — seed + jest PASS; **runtime integration FAIL** (pilot deploy + local build).

## Seed (exit 1)

```bash
pnpm run seed:hrm:uat-mob-pilot-qual
# exit 0
```

Key output:

```json
{
  "uat_email": "uat.nv0001@xe.vn",
  "ceo_employee_id": "3796d949-4513-45c0-88fa-33030a062b17",
  "company_id": "holding",
  "ceo_leave_balance_entitled": "12.0",
  "ids": { "leave_balance": "bde08538-597b-4ef1-8e44-ec6af1a00aa4" }
}
```

DB target: `deploy/xevn-ecosystem/.env` → `DB_HOST=113.20.107.184` (pilot HRM).

## Unit / controller tests (dev-be regression)

```bash
cd apps/api/hrm-api && npx jest leave-balance.service.spec.ts attendance.controller.spec.ts --no-cache
# Test Suites: 2 passed, 2 total | Tests: 26 passed, 26 total
```

Includes `VAL-W7-LBAL-02`, `VAL-W7-LBAL-03`, controller `W7-4` `HRM-LEAVE-BAL-200` — **mocked only**.

## nip.io API probe (exit 2 + 3)

**Login:** PASS — `HRM-AUTH-200`, `employee_id=3796d949-4513-45c0-88fa-33030a062b17`

**Self balance:**

```http
GET /api/hrm/attendance/leave-balance?company_id=holding&employee_id=3796d949-4513-45c0-88fa-33030a062b17&leave_type=annual&year=2026
Authorization: Bearer {uat.nv0001 token}
x-tenant-id: xevn
x-company-id: holding
```

| Field | Expected | Actual |
|-------|----------|--------|
| HTTP | 200 | **404** |
| code | `HRM-LEAVE-BAL-200` | **`HRM-DATA-404`** |
| `available_days` | 8 | undefined |
| `used_days` | 3 | undefined |
| `source` | `employee_leave_balances` | undefined |

**VAL-W7-LBAL-02** (foreign `employee_id=8ac84520-0d6b-4737-8341-2f9a929b5f81`):

| Field | Expected | Actual |
|-------|----------|--------|
| HTTP | 403 | **404** |
| code | `HRM-LEAVE-403` | **`HRM-DATA-404`** |

Interpretation: generic Nest 404 (`http-exception.filter.ts` maps NOT_FOUND → `HRM-DATA-404`). Pilot HRM image does **not** expose `GET attendance/leave-balance` yet despite seed row on shared DB.

## Local stack (L0 blocker)

```bash
pnpm run qc:fe-be-health:pilot
# FAIL — hrm-api-health ECONNREFUSED :28001
```

Attempted `pnpm run dev:hrm-api` / `nest build`:

```
src/attendance/leave-balance.service.ts — TS2322 (9 errors)
Type 'number' is not assignable to type 'never' on entitled_days / used_days / pending_days
```

`LeaveBalanceRow` declares `entitled_days: string` (DB cast `::text`) but `mapBalancePayload` input expects `number` — **production build cannot compile**. Jest passes via ts-jest without full `nest build`.

## J-MOB-25..28 / L2.5 status

| Journey | API dependency | QA status |
|---------|----------------|-----------|
| J-MOB-25 | `leave-balance` cards | **BLOCKED** — 404 pilot |
| J-MOB-26 | `leave-requests` tabs (separate) | Out of slice — not retested |
| J-MOB-27 | empty state CTA | Out of slice — not retested |
| J-MOB-28 | form balance chip | **BLOCKED** — 404 pilot |

L2.5 mobile device walk for balance UI deferred until API 200 on pilot.

## Defects opened

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| D-W7-LEAVE-BAL-DEPLOY-01 | P0 | nip.io `GET /attendance/leave-balance` → 404 after seed on pilot DB | devops |
| D-W7-LEAVE-BAL-BUILD-01 | P0 | `nest build` TS2322 in `leave-balance.service.ts` — blocks `dev:hrm-api` | dev-be |

## Residual / not promoted

- `home/summary` `leave_balance_preview` — optional per dev handoff; not tested.
- VAL-W7-LBAL-03 (zeros + `source: default`) — not runtime-verified (404).
- J-MOB-26/27 tab/empty UX — needs dev-mobile after API deploy.

## Handoff

- **next_owner:** pm
- **pm_dispatch_hint:** (1) `dev-be` fix D-W7-LEAVE-BAL-BUILD-01 TS types → `nest build` exit 0; (2) `devops` deploy hrm-api with leave-balance route to nip.io + re-run seed if needed; (3) re-dispatch QA same work_item after both PASS.
