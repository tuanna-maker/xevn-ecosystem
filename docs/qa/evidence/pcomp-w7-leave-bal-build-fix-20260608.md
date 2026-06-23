# D-W7-LEAVE-BAL-BUILD-01 — leave-balance TS2322 build fix

| Field | Value |
|-------|-------|
| work_item_id | D-W7-LEAVE-BAL-BUILD-01 |
| role | dev-be |
| date | 2026-06-08 |
| ack_status | **READY_FOR_QA** |
| ref_qa_fail | `docs/qa/evidence/pcomp-w7-mob-leave-bal-qa-20260608.md` |

## Root cause

`mapBalancePayload` parameter type was `Partial<LeaveBalanceRow> & { entitled_days: number; ... }`.

`LeaveBalanceRow` declares `entitled_days` / `used_days` / `pending_days` as `string` (DB `::text` cast), while the intersection required `number`. TypeScript resolved the conflict to `never`, producing **9× TS2322** on `nest build`. Jest passed because `ts-jest` does not run the full Nest production compile.

## Fix

Introduced dedicated `MapBalanceInput` type accepting `string | number` for day fields (aligned with existing `toDayNumber`). Removed `Partial<LeaveBalanceRow>` intersection from `mapBalancePayload`. DB row mapping now passes string day values directly; `toDayNumber` normalizes inside the mapper.

**File:** `apps/api/hrm-api/src/attendance/leave-balance.service.ts`

## Verification

### 1. Production build

```bash
cd apps/api/hrm-api && npx nest build
# exit 0
```

### 2. Unit / controller regression

```bash
cd apps/api/hrm-api && npx jest leave-balance.service.spec.ts attendance.controller.spec.ts --no-cache
# Test Suites: 2 passed, 2 total
# Tests:       26 passed, 26 total
```

Covers: VAL-W7-LBAL-02, VAL-W7-LBAL-03, W7-4 `HRM-LEAVE-BAL-200` controller path, scope filter `company_id=main`, custom_fields fallback.

## Residual (not in this work_item)

| ID | Owner | Summary |
|----|-------|---------|
| D-W7-LEAVE-BAL-DEPLOY-01 | devops | nip.io `GET /attendance/leave-balance` → 404 — pilot image missing route |
| J-MOB-25..28 | qa (after deploy) | Mobile balance UI blocked until pilot API 200 |

## Handoff

- **next_owner:** qa (after devops deploy) / devops first for D-W7-LEAVE-BAL-DEPLOY-01
- **pm_dispatch_hint:** devops deploy hrm-api with leave-balance route → QA re-run PCOMP-W7-MOB-LEAVE-BAL (nip.io 200 + VAL-W7-LBAL-02)
