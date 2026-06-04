# P1-EX-DO-HTTPS-L25-DATA-SEED-01 — Deterministic HTTPS L2.5 data seeding (`company_id=main`)

| Field | Value |
|---|---|
| work_item_id | `P1-EX-DO-HTTPS-L25-DATA-SEED-01` |
| from_role | `pm` |
| to_role | `devops` |
| date | `2026-05-28` |
| base_url | `https://14-225-217-232.nip.io` |
| account | `ceo@xe.vn` |
| ack_status | **READY_FOR_QA** |
| no_commit | `true` |

---

## Scope executed

Deterministic pilot data seed/reseed was executed so HTTPS `company_id=main` list->detail paths are runnable for:

- Contracts
- Insurance
- Recruitment
- Attendance
- Payroll

Commands run (sanitized):

```bash
pnpm seed:hrm:fidelity
pnpm verify:hrm:menu-density
node scripts/tmp-p1-ex-qa-https-01-probe.mjs
```

---

## Seed execution result

`pnpm seed:hrm:fidelity` completed successfully:

- `seed_tag`: `hrm-realistic-v2`
- `seeded_this_run.contracts`: `137`
- `seeded_this_run.insurance`: `137`
- `seeded_this_run.attendance`: `396`
- `seeded_this_run.payroll.periods`: `10`
- `seeded_this_run.payroll.payslips`: `140`
- `seeded_this_run.recruitment.requisitions`: `10`
- `seeded_this_run.recruitment.candidates`: `20`

`pnpm verify:hrm:menu-density` result:

- PASS `contracts-ratio`
- PASS `insurance-ratio`
- PASS `attendance-scale`
- PASS `payroll-periods`
- PASS `recruitment-pipeline`
- PASS `leave-requests`
- FAIL `employees>=1000` (current active workforce is 170; this does not block L2.5 list->detail executability for this wave)

---

## HTTPS main-scope validation (`company_id=main`)

Authenticated API totals after seed:

| Module | Endpoint | HTTP | Code | Total |
|---|---|---:|---|---:|
| Contracts | `/api/hrm/contracts-insurance/contracts?company_id=main&page_size=100` | 200 | `HRM-CON-200` | **170** |
| Insurance | `/api/hrm/contracts-insurance/insurance?company_id=main&page_size=100` | 200 | `HRM-CON-200` | **170** |
| Recruitment | `/api/hrm/recruitment/requisitions?company_id=main&page_size=100` | 200 | `HRM-REC-200` | **24** |
| Attendance | `/api/hrm/attendance/records?company_id=main&page_size=100` | 200 | `HRM-ATT-200` | **299** |
| Payroll | `/api/hrm/payroll/payslips?company_id=main&page_size=100` | 200 | `HRM-PAY-200` | **78** |

L2.5 journey probe (`node scripts/tmp-p1-ex-qa-https-01-probe.mjs`):

- PASS `J-HRM-01`
- PASS `J-HRM-02`
- PASS `J-HRM-03`
- PASS `J-HRM-04`
- PASS `J-HRM-05`
- PASS `J-HRM-06`
- PASS `J-HRM-07`
- Summary: `L2.5 journeys 7/7 PASS`

---

## QA rerun instructions

Use HTTPS pilot account `ceo@xe.vn` and rerun:

1. Login on `https://14-225-217-232.nip.io`.
2. Validate list loads with rows on these modules under `company_id=main`:
   - contracts, insurance, recruitment, attendance, payroll.
3. Execute list->detail click paths for:
   - `J-HRM-01`, `J-HRM-04`, `J-HRM-05`, `J-HRM-06`, `J-HRM-07`.
4. Optional command-assisted recheck:

```bash
PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs
```

Expected for QA promotion: all `J-HRM-*` journeys remain PASS with non-zero row source lists.

---

## Handoff packet

```yaml
work_item_id: P1-EX-DO-HTTPS-L25-DATA-SEED-01
from_role: devops
to_role: qa
ack_status: READY_FOR_QA
entry_criteria:
  - QA L2.5 journey run completed but list->detail may be blocked when rowCount=0
exit_criteria:
  - Deterministic seed executed for contracts, insurance, recruitment, attendance, payroll under company_id=main
  - HTTPS validated totals > 0 per module
  - L2.5 J-HRM journeys runnable (probe shows 7/7 PASS)
evidence_path: docs/ops/evidence/p1-ex-do-https-l25-data-seed-01-20260528.md
summary: |
  Executed deterministic HRM fidelity seeding and validated HTTPS main-scope module totals are >0
  for contracts, insurance, recruitment, attendance, and payroll. L2.5 J-HRM journeys now execute
  with 7/7 PASS in probe, ready for QA rerun/promotion.
```
