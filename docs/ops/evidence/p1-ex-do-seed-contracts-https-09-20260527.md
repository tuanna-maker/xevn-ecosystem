# P1-EX-DO-SEED-CONTRACTS-HTTPS-09 — Pilot contracts + insurance for `company_id=main`

| Field | Value |
|---|---|
| work_item_id | `P1-EX-DO-SEED-CONTRACTS-HTTPS-09` |
| from_role | `devops` |
| to_role | `pm` |
| date | `2026-05-27` |
| base_url | `https://14-225-217-232.nip.io` |
| account | `ceo@xe.vn` (pilot matrix) |
| journeys | J-HRM-01, J-HRM-04 |
| ack_status | **PASS_TO_PM** |
| no_commit | `true` |

---

## Executive verdict

| Gate | Result | Notes |
|---|---|---|
| `GET …/contracts?company_id=main` | **PASS** | HTTP **200** `HRM-CON-200`, **`total: 88`** |
| `GET …/insurance?company_id=main` | **PASS** | HTTP **200** `HRM-CON-200`, **`total: 88`** |
| Employee resolvable | **PASS** | First list row `employee_id` → `GET /employees/{id}?company_id=main` **200** `HRM-EMP-200` |

**pm_dispatch_hint:** `P1-EX-QA-HTTPS-01-R9` (or next QA wave) — retest J-HRM-01 / J-HRM-04 on HTTPS pilot.

---

## Root cause

| Finding | Detail |
|---|---|
| Pre-seed list totals | contracts **0**, insurance **0** under `company_id=main` |
| Employees in scope | **100** active rows via `GET /employees?company_id=main` |
| BE-HTTPS-09 behavior | List APIs filter rows where `employee_id` does not resolve in main workforce scope (orphans hidden) |
| Prior satellite rows | Orphan / stale `employee_id` on `employee_contracts` / `employee_insurance_records` not visible after deploy |

---

## Remediation

| Step | Action |
|---|---|
| 1 | Login `POST /api/xbos/auth/login` — `ceo@xe.vn` |
| 2 | `GET /api/hrm/employees?company_id=main&page_size=100` — collect in-scope `employee_id` values |
| 3 | HTTPS API seed (~85% cohort): `POST /contracts-insurance/contracts` + `POST …/insurance` with `company_id: main`, short `contract_type` (≤40 chars), unique `policy_number` |
| 4 | Verify list totals and `GET /employees/{first.employee_id}?company_id=main` |

**Script (repo, not committed):** `scripts/tmp-p1-ex-do-seed-contracts-https-09.mjs`

```bash
# From repo root (agent runner)
node scripts/tmp-p1-ex-do-seed-contracts-https-09.mjs
# Optional: PORTAL_DEV_URL, HRM_FIDELITY_SEED_TAG=p1-ex-do-seed-contracts-https-09
```

**API constraints discovered:**

| Issue | Fix |
|---|---|
| `HRM-VAL-001` on contract POST | Vietnamese contract labels exceed `MaxLength(40)` — use keys `HDLD_KTH`, `HDLD_XDHN_12`, … |
| `SCOPE_CONTEXT_MISMATCH` on insurance POST | Body `company_id` must be **`main`** (JWT operating bucket), not member slug |

---

## Seed outcome

| Metric | Value |
|---|---|
| Employees fetched | 100 |
| Contracts POST 201 | 87 |
| Insurance POST 201 | 87 |
| Skipped (cohort hash) | 13 |
| POST errors | 0 |
| List `contracts` total | **88** (includes 1 probe row from smoke) |
| List `insurance` total | **88** |

**Sample first list row:**

- `employee_id`: `00000000-0000-4000-8000-000000000100`
- `company_id` (persisted): `holding` (via `resolveHrmPersistCompanyIdText` from `main`)
- Employee probe: **200** `HRM-EMP-200`

---

## HTTPS smoke (final)

| Probe | HTTP | Code | Body |
|---|---:|---|---|
| `GET /api/hrm/contracts-insurance/contracts?company_id=main&page_size=100` | 200 | `HRM-CON-200` | `total: 88` |
| `GET /api/hrm/contracts-insurance/insurance?company_id=main&page_size=100` | 200 | `HRM-CON-200` | `total: 88` |
| `GET /api/hrm/employees/00000000-0000-4000-8000-000000000100?company_id=main` | 200 | `HRM-EMP-200` | resolvable |

---

## Residual / follow-up

| Priority | Owner | Item |
|---|---|---|
| P2 | **devops** | Promote `scripts/tmp-p1-ex-do-seed-contracts-https-09.mjs` into fidelity seed chain or VPS `seed-hrm-satellite-from-workforce.mjs` on next pull |
| P2 | **dev-be** | Optional: allow longer `contract_type` labels or document max length for embed |
| P1 | **qa** | Retest J-HRM-01 / J-HRM-04 click paths on HTTPS after this seed |

---

## Handoff packet

```yaml
work_item_id: P1-EX-DO-SEED-CONTRACTS-HTTPS-09
from_role: devops
to_role: pm
ack_status: PASS_TO_PM
entry_criteria:
  - After BE-HTTPS-09 deploy, contracts/insurance lists total=0 for company_id=main
exit_criteria:
  - contracts list total > 0 on HTTPS pilot
  - insurance list total > 0 on HTTPS pilot
  - first row employee_id resolves GET /employees/{id}?company_id=main → 200
evidence_path: docs/ops/evidence/p1-ex-do-seed-contracts-https-09-20260527.md
summary: |
  Seeded 87 contract + 87 insurance rows via HTTPS API for main-scope employees.
  Pilot lists total=88 each; sample employee detail 200 for J-HRM-01/04 QA.
pm_dispatch_hint: P1-EX-QA-HTTPS-01-R9 — J-HRM-01, J-HRM-04
no_commit: true
```
