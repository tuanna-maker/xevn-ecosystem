# PCOMP-W7-MOB-LEAVE-BAL — GET /attendance/leave-balance

| Field | Value |
|-------|-------|
| work_item_id | PCOMP-W7-MOB-LEAVE-BAL |
| role | dev-be |
| date | 2026-06-08 |
| ack_status | **READY_FOR_QA** |
| journeys | J-MOB-25..28 (My Leaves balance cards, MOB-UX-07) |

## Scope closed

1. **GET `/api/hrm/attendance/leave-balance`** — scoped to authenticated employee (VAL-W7-LBAL-02) + workforce filter on `company_id=main` rollup (ADR D-W7-02).
2. Response: `available_days`, `used_days`, `balance_year` / `year` / `period`, optional `leave_type` (default `annual`), plus `entitled_days`, `pending_days`, `remaining_days`, `source`, `as_of`.
3. Table `public.employee_leave_balances` via idempotent `ensureSchema()` in `LeaveBalanceService`.
4. Seed: `scripts/seed-hrm-uat-mob-pilot-qual.mjs` — UAT0001 (`uat.nv0001@xe.vn`) annual 2026: entitled **12**, used **3**, pending **1** → available **8**.
5. Jest: `leave-balance.service.spec.ts` (5) + controller route `attendance.controller.spec.ts` W7-4.

## API contract

```http
GET /api/hrm/attendance/leave-balance?company_id=holding&employee_id={self}&leave_type=annual&year=2026
Authorization: Bearer {jwt}
x-tenant-id: xevn
```

**200** `HRM-LEAVE-BAL-200`:

```json
{
  "company_id": "holding",
  "employee_id": "…",
  "leave_type": "annual",
  "balance_year": 2026,
  "year": 2026,
  "period": 2026,
  "entitled_days": 12,
  "used_days": 3,
  "pending_days": 1,
  "remaining_days": 8,
  "available_days": 8,
  "source": "employee_leave_balances",
  "as_of": "…"
}
```

**403** `HRM-LEAVE-403` — non-HR JWT with foreign `employee_id`.

**200** zeros + `source: "default"` when no row (VAL-W7-LBAL-03).

## Verification

| Check | Command | Result |
|-------|---------|--------|
| Leave balance unit | `pnpm --filter hrm-api test -- leave-balance.service.spec.ts` | **5/5 PASS** |
| Controller route | `pnpm --filter hrm-api test -- attendance.controller.spec.ts` | **21/21 PASS** (incl. W7-4) |
| Seed script | `pnpm run seed:hrm:uat-mob-pilot-qual` | Run on pilot DB during QA (requires `deploy/xevn-ecosystem/.env`) |

## Files

- `apps/api/hrm-api/src/attendance/leave-balance.service.ts`
- `apps/api/hrm-api/src/attendance/dto/get-leave-balance.query.dto.ts`
- `apps/api/hrm-api/src/attendance/attendance.controller.ts` — `@Get('leave-balance')`
- `apps/api/hrm-api/src/attendance/leave-balance.service.spec.ts`
- `scripts/seed-hrm-uat-mob-pilot-qual.mjs` — `employee_leave_balances` seed

## QA probe (copy-ready)

1. Login mobile: `uat.nv0001@xe.vn` / `xevn-uat-2026`
2. `GET /api/hrm/attendance/leave-balance?company_id=holding&employee_id={jwt.employee_id}&year=2026`
3. Expect **200**, `available_days=8`, `used_days=3`, `source=employee_leave_balances` after seed
4. Foreign `employee_id` with employee JWT → **403** `HRM-LEAVE-403`

## Residual

- Home `leave_balance_preview` extension optional per W7-4 — not in this slice (mobile calls dedicated endpoint).
- Multi leave-type list response not required; filter `leave_type` per request.

## Handoff

- **next_owner:** qa
- **pm_dispatch_hint:** Retest J-MOB-25..28 / MOB-UX-07 balance cards after `seed:hrm:uat-mob-pilot-qual` on pilot.
