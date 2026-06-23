# D-W7-LEAVE-BAL-DEPLOY-01 — DevOps pilot deploy evidence

| Field | Value |
|-------|-------|
| work_item_id | D-W7-LEAVE-BAL-DEPLOY-01 |
| role | devops |
| date | 2026-06-08 |
| ack_status | **READY_FOR_QA** |
| pilot base | `https://14-225-217-232.nip.io` |
| account | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| prior QA | `docs/qa/evidence/pcomp-w7-mob-leave-bal-qa-20260608.md` (FAIL — 404 route) |

## Verdict summary

| # | Exit criterion | Result |
|---|----------------|--------|
| 1 | Deploy/recreate `hrm-be` on VPS with leave-balance route | **PASS** — `xevn-hrm-be-dev` healthy; metrics 200 local + nip.io |
| 2 | Login + self GET leave-balance → 200 `HRM-LEAVE-BAL-200`, `available_days=8`, `used_days=3` | **PASS** |
| 3 | `pnpm run seed:hrm:uat-mob-pilot-qual` if needed | **PASS** — local + VPS post-deploy hook |
| 4 | Evidence path + READY_FOR_QA | **PASS** (this file) |

## Root cause (first deploy attempt)

Partial pscp of `attendance.controller.ts` without `get-attendance-record.query.dto.ts` and `attendance.service.ts` caused Nest compile errors on VPS → container stuck in `health: starting` → nip.io **502**.

**Fix:** Expanded sync manifest to 11 files (leave-balance module + attendance record-by-id deps + `employee-update-policy`).

## Deploy steps

```text
scripts/tmp-vps-pscp-leave-balance-20260608.ps1   # 11 files → /opt/xevn-ecosystem
scripts/tmp-vps-deploy-hrm-be-leave-balance-20260608.sh
  → docker compose up -d --build --force-recreate hrm-be
  → sleep 45
  → metrics smoke 200
  → vps-post-hrm-be-mob-pilot-qual.sh (seed + pending probe)
```

VPS container after redeploy:

```text
xevn-hrm-be-dev   Up (healthy)   0.0.0.0:3001->3001/tcp
[smoke] hrm metrics HTTP 200
[smoke] https hrm metrics HTTP 200
```

Synced files:

- `attendance/leave-balance.service.ts` (+ spec)
- `attendance/dto/get-leave-balance.query.dto.ts`
- `attendance/dto/get-attendance-record.query.dto.ts`
- `attendance/attendance.controller.ts` (+ spec)
- `attendance/attendance.service.ts` (+ spec)
- `employees/employee-update-policy.ts` (+ spec)
- `app.module.ts`

Local build gate (pre-deploy): `pnpm --filter hrm-api run build` exit **0**.

## Seed

```bash
pnpm run seed:hrm:uat-mob-pilot-qual
# exit 0 — ceo_leave_balance_entitled=12.0, leave_balance id bde08538-...
```

## nip.io API probe (post-deploy)

Script: `scripts/tmp-pcomp-w7-leave-bal-deploy-probe.mjs`

```json
{
  "verdict": "PASS",
  "steps": [
    { "step": "metrics", "http": 200, "pass": true },
    { "step": "login", "http": 201, "code": "HRM-AUTH-200" },
    {
      "step": "leave_balance_self",
      "http": 200,
      "code": "HRM-LEAVE-BAL-200",
      "available_days": 8,
      "used_days": 3,
      "entitled_days": 12,
      "source": "employee_leave_balances",
      "pass": true
    }
  ]
}
```

Request:

```http
GET /api/hrm/attendance/leave-balance?company_id=holding&employee_id=3796d949-4513-45c0-88fa-33030a062b17&leave_type=annual&year=2026
Authorization: Bearer {uat.nv0001 token}
x-tenant-id: xevn
x-company-id: holding
```

## Residual / QA scope

- **VAL-W7-LBAL-02** foreign `employee_id` → 403 — not re-probed by DevOps; QA should retest.
- **VAL-W7-LBAL-03** zeros + `source: default` — QA runtime verify.
- **J-MOB-25..28** mobile balance UI — QA L2.5 after API PASS confirmed.
- **D-W7-LEAVE-BAL-BUILD-01** — local `nest build` exit 0; closed for deploy path.

## Handoff

- **next_owner:** qa
- **ack_status:** READY_FOR_QA
