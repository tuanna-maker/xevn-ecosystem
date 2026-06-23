# MOB-UX-12d-BE-CONTRACTS — contracts-insurance list scope/SQL fix

| Field | Value |
|-------|-------|
| work_item_id | MOB-UX-12d-BE-CONTRACTS |
| date | 2026-06-09 |
| owner | dev-be |
| ack_status | **READY_FOR_QA** |

## Root cause

`GET /api/hrm/contracts-insurance/contracts` for mobile ESS (`uat.nv0001@xe.vn`) returned **500** `HRM-SYS-001`:

```text
invalid reference to FROM-clause entry for table "ec"
```

**SQL bug (pre-fix):** `qualifyContractInsuranceFilters` applied global `.replace(/\bcompany_id\b/g, 'ec.company_id')` on workforce `employee_id IN (SELECT … FROM public.employees WHERE company_id = …)` clauses. PostgreSQL then saw `ec.company_id` **inside the subquery** where alias `ec` is out of scope → 42P01-class error surfaced as `HRM-SYS-001`.

**Secondary issues:**

- Filter builders pre-prefixed `ec.employee_id` / `ir.employee_id` before qualify → risk of `ec.ec.employee_id` double-qualify (P1-HRM-INC-API-500-01).
- Mobile sends `company_id` as legal **UUID**; list scope did not normalize via `normalizePayrollListCompanyId` + `expandHrmTextCompanyIds` (parity with attendance/payroll D-MOB-UX-10d).
- `pushResolvableEmployeeScope` skipped workforce filter for single-company employee JWTs.

## Fix (hrm-api)

File: `apps/api/hrm-api/src/contracts-insurance/contracts-insurance.service.ts`

1. `resolveContractsListScope` — UUID→slug normalize + expanded TEXT company ids for `pushCompanyIdFilter`.
2. `qualifyContractInsuranceFilters` — qualify only **outer** `employee_id` on IN-subquery clauses; negative lookbehind avoids `ec.ec.*`.
3. Build filters with unqualified column names; single qualify pass before `ec`/`ir` JOIN queries.
4. Always apply `pushWorkforceEmployeeScopeFilter` for list/detail/expiring paths.

## Verification

| Check | Result |
|-------|--------|
| `pnpm exec jest src/contracts-insurance/` | **25/25 PASS** |
| Local `:28001` `uat.nv0001` contracts list | **200** `HRM-CON-200`, total=1 |
| nip.io pre-deploy probe | **500** `HRM-SYS-001` (VPS still on pre-fix image — deploy required for device L2.5) |

### Local smoke (repro)

```powershell
node -e "
const API = 'http://127.0.0.1:28001';
(async () => {
  const login = await fetch(API + '/api/hrm/auth/mobile/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'uat.nv0001@xe.vn', password: 'xevn-uat-2026' }),
  });
  const d = (await login.json()).data;
  const a = d.active_membership;
  const q = new URLSearchParams({ company_id: a.company_uuid, employee_id: a.employee_id });
  const res = await fetch(API + '/api/hrm/contracts-insurance/contracts?' + q, {
    headers: { Authorization: 'Bearer ' + d.access_token },
  });
  console.log(res.status, (await res.json()).code);
})();
"
# Expected: 200 HRM-CON-200
```

### nip.io pre-deploy (expected FAIL until devops deploy)

```text
GET https://14-225-217-232.nip.io/api/hrm/contracts-insurance/contracts?company_id=6efaa5d6-a4a8-4bfd-805a-3c4f003e4013&employee_id=3796d949-4513-45c0-88fa-33030a062b17
→ 500 HRM-SYS-001 invalid reference to FROM-clause entry for table "ec"
```

## Regression tests added/updated

- `MOB-UX-12d: listContracts with mobile company_uuid + employee_id never double-qualifies ec`
- `P1-HRM-INC-API-500-01` — no `ec.ec.*` on list/expiring
- `J-HRM-INT-02` — employee_id filter qualify parity
- Subquery guard: no `ec.company_id` inside `FROM public.employees` subquery

## Residual

| Item | Owner | Notes |
|------|-------|-------|
| nip.io deploy hrm-api | devops | Required before qa-device Contracts L2.5 |
| qa-device SET G-4 Contracts/Operations | qa-device | After deploy — frozen APK `B8F73859…` |

## Handoff

- **completion_report**: Root-caused PG `ec` alias leak in contracts list SQL; fixed scope UUID normalize + qualifyContractInsuranceFilters; jest 25/25 PASS; local uat.nv0001 contracts 200. nip.io still 500 pre-deploy.
- **next_owner**: qa (after devops deploy) or devops first if deploy not auto-chained
- **next_dispatch_prompt**: After devops deploys hrm-api to nip.io, QA retest `GET /api/hrm/contracts-insurance/contracts?company_id={company_uuid}&employee_id={eid}` for `uat.nv0001@xe.vn` → expect 200 `HRM-CON-200`; then qa-device MOB-UX-12d Contracts + Operations on frozen APK `B8F738596F9D11AFFFE9BD3AE1F92A6E759BE844717B5D617D026DB5D297F3EA` (`home-action-tile-policies`, `home-action-tile-more`). Evidence `docs/qa/evidence/mob-ux-12d-be-contracts-20260609.md`.
- **evidence_path**: docs/qa/evidence/mob-ux-12d-be-contracts-20260609.md
- **ack_status**: READY_FOR_QA
