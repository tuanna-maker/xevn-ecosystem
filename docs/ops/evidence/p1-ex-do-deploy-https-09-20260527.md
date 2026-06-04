# P1-EX-DO-DEPLOY-HTTPS-09 — BE-HTTPS-09 on HTTPS pilot

| Field | Value |
|---|---|
| work_item_id | `P1-EX-DO-DEPLOY-HTTPS-09` |
| from_role | `devops` |
| to_role | `pm` |
| date | `2026-05-27` |
| base_url | `https://14-225-217-232.nip.io` |
| handoff_in | `docs/qa/evidence/p1-ex-be-https-09-20260527.md` |
| ack_status | **PASS_TO_PM** |
| no_commit | `true` |

---

## Executive verdict

| Gate | Result | Notes |
|---|---|---|
| Code sync (BE-HTTPS-09) | **PASS** | `contracts-insurance.service.ts` on VPS contains `pushWorkforceEmployeeScopeFilter` + `qualifyContractInsuranceFilters` |
| L0 `GET /api/hrm/` | **PASS** | **200** local + external HTTPS |
| L0 HRM metrics | **PASS** | **200** Prometheus body |
| L0 XBOS (control) | **PASS** | **200** unchanged |
| Non-xevn containers | **PASS** | tasmos_*, asms_*, viconnec_* still Up |
| J-HRM-01 / J-HRM-04 (DevOps smoke) | **DATA_GAP** | Lists **200** but `total: 0` — no row to exercise list→detail (filter removed all orphan FK rows) |

**pm_dispatch_hint:** `P1-EX-QA-HTTPS-01-R9` for formal L2.5; if QA requires non-empty contracts/insurance under `company_id=main`, dispatch **data seed** (contracts/insurance linked to the 100 in-scope employees) — same class as payslip repair `P1-EX-DO-SEED-HTTPS-09`.

---

## Steps executed

| # | Action |
|---|---|
| 1 | Pre-deploy L0: external HTTPS `hrm-health:200`, `hrm-metrics:200`, `xbos:200` |
| 2 | `pscp` → `/opt/xevn-ecosystem/apps/api/hrm-api/src/contracts-insurance/contracts-insurance.service.ts` (no git commit) |
| 3 | `node scripts/merge-vps-port-env.mjs --apply-canonical` on VPS |
| 4 | `docker compose restart hrm-be` — wait ~60s; Nest `successfully started` |
| 5 | Post-deploy smoke (local + HTTPS Host header + external) |
| 6 | DevOps probe: contracts/insurance/employees counts under `ceo@xe.vn` + `x-company-id: main` |

**Not run:** full `docker compose up --build` (volume-mounted `start:dev` — SCP + restart sufficient). Skipped in-container `platform-core` build (`tsc` ENOENT in exec — not needed for this TS-only hotfix).

---

## Smoke evidence

### VPS (`127.0.0.1` + TLS Host)

```
hrm-local:200
hrm-https:200
```

Nest log: `Nest application successfully started` + `GET /api/hrm/` status **200**.

### External HTTPS

```
hrm-health:200
hrm-metrics:200
xbos:200
```

### Scope filter behavior (post-deploy)

| Endpoint | HTTP | Rows (`page_size=100`) |
|---|---|---|
| `GET /api/hrm/employees?company_id=main` | 200 | **100** |
| `GET /api/hrm/contracts-insurance/contracts?company_id=main` | 200 | **0** |
| `GET /api/hrm/contracts-insurance/insurance?company_id=main` | 200 | **0** |

Interpretation: BE-HTTPS-09 workforce filter is **live** — prior orphan `employee_id` rows no longer surface under group CEO rollup. J-HRM-01/04 journey probes need **seeded** contract/insurance rows tied to in-scope employees (QA R8 had rows but detail **404**; post-fix lists are empty).

### Full probe script (informational — not deploy gate)

`node scripts/tmp-p1-ex-qa-https-01-probe.mjs` → exit **1** (expected pre-existing gaps: `J-CC-03` KPI 409, `P-CC-01-jwt`, empty J-HRM-01/03/04). **L0 perimeter unchanged.**

---

## Residual / follow-up

| Priority | Owner | Item |
|---|---|---|
| P0 (QA) | **qa** | `P1-EX-QA-HTTPS-01-R9` — confirm J-HRM-01/04 **PASS** when data exists, or sign **data_gap** with empty list |
| P1 (data) | **devops** / **pm** | Seed contracts + insurance for `main` partition employees (if product requires non-zero lists on pilot) |
| P2 | **pm** | Merge BE-HTTPS-09 to `main` when commit allowed (repeat deploy via `git pull` instead of SCP) |

---

## Handoff packet

```yaml
work_item_id: P1-EX-DO-DEPLOY-HTTPS-09
from_role: devops
to_role: pm
ack_status: PASS_TO_PM
entry_criteria:
  - docs/qa/evidence/p1-ex-be-https-09-20260527.md READY_FOR_QA
exit_criteria:
  - GET /api/hrm/ → 200 on HTTPS pilot
  - hrm-api running with BE-HTTPS-09 contracts/insurance scope filter on VPS
evidence_path: docs/ops/evidence/p1-ex-do-deploy-https-09-20260527.md
summary: |
  Synced contracts-insurance.service.ts to VPS, restarted xevn-hrm-be-dev.
  L0 HRM/XBOS 200 on https://14-225-217-232.nip.io. Scope filter active;
  contracts/insurance lists empty under main (orphans filtered) — QA R9 + optional data seed.
pm_dispatch_hint: P1-EX-QA-HTTPS-01-R9
no_commit: true
```
