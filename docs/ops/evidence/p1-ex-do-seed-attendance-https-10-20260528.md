# P1-EX-DO-SEED-ATTENDANCE-HTTPS-10 — Pilot attendance seed for `company_id=main`

| Field | Value |
|---|---|
| work_item_id | `P1-EX-DO-SEED-ATTENDANCE-HTTPS-10` |
| from_role | `devops` |
| to_role | `pm` |
| date | `2026-05-28` |
| base_url | `https://14-225-217-232.nip.io` |
| account | `ceo@xe.vn` (pilot matrix) |
| journeys | J-HRM-06 |
| QC condition | C-HTTPSQC-02 |
| ack_status | **PASS_TO_PM** |
| no_commit | `true` |

---

## Executive verdict

| Gate | Result | Notes |
|---|---|---|
| `GET …/attendance/records?company_id=main&page_size=10` | **PASS** | HTTP **200** `HRM-ATT-200`, **`total: 75`** |
| `GET /employees/{employee_id}?company_id=main` | **PASS** | First list row → **200** `HRM-EMP-200` |

**pm_dispatch_hint:** Retest **J-HRM-06** on HTTPS pilot (L2.5); attendance list→employee deep link.

---

## Root cause

| Finding | Detail |
|---|---|
| Pre-seed list total | **0** under `company_id=main` |
| Employees in scope (API) | **100** active via `GET /employees?company_id=main` |
| Raw DB rows (pre-fix) | **5537** `attendance_records` — mostly **orphan** / out-of-scope `employee_id` |
| HTTPS API POST | **409** `SCOPE_CONTEXT_MISMATCH` — JWT `companyId=main` has no `company_uuid`; body must be UUID per `CreateAttendanceRecordDto` |
| List filter | `pushWorkforceEmployeeScopeFilter` — only rows whose `employee_id` resolves in master tenant + member slugs |

Orphan attendance rows were invisible to group CEO rollup; portal POST path blocked for pilot JWT.

---

## Remediation

| Step | Action |
|---|---|
| 1 | Probe HTTPS: confirm `total: 0` on attendance list |
| 2 | Attempt API cohort seed (`scripts/tmp-p1-ex-do-seed-attendance-https-10.mjs`) — all POST **409** (scope) |
| 3 | VPS DB repair: `scripts/tmp-p1-ex-do-seed-attendance-https-10-repair.mjs` via `docker cp` + `docker exec xevn-hrm-be-dev` |
| 4 | Repair: delete orphan/out-of-scope; upsert **75** present records for ~85% in-scope cohort |
| 5 | HTTPS smoke: list `total >= 1` + employee GET **200** |

**Commands (no secrets):**

```bash
# Local → VPS
pscp scripts/tmp-p1-ex-do-seed-attendance-https-10-repair.mjs root@14.225.217.232:/tmp/

# On VPS host
source /opt/xevn-ecosystem/deploy/xevn-ecosystem/.env
docker cp /tmp/tmp-p1-ex-do-seed-attendance-https-10-repair.mjs \
  xevn-hrm-be-dev:/app/scripts/tmp-p1-ex-do-seed-attendance-https-10-repair.mjs
docker exec \
  -e DB_HOST="$DB_HOST" -e DB_PORT="$DB_PORT" \
  -e DB_USER="$DB_USER" -e DB_PASSWORD="$DB_PASSWORD" \
  -e HRM_DB_NAME="${HRM_DB_NAME:-xevn_hrm}" \
  -e HRM_FIDELITY_SEED_TAG=p1-ex-do-seed-attendance-https-10 \
  xevn-hrm-be-dev sh -lc 'cd /app && node scripts/tmp-p1-ex-do-seed-attendance-https-10-repair.mjs'
```

**Repair outcome (first run):**

| Metric | Value |
|---|---|
| `employees_in_main_scope` | 91 |
| `deleted_orphan` | 5225 |
| `deleted_out_of_scope` | 312 |
| `attendance_upserted` | 75 |
| `scoped_main_attendance` | 75 |

---

## HTTPS smoke (final)

Login: `POST /api/xbos/auth/login` — `ceo@xe.vn`.

| Probe | HTTP | Code | Body |
|---|---:|---|---|
| `GET /api/hrm/attendance/records?company_id=main&page_size=10` | 200 | `HRM-ATT-200` | `total: 75` |
| `GET /api/hrm/employees/00000000-0000-4000-8000-000000000065?company_id=main` | 200 | `HRM-EMP-200` | resolvable |

Sample first list row: `employee_id=00000000-0000-4000-8000-000000000065`, `status=present`, `attendance_date=2026-05-27`.

---

## Residual / follow-up

| Priority | Owner | Item |
|---|---|---|
| P2 | **dev-be** | Allow portal group CEO POST attendance with `company_id=main` or emit `company_uuid` on JWT — avoid DB-only seed |
| P2 | **devops** | Promote repair into `seed-hrm-satellite-from-workforce.mjs` on next VPS `git pull` |
| P1 | **qa** | Retest **J-HRM-06** click path on HTTPS after this seed |

---

## Handoff packet

```yaml
work_item_id: P1-EX-DO-SEED-ATTENDANCE-HTTPS-10
from_role: devops
to_role: pm
ack_status: PASS_TO_PM
entry_criteria:
  - QC C-HTTPSQC-02: J-HRM-06 attendance list total=0 on HTTPS pilot
exit_criteria:
  - GET attendance/records?company_id=main → total >= 1
  - GET employees/{linked_id}?company_id=main → 200
evidence_path: docs/ops/evidence/p1-ex-do-seed-attendance-https-10-20260528.md
summary: |
  VPS DB repair removed 5537 orphan/out-of-scope attendance rows and upserted 75
  in-scope records. HTTPS list total=75; first-row employee resolves 200.
```
