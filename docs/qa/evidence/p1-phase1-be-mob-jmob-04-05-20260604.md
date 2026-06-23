# P1-PHASE1-BE-MOB-JMOB-04-05-01 — Mobile payslip + manager pending scope

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-PHASE1-BE-MOB-JMOB-04-05-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa-device` |
| **date** | 2026-06-04 |
| **ack_status** | **READY_FOR_QA** |

## Root cause

| Symptom | Cause |
|---------|--------|
| **J-MOB-04** empty payslip UI on nip.io while pilot `payslips=1` | Mobile `GET /payroll/payslips` sends JWT **`company_uuid`**; DB rows use TEXT slug **`holding`**. `resolveHrmListScope` filtered `p.company_id = <uuid>` → zero rows. Period list had the same mismatch. |
| **J-MOB-05** nip.io `pending=0` vs `:3001` `pending=1` | Probe/login may use **`holding`** slug when `company_uuid` missing on stale edge; seeded `attendance_update_requests.company_id` is **UUID TEXT**. Single-value slug filter missed UUID rows. |

**Note:** `HRM-ATT-REQ-203` on **Duyệt** is the **success** approve code; device FAIL was driven by **empty pending list**, not a failed POST.

## Fix (hrm-api)

1. **`normalizePayrollListCompanyId`** — map mobile `company_uuid` query → JWT slug before payroll list scope (`payroll.service` `listPayrollPeriods`, `listPayslips`).
2. **`expandHrmTextCompanyIds`** — include JWT slug + `company_uuid` for `aur.company_id::text = ANY(...)` on manager pending list (`attendance.service` `listUpdateRequests`).

## Files

- `apps/api/hrm-api/src/common/hrm-list-scope.ts`
- `apps/api/hrm-api/src/payroll/payroll.service.ts`
- `apps/api/hrm-api/src/attendance/attendance.service.ts`
- `apps/api/hrm-api/src/common/hrm-list-scope.spec.ts`
- `apps/api/hrm-api/src/payroll/payroll.service.spec.ts`
- `apps/api/hrm-api/src/attendance/attendance.service.spec.ts`
- `apps/api/hrm-api/src/common/p1-phase1-be-mob-jmob-04-05.spec.ts`

## Verification

```bash
pnpm --filter hrm-api exec jest --testPathPatterns="hrm-list-scope.spec|payroll.service.spec|attendance.service.spec|p1-phase1-be-mob-jmob-04-05" --no-cache
```

**Result:** 47/47 PASS (2026-06-04).

Post-deploy pilot (agent / QA):

```powershell
$env:HRM_MOBILE_EMAIL="uat.nv0001@xe.vn"
$env:HRM_MOBILE_PILOT_PASSWORD="xevn-uat-2026"
$env:HRM_API_BASE_URL="https://14-225-217-232.nip.io"
node scripts/tmp-p1-resid-c03-probe.mjs
```

Expect exit **0** — `payslips >= 1`, `pending >= 1` on **both** nip.io and `:3001`.

## completion_report

- Closed: payroll UUID→slug list parity (J-MOB-04); attendance pending slug+uuid TEXT filter (J-MOB-05 / nip.io probe parity).
- Open: **devops** redeploy `hrm-be` on pilot so nip.io serves this build; then **qa-device** strict J-MOB-04 detail + J-MOB-05 with pending row visible.

## next_owner

`qa-device` (after devops redeploy)

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-QA-MOB-JMOB-01-R2
from_role: pm
to_role: qa-device
entry_criteria: docs/qa/evidence/p1-phase1-be-mob-jmob-04-05-20260604.md READY_FOR_QA; hrm-be redeployed on pilot; tmp-p1-resid-c03-probe.mjs exit 0 on https://14-225-217-232.nip.io for uat.nv0001@xe.vn
exit_criteria: adb pm clear vn.xevn.hrm.mobile → login uat.nv0001@xe.vn → J-MOB-04 payslip row→detail (no Chưa có phiếu lương) + J-MOB-05 Duyệt with pending row (no empty approvals); evidence docs/qa/evidence/p1-phase1-qa-mob-jmob-20260604-r2.md
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/p1-phase1-qa-mob-jmob-20260604-r2.md
```

## pm_dispatch_hint

**devops** redeploy `hrm-be` first if nip.io probe still `pending=0`; then **qa-device** R2 strict L2.5.
