# MOB-UX-12d-DEPLOY — hrm-api contracts-insurance fix on nip.io

| Field | Value |
|-------|-------|
| work_item_id | MOB-UX-12d-DEPLOY |
| date | 2026-06-09 |
| owner | devops |
| ack_status | **READY_FOR_QA** |
| VPS | `14.225.217.232` / `https://14-225-217-232.nip.io` |

## Scope

Deploy dev-be `MOB-UX-12d-BE-CONTRACTS` SQL fix (`contracts-insurance.service.ts`) to VPS hrm-be so mobile ESS `uat.nv0001@xe.vn` contracts list returns **200** via nip.io (was **500** `HRM-SYS-001`).

## Pre-deploy

| Check | Result |
|-------|--------|
| `GET /api/hrm/contracts-insurance/contracts` (uat.nv0001 JWT) | **500** `HRM-SYS-001` |
| `company_uuid` | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` |
| `employee_id` | `3796d949-4513-45c0-88fa-33030a062b17` |
| Container age | `xevn-hrm-be-dev` Up 8h (pre-fix image) |

## Actions

1. PSCP synced to `/opt/xevn-ecosystem`:
   - `apps/api/hrm-api/src/contracts-insurance/contracts-insurance.service.ts`
   - `apps/api/hrm-api/src/contracts-insurance/contracts-insurance.service.spec.ts`
2. `docker compose --env-file .env up -d --build --force-recreate hrm-be` on VPS
3. Wait ~55s Nest boot; verify `qualifyContractInsuranceFilters` present on VPS (grep count **4**)

## Post-deploy gates

| Gate | Result |
|------|--------|
| `xevn-hrm-be-dev` status | **Up** (healthy), recreated 2026-06-08 22:13 +07 |
| `GET https://14-225-217-232.nip.io/api/hrm/metrics` | **200** |
| `GET http://127.0.0.1:3001/api/hrm/metrics` (VPS local) | **200** |
| Mobile login `uat.nv0001@xe.vn` | **PASS** |
| `GET /api/hrm/contracts-insurance/contracts?company_id={uuid}&employee_id={eid}` | **200** `HRM-CON-200`, `total=1` |
| Non-xevn containers | Not touched (no `compose down`) |
| VPS git HEAD | `68ec457` |

### Post-deploy smoke (repro)

```powershell
node -e "
const API = 'https://14-225-217-232.nip.io';
(async () => {
  const login = await fetch(API + '/api/hrm/auth/mobile/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'uat.nv0001@xe.vn', password: 'xevn-uat-2026' }),
  });
  const j = await login.json();
  const a = j.data.active_membership;
  const q = new URLSearchParams({ company_id: a.company_uuid, employee_id: a.employee_id });
  const res = await fetch(API + '/api/hrm/contracts-insurance/contracts?' + q, {
    headers: { Authorization: 'Bearer ' + j.data.access_token },
  });
  const body = await res.json();
  console.log(res.status, body.code, 'total=' + (body.data?.total ?? '?'));
})();
"
# Observed: 200 HRM-CON-200 total=1
```

## Residual

| Item | Owner | Notes |
|------|-------|-------|
| qa-device MOB-UX-12d Contracts/Operations L2.5 | qa-device | Frozen APK `B8F738596F9D11AFFFE9BD3AE1F92A6E759BE844717B5D617D026DB5D297F3EA` |
| Commit/push contracts fix to `main` | dev-be / PM | Deploy used PSCP hot-sync; `main` at `68ec457` may lag local fix |

## Handoff

- **completion_report**: PSCP contracts-insurance fix + force-recreate `hrm-be` on VPS; nip.io metrics 200; uat.nv0001 contracts list **200 HRM-CON-200** (was 500). Non-xevn stacks untouched.
- **next_owner**: qa
- **next_dispatch_prompt**: QA retest `GET https://14-225-217-232.nip.io/api/hrm/contracts-insurance/contracts?company_id=6efaa5d6-a4a8-4bfd-805a-3c4f003e4013&employee_id=3796d949-4513-45c0-88fa-33030a062b17` with `uat.nv0001@xe.vn` mobile login JWT → expect **200 HRM-CON-200**; then dispatch qa-device MOB-UX-12d SET G-4 Contracts (`home-action-tile-policies`) + Operations on frozen APK SHA `B8F738596F9D11AFFFE9BD3AE1F92A6E759BE844717B5D617D026DB5D297F3EA`. Evidence `docs/qa/evidence/mob-ux-12d-deploy-20260609.md`.
- **evidence_path**: docs/qa/evidence/mob-ux-12d-deploy-20260609.md
- **ack_status**: READY_FOR_QA
