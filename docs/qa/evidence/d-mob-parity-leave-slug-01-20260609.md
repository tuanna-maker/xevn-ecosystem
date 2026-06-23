# D-MOB-PARITY-LEAVE-SLUG-01 — holding slug scope on leave-requests + notifications/inbox

| Field | Value |
|-------|-------|
| **work_item_id** | `D-MOB-PARITY-LEAVE-SLUG-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **ack_status** | `READY_FOR_QA` |
| **generatedAt** | 2026-06-09 |

## Problem

MOB-PARITY-01 / MOB-ECOSYSTEM-UAT: mobile `uat.nv0001@xe.vn` login returns `default_company_id=holding`.  
`GET /attendance/leave-requests?company_id=holding` returned **500** `HRM-SYS-001` (`invalid input syntax for type uuid: "holding"`).  
UUID query path (`company_uuid`) returned **200** — scope parity break vs home/summary (fixed in D-W7-HOME-TASKS-SLUG-01).

## Root cause

`LeaveRequestsService.listLeaveRequests` used `lr.company_id = $n::uuid` for non-rollup scopes, casting slug `holding` to UUID.

`HrmInboxService.listInbox` filtered inbox with `scope.companyIds` only; rows persisted under JWT `company_uuid` (`6efaa5d6-…`) were missed when slug mapped only to pilot seed UUID (`10000000-…`).

## Fix

| Module | Change |
|--------|--------|
| `leave-requests.service.ts` | `normalizePayrollListCompanyId` + always `pushWorkforceEmployeeScopeFilter(..., 'lr.employee_id')` (mirror `home.service` / `leave-balance`) |
| `hrm-inbox.service.ts` | `expandHrmTextCompanyIds` before `pushCompanyIdUuidFilter` (mirror `home.service.queryScopedInbox`) |

## Verification

### Jest regression

```bash
cd apps/api/hrm-api
pnpm exec jest leave-requests.service.spec.ts hrm-inbox.service.spec.ts --no-cache
```

**Result:** 8/8 PASS (includes `D-MOB-PARITY-LEAVE-SLUG-01` holding slug + uuid normalization cases).

### Local runtime smoke (`uat.nv0001@xe.vn`, port 28003)

```bash
HRM_API_BASE_URL=http://127.0.0.1:28003 node scripts/tmp-d-mob-parity-leave-slug-01-probe.mjs
```

| Probe | Status | Code |
|-------|--------|------|
| leave-requests `company_id=holding` | 200 | HRM-LEAVE-200 |
| leave-requests `company_id=<uuid>` | 200 | HRM-LEAVE-200 |
| notifications/inbox `company_id=holding` | 200 | HRM-NOTIF-200 |
| notifications/inbox `company_id=<uuid>` | 200 | HRM-NOTIF-200 |

**Verdict:** 4/4 PASS — artifact: `docs/qa/evidence/d-mob-parity-leave-slug-01-probe.json` (local).

### nip.io pre-deploy (baseline)

```bash
HRM_API_BASE_URL=https://14-225-217-232.nip.io node scripts/tmp-d-mob-parity-leave-slug-01-probe.mjs
```

| Probe | Status | Notes |
|-------|--------|-------|
| leave-requests holding slug | **500** HRM-SYS-001 | expected until deploy |
| leave-requests uuid | 200 | unchanged |
| notifications/inbox holding | 200 | already OK on pilot (pilot UUID map) |
| notifications/inbox uuid | 200 | unchanged |

**3/4** — deploy residual for leave-requests holding slug only.

## Residual

- **Deploy:** nip.io leave-requests holding slug until hrm-api image redeploy.
- **MOB-PARITY-NTF-SLUG-01:** closed by inbox `expandHrmTextCompanyIds` hardening (jest + local PASS); QA may confirm on pilot post-deploy if inbox rows use non-pilot UUID only.

## Files touched

- `apps/api/hrm-api/src/attendance/leave-requests.service.ts`
- `apps/api/hrm-api/src/attendance/leave-requests.service.spec.ts`
- `apps/api/hrm-api/src/notifications/hrm-inbox.service.ts`
- `apps/api/hrm-api/src/notifications/hrm-inbox.service.spec.ts` (new)
- `scripts/tmp-d-mob-parity-leave-slug-01-probe.mjs` (QA reprobe)

## QA dispatch

Re-run MOB-PARITY-01 R2 after deploy:

1. `HRM_API_BASE_URL=https://14-225-217-232.nip.io node scripts/tmp-d-mob-parity-leave-slug-01-probe.mjs` → 4/4 PASS
2. J-MOB leave stack with `company_id=holding` on device/emulator
3. Promote `MOB-PARITY-01` MP-08 / MP-19 if PASS
