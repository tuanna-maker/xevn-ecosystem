# QA — P1-HRM-H26-AC-FID-16-LINEAGE RETEST (catalog lineage)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-H26-AC-FID-16-LINEAGE` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-06-07 |
| **prior_fail** | `docs/qa/evidence/p1-hrm-h26-ac-fid-16-lineage-20260607.md` |
| **matrix** | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` **AC-FID-16** · §3 registry keys |
| **acceptance** | 100% transactional rows use catalog codes present in `synced_catalogs` snapshot per `(tenant_id, company_id)` |

## Verdict

**PASS_TO_PM** — After dev-be fix, all AC-FID-16 lineage probes **PASS**. Distinct-code probe **exit 0** (0/35 failures across five pilot slugs). Row-level contracts / insurance / attendance samples show **lineage_pct = 1.000** (0 orphan rows) on every slug×module combination. Menu density **11/11 PASS** (density gate unchanged; lineage now aligned).

**AC-FID-16 CLOSED** for SQL/catalog lineage gate. QC may proceed to fidelity final gate 15–16 subject to PM scope.

## Environment

| Item | Value |
|------|-------|
| Stack | `pnpm run qc:dev-stack` **exit 0** |
| hrm-api | `http://127.0.0.1:28001` |
| DB | `xevn_hrm` · tenant `xevn` |
| Pilot slugs | `holding`, `trsport`, `logistics`, `finance`, `services` |

## L0 — Stack

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | **exit 0** |

## AC-FID-16 — Distinct-code probe (§3 keys)

**Probe:** `node ./scripts/tmp-p1-hrm-acfid16-lineage-probe.mjs`  
**JSON:** `docs/qa/evidence/p1-hrm-h26-ac-fid-16-lineage-probe-20260607.json`  
**Exit:** **0** — `=== AC-FID-16 PASS ===`

| company_id | pass | fail_probes |
|------------|------|-------------|
| holding | true | 0 |
| trsport | true | 0 |
| logistics | true | 0 |
| finance | true | 0 |
| services | true | 0 |

**Probes covered (7×5):** `employees.job_title_key`, `contracts.contract_type`, `contracts.employee_job_title`, `insurance.employee_job_title`, `attendance.leave_type`, `attendance.employee_job_title`, `recruitment.candidate_source` (+ `operations.service_type` where applicable).

**Remediation confirmed:** Transactional fields now store catalog **`code`** values (`HDLD_*`, `LVT_*`, `CSO_*`, UAT role codes) matching `synced_catalogs` snapshot — prior BR-LINK-03 label/enum mismatch resolved.

## Row-level lineage — contracts / insurance / attendance

**Probe:** `node ./scripts/tmp-p1-hrm-acfid16-row-level.mjs`  
**Exit:** **0**

| company_id | Module | Column / join | total_rows | orphan_rows | lineage_pct | Target |
|------------|--------|---------------|------------|-------------|-------------|--------|
| holding | contracts | `contract_type` | 304 | 0 | **1.000** | 1.000 |
| holding | insurance | `employees.job_title_key` | 203 | 0 | **1.000** | 1.000 |
| holding | attendance | `employees.job_title_key` | 2649 | 0 | **1.000** | 1.000 |
| holding | attendance | `leave_requests.leave_type` | 39 | 0 | **1.000** | 1.000 |
| trsport | contracts | `contract_type` | 244 | 0 | **1.000** | 1.000 |
| trsport | insurance | job title | 214 | 0 | **1.000** | 1.000 |
| trsport | attendance | job title | 2577 | 0 | **1.000** | 1.000 |
| trsport | attendance | leave_type | 15 | 0 | **1.000** | 1.000 |
| logistics | contracts | `contract_type` | 233 | 0 | **1.000** | 1.000 |
| logistics | insurance | job title | 204 | 0 | **1.000** | 1.000 |
| logistics | attendance | job title | 2594 | 0 | **1.000** | 1.000 |
| logistics | attendance | leave_type | 15 | 0 | **1.000** | 1.000 |
| finance | contracts | `contract_type` | 241 | 0 | **1.000** | 1.000 |
| finance | insurance | job title | 211 | 0 | **1.000** | 1.000 |
| finance | attendance | job title | 2583 | 0 | **1.000** | 1.000 |
| finance | attendance | leave_type | 15 | 0 | **1.000** | 1.000 |
| services | contracts | `contract_type` | 234 | 0 | **1.000** | 1.000 |
| services | insurance | job title | 205 | 0 | **1.000** | 1.000 |
| services | attendance | job title | 2593 | 0 | **1.000** | 1.000 |
| services | attendance | leave_type | 15 | 0 | **1.000** | 1.000 |

## Menu density (regression guard)

| Check | Result |
|-------|--------|
| `pnpm run verify:hrm:menu-density` | **11/11 PASS** |

## Delta vs prior FAIL (2026-06-07 AM)

| Metric | Prior FAIL | Retest PASS |
|--------|------------|-------------|
| Distinct-code probe exit | 1 (35 failures) | **0** |
| contracts lineage_pct (holding) | 0.059 | **1.000** |
| leave_type lineage_pct (all slugs) | 0.000 | **1.000** |
| job_title lineage (trsport attendance) | 0.000 | **1.000** |

## Residual

| ID | Owner | Note |
|----|-------|------|
| L2/L2.5 UI | qa backlog | SQL lineage closed; optional UI spot-check if catalog-missing badges exist on embed |
| AC-FID-15 | qa backlog | UI fidelity — separate wave (not blocker for AC-FID-16 closure) |
| `verify:hrm:catalog-lineage` gate | devops/pm | Optional automation in menu-density — not required for this PASS |

---

**completion_report:** AC-FID-16 catalog lineage **CLOSED** after dev-be fix. `tmp-p1-hrm-acfid16-lineage-probe.mjs` exit **0** all five slugs; row-level contracts/insurance/attendance **lineage_pct=1.000** (0 orphans) on all 20 sample probes. L0 stack PASS; menu-density **11/11** regression PASS. Prior BR-LINK-03 root cause (labels vs codes) remediated.

**next_owner:** pm → qc

**next_dispatch_prompt:** PM dispatch **QC** `P1-HRM-FIDELITY-QC-FINAL-15-16`: AC-FID-16 lineage now **CLOSED** (`docs/qa/evidence/p1-hrm-h26-ac-fid-16-lineage-qa-20260607.md`). Re-gate fidelity program items 15–16 — confirm AC-FID-15 UI + remaining G-FID rows per `HRM_FULL_FIDELITY_PROGRAM.md`. Entry: distinct-code probe exit 0 + row-level 100% + menu-density 11/11. Exit: GO or GO WITH CONDITIONS with explicit residual list.

**evidence_path:** `docs/qa/evidence/p1-hrm-h26-ac-fid-16-lineage-qa-20260607.md`

**pm_dispatch_hint:** Unblock `P1-HRM-FIDELITY-QC-FINAL-15-16` — AC-FID-16 probe exit 0; promote AC-FID-16 to CLOSED in fidelity matrix.
