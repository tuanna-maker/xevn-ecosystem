# P1-EX-DO-SEED-HTTPS-09 — Pilot payslip seed for `company_id=main`

| Field | Value |
|---|---|
| work_item_id | `P1-EX-DO-SEED-HTTPS-09` |
| from_role | `devops` |
| to_role | `pm` |
| date | `2026-05-27` |
| base_url | `https://14-225-217-232.nip.io` |
| blocker_source | `docs/qa/evidence/p1-ex-qa-https-01-r8-20260527.md` (J-HRM-07 `data_gap`, `total: 0`) |
| ack_status | **PASS_TO_PM** |
| no_commit | `true` |

---

## Executive verdict

| Gate | Result | Notes |
|---|---|---|
| DB scoped payslips (`main` partition) | **PASS** | `0` → **80** rows linked to `xevn` tenant + member slugs |
| `GET /api/hrm/payroll/payslips?company_id=main&page_size=100` | **PASS** | HTTP **200** `HRM-PAY-200`, **`total: 80`** |
| Employee resolvable | **PASS** | First row `employee_id` → `GET /employees/{id}?company_id=main` **200** `HRM-EMP-200` |

**pm_dispatch_hint:** `P1-EX-QA-HTTPS-01-R9` — retest J-HRM-07 (and full L2.5 bundle); scope_parity items J-HRM-01/04 remain BE-owned.

---

## Root cause

| Finding | Detail |
|---|---|
| Raw payslip count | **1001** rows in `payroll_payslips` |
| Scoped for `main` (pre-fix) | **0** — API list used `pushWorkforceEmployeeScopeFilter` |
| Orphan FK | **939** payslips with `employee_id` not in `employees` |
| Workforce in scope | **100** active employees (`tenant_id=xevn`, slugs `holding`…`services`) |
| VPS repo gap | `/opt/xevn-ecosystem` missing `seed-hrm-satellite-from-workforce.mjs` (not pulled); repair script pushed via `docker cp` |

Payslips existed by `company_id` slug but pointed at **stale/orphan** employee UUIDs from prior seed generations — not visible under group CEO `company_id=main` rollup.

---

## Remediation (VPS `14.225.217.232`)

| Step | Action |
|---|---|
| 1 | Diagnose via `docker exec xevn-hrm-be-dev` + `pg` against external DB `113.20.107.184:6432` / `xevn_hrm` |
| 2 | Copy `scripts/tmp-p1-ex-do-seed-https-09-repair.mjs` → container `/app/scripts/` |
| 3 | Run repair with deploy `.env` (`DB_*`, `HRM_FIDELITY_SEED_TAG=p1-ex-do-seed-https-09`) |
| 4 | Repair: delete orphan/out-of-scope payslips; upsert **processed** May-2026 periods per slug; insert payslips for ~85% cohort of in-scope employees |

**Commands (no secrets):**

```bash
# On VPS host
source /opt/xevn-ecosystem/deploy/xevn-ecosystem/.env
docker cp /tmp/p1-ex-do-seed-https-09-repair.mjs xevn-hrm-be-dev:/app/scripts/tmp-p1-ex-do-seed-https-09-repair.mjs
docker exec -e DB_HOST -e DB_PORT -e DB_USER -e DB_PASSWORD -e HRM_DB_NAME \
  -e HRM_FIDELITY_SEED_TAG=p1-ex-do-seed-https-09 \
  xevn-hrm-be-dev sh -lc 'cd /app && node scripts/tmp-p1-ex-do-seed-https-09-repair.mjs'
```

**Repair outcome (first run):** `scoped_main_payslips: 80`, `employees_in_main_scope: 100`, `deleted_orphan: 939`, `payslips_upserted: 80`.

---

## HTTPS smoke (operator network)

Login: `POST /api/xbos/auth/login` — `ceo@xe.vn` (pilot matrix).

| Probe | HTTP | Code | Body |
|---|---:|---|---|
| `GET /api/hrm/payroll/payslips?company_id=main&page_size=100` | 200 | `HRM-PAY-200` | `total: 80`, 80 rows |
| `GET /api/hrm/employees/{first.employee_id}?company_id=main` | 200 | `HRM-EMP-200` | resolvable |

Sample first row: `employee_id=00000000-0000-4000-8000-000000000002`, `company_id=holding`.

---

## Residual / follow-up

| Priority | Owner | Item |
|---|---|---|
| P2 | **devops** | `git pull` VPS to include `seed:hrm:fidelity` script; prefer repo script over one-off repair on next fidelity wave |
| P1 | **dev-be** | J-HRM-01 / J-HRM-04 scope parity (`GET /employees/{id}` 404 for contract/insurance FK) — unchanged by this seed |
| P2 | **pm** | After BE-09 deploy + this seed PASS → dispatch `P1-EX-QA-HTTPS-01-R9` |

---

## Handoff packet

```yaml
work_item_id: P1-EX-DO-SEED-HTTPS-09
from_role: devops
to_role: pm
ack_status: PASS_TO_PM
entry_criteria:
  - QA R8 J-HRM-07 FAIL — payslips list total=0 under company_id=main
exit_criteria:
  - payslips list total > 0 on HTTPS pilot
  - at least one payslip employee_id resolves via GET /employees/{id}?company_id=main
evidence_path: docs/ops/evidence/p1-ex-do-seed-https-09-20260527.md
summary: |
  Repaired pilot HRM payroll_payslips: removed 939 orphan rows, seeded 80 payslips
  for xevn/main-scope employees. HTTPS list total=80; employee detail 200 for sample row.
pm_dispatch_hint: P1-EX-QA-HTTPS-01-R9 after BE-09 READY + seed PASS
no_commit: true
```
