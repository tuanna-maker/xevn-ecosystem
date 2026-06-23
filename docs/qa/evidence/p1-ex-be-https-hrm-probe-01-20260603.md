# Dev-BE Evidence — P1-EX-BE-HTTPS-HRM-PROBE-01

| Field | Value |
|---|---|
| work_item_id | `P1-EX-BE-HTTPS-HRM-PROBE-01` |
| from_role | `dev-be` |
| to_role | `qa` |
| execution_time_utc | `2026-06-03` |
| environment_local | repo `HEAD` (commit `570b117` + probe L2 spec) |
| environment_pilot_before_fix | `https://14-225-217-232.nip.io` (stale `hrm-be`) |
| ack_status | **READY_FOR_QA** |

## Root cause (pilot FAIL — not business logic)

Independent probe (`scripts/tmp-p1-ex-qa-https-01-probe.mjs`) against nip.io showed **stale hrm-api** on VPS, not missing seed:

| Row | Pilot HTTP | Pilot `code` / message | Repo (current) |
|-----|------------|------------------------|----------------|
| P-CC-05 | 404 | `HRM-DATA-404` — `Cannot GET /api/hrm/contracts-insurance/insurance?...` | `GET contracts-insurance/insurance` registered (`570b117`) |
| P-CC-06 | 400 | `HRM-VAL-001` — `company_id must be a UUID` | `ListJobRequisitionsQueryDto` accepts slug `main` (`@IsString`) |
| P-CC-07 | 400 | `HRM-VAL-001` — `company_id must be a UUID` | `ListAttendanceRecordsQueryDto` accepts slug `main` |
| P-CC-08 | 400 | `HRM-VAL-001` — `property page_size should not exist` | `ListPayrollPayslipsQueryDto` whitelists `page_size` |

Collateral: `J-HRM-01/02/04/05/06/07` FAIL on pilot because list endpoints above do not return 200.

## Code delta this wave

| Artifact | Change |
|----------|--------|
| `apps/api/hrm-api/src/common/p1-ex-https-hrm-probe-l2.spec.ts` | **NEW** — supertest reproduces exact probe query strings with `ValidationPipe` (P-CC-05..08 → 200) |
| `570b117` (prior) | `GET insurance`, slug `company_id`, `page_size` on list DTOs, scope parity |

No additional product DTO edits required beyond `570b117`; deploy must ship rebuilt `hrm-api` image/artifact to pilot.

## Local reproduction

### A) Pilot baseline (pre-deploy)

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-p1-ex-qa-https-01-probe.mjs
```

Observed: P-CC-05..08 **FAIL** (see table above); JWT slice **PASS**.

### B) Repo HTTP-level (ValidationPipe + mocked services)

```bash
cd apps/api/hrm-api
npx jest src/common/p1-ex-https-hrm-probe-l2.spec.ts --runInBand
```

Result: **4/4 PASS** (P-CC-05 `HRM-CON-200`, P-CC-06 `HRM-REC-200`, P-CC-07 `HRM-ATT-200`, P-CC-08 `HRM-PAY-200`).

### C) Targeted module regression

```bash
npx jest src/common/hrm-query-validation-regression.spec.ts \
  src/common/hrm-list-query.dto.spec.ts \
  src/contracts-insurance/contracts-insurance.controller.spec.ts \
  src/recruitment/recruitment.controller.spec.ts \
  src/attendance/attendance.controller.spec.ts \
  src/payroll/payroll.controller.spec.ts --runInBand
```

Result: **56/56 PASS**.

## Post-deploy QA exit (required)

1. **DevOps** redeploy `hrm-be` from monorepo `HEAD` (same wave as xbos JWT fix). PM must **not** skip hrm-api container.
2. QA rerun on nip.io:

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-p1-ex-qa-https-01-probe.mjs
```

3. Expect: P-CC-05..08 **PASS**, J-HRM **≥6/7** (J-HRM-03 already passes when contracts list has rows).

### Spot-check messages after deploy

```text
GET .../contracts-insurance/insurance?company_id=main     → 200 HRM-CON-200
GET .../recruitment/requisitions?company_id=main&page_size=100 → 200 HRM-REC-200
GET .../attendance/records?company_id=main&page_size=100  → 200 HRM-ATT-200
GET .../payroll/payslips?company_id=main&page_size=100    → 200 HRM-PAY-200
```

## Scope parity note

List endpoints use `resolveHrmListScope` + `pushCompanyIdFilter` for `company_id=main` (group CEO rollup). No get-by-id change in this wave.

## completion_report

- **Closed:** Root-caused pilot P-CC-05..08 as stale hrm-api; confirmed fixes in repo; added `p1-ex-https-hrm-probe-l2.spec.ts`; 56 targeted jest + 4 HTTP probe tests **PASS** locally.
- **Residual:** Pilot nip.io still FAIL until **devops** redeploys `hrm-be`; full probe exit 0 not claimed on HTTPS until QA post-deploy retest.

## next_owner

`qa`

## next_dispatch_prompt

QA HTTPS retest `P1-EX-QA-HTTPS-HRM-PROBE-01` after devops redeploys `hrm-be` on `https://14-225-217-232.nip.io`: run `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs` — require **PASS** `P-CC-05`, `P-CC-06`, `P-CC-07`, `P-CC-08` and J-HRM-01/02/04/05/06/07 (L2.5). Evidence `docs/qa/evidence/p1-ex-qa-https-hrm-probe-01-YYYYMMDD.md`. Entry: `docs/qa/evidence/p1-ex-be-https-hrm-probe-01-20260603.md`. J-*: `PROGRAM_JOURNEY_MAP.md`. If insurance still 404, escalate devops sync not dev-be DTO.

## Handoff packet

```yaml
work_item_id: P1-EX-BE-HTTPS-HRM-PROBE-01
from_role: dev-be
to_role: qa
entry_criteria: P1-EX-QA HTTPS probe FAIL P-CC-05..08 on nip.io
exit_criteria: Code + tests PASS locally; pilot retest after hrm-be deploy
evidence_path: docs/qa/evidence/p1-ex-be-https-hrm-probe-01-20260603.md
ack_status: READY_FOR_QA
pm_dispatch_hint: P1-EX-DEVOPS-HRM-BE-DEPLOY — rebuild/recreate hrm-be before QA probe
```
