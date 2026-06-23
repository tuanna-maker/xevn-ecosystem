# P1-HRM-H10-FIDELITY — QA retest

**work_item_id:** `P1-HRM-H10-FIDELITY`  
**from_role:** qa  
**to_role:** pm  
**date:** 2026-06-06  
**ack_status:** `PASS_TO_PM`  
**dev_evidence:** `docs/qa/evidence/p1-hrm-h10-fidelity-20260606.md`

## Verdict

**PASS (GWC R-H10-01)** — Scripted G-FID gate **7/7 PASS** after hrm-api restart; L0 stack + FE↔BE health exit **0**; L2 P-CC HRM embed target menus (contracts / insurance / attendance records / payroll) return **200 with rows** for `ceo@xe.vn` / `company_id=main` on `localhost:5173` proxy path. **Per-company** contract coverage gap for **`trsport`** (0.077) and **`finance`** (0.280) vs AC-FID-03 target **0.95** remains documented from DevOps evidence — **not blocking** global scripted gate; owner **dev-be** backlog.

**J-HRM-04 not retested** per PM directive (dev-fe in progress).

## Environment

| Item | Value |
|------|-------|
| Portal | `http://127.0.0.1:5173` |
| hrm-api | `http://127.0.0.1:28001` (restarted — was down at session start) |
| Account | `ceo@xe.vn` / `Xevn@2026` |
| Scope | `company_id=main` (group CEO rollup) |

## L0 — Stack gates

| Check | Command | Result |
|-------|---------|--------|
| Dev stack | `pnpm run qc:dev-stack` | **exit 0** — hrm-api, xbos-api, web-portal **200** |
| FE↔BE health | `pnpm run qc:fe-be-health` | **exit 0** — portal login OK; direct + proxy `/api/hrm/employees`, `/api/hrm/catalog-sync` **200** |
| Menu density | `pnpm run verify:hrm:menu-density` | **exit 0** — **7/7 PASS** |

### Density counts (QA session — post hrm-api restart)

```
PASS  employees          employees=1190 (need >=1000)
PASS  contracts-ratio    contracts=1169 active=1122 ratio=1.042 need>=0.85
PASS  insurance-ratio    insurance=2092 ratio need>=0.85
PASS  attendance-scale   attendance=2852 need>=22
PASS  payroll-periods    payroll_periods=59 need>=10
PASS  recruitment-pipeline requisitions=38 candidates=55 need>=5
PASS  leave-requests     leave_requests=25 need>=5
```

Note: Global counts **higher** than DevOps handoff earlier same day (seed/fidelity completion on remote DB). Scripted gate stable **7/7**.

## L2 — P-CC HRM embed menus (API + proxy)

Probe: `scripts/tmp-p1-hrm-web-audit-probe.mjs` + `qc:fe-be-health` portal proxy.

| P-CC | Route | Menu API | HTTP | Rows (sample) | Result |
|------|-------|----------|------|---------------|--------|
| P-CC-04 | `/command-center/hrm/contracts` | `/contracts-insurance/contracts?company_id=main` | 200 | **50** | **PASS** |
| P-CC-05 | `/command-center/hrm/insurance` | `/contracts-insurance/insurance?company_id=main` | 200 | **50** (+ expiring **86**) | **PASS** |
| P-CC-07 | `/command-center/hrm/attendance` | `/attendance/records?company_id=main` | 200 | **50** | **PASS** |
| P-CC-08 | `/command-center/hrm/payroll` | `/payroll/payslips?company_id=main` | 200 | **893** total | **PASS** |

Supporting context (not H10 primary scope): employees **100** rows PASS; scope parity J-HRM-01/02 GET-by-id **200**.

**Out of H10 slice note:** `attendance-leave` probe total=0 (leave-requests @ main) — not in requested contracts/insurance/attendance-records/payroll menus.

## L2.5 — J-HRM journeys

| J-ID | Retest this wave | Result |
|------|------------------|--------|
| J-HRM-01 | Scope parity API (contract→employee) | **PASS** carry-forward |
| J-HRM-02 | Employee list→detail parity | **PASS** carry-forward |
| J-HRM-03 | Contract drawer | **PASS** carry-forward |
| **J-HRM-04** | Insurance→NV link | **Skipped** — PM: dev-fe fixing |
| J-HRM-06 | Attendance detail | **PASS** carry-forward (records data present) |
| J-HRM-07 | Payslip detail | **PASS** carry-forward (893 payslips) |

## GWC — Per-company fidelity (from DevOps `p1-hrm-h10-fidelity-20260606.md`)

| company_id | active_emp | contract_ratio | AC-FID-03 target | Status |
|------------|------------|----------------|------------------|--------|
| **trsport** | 207 | **0.077** (16/207) | ≥ 0.95 | **GWC open** — R-H10-01 |
| **finance** | 207 | **0.280** (58/207) | ≥ 0.95 | **GWC open** — R-H10-01 |
| holding | 255 | 0.812 | ≥ 0.95 | Below target — backlog |
| logistics | 207 | 0.990 | ≥ 0.95 | **MET** |
| services | 207 | 0.995 | ≥ 0.95 | **MET** |

Global scripted gate **PASS**; persona-filtered contract lists for member companies may still look sparse until dev-be seed cohort fix.

## Residual

| ID | Owner | Note |
|----|-------|------|
| R-H10-01 | dev-be | `trsport` / `finance` per-company contract_ratio vs 0.95 |
| R-H10-02 | dev-be | `seed:hrm:fidelity` long-run logging (DevOps) |
| R-H10-03 | qa | Persona matrix browser spot — partial via API this wave |
| J-HRM-04 | dev-fe | Explicitly deferred this retest |

## Defects

None new opened. R-H10-01 tracked as **GWC**, not P0 blocker for H10 scripted gate closure.

---

**completion_report:** H10 fidelity QA **PASS_TO_PM (GWC R-H10-01)** — L0/L1 gates exit 0; menu-density **7/7**; P-CC-04/05/07/08 menus have data @ main rollup; J-HRM-04 skipped per PM; trsport/finance per-company contract gap noted from DevOps.  
**next_owner:** `pm`  
**next_dispatch_prompt:** PM intake `P1-HRM-H10-FIDELITY` PASS_TO_PM — dispatch **dev-be** `R-H10-01` trsport/finance contract seed cohort when prioritizing AC-FID-03; dispatch **qc** narrow G-FID gate if sprint DoD requires; **do not** re-dispatch J-HRM-04 QA until dev-fe handoff READY_FOR_QA.  
**evidence_path:** `docs/qa/evidence/p1-hrm-h10-fidelity-qa-20260606.md`
