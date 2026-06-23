# QA — P1-HRM-H26-AC-FID-16-LINEAGE (catalog lineage)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-H26-AC-FID-16-LINEAGE` |
| **from_role** | qa |
| **to_role** | dev-be |
| **ack_status** | **FAIL → dev-be** |
| **executed_at** | 2026-06-07 |
| **matrix** | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` **AC-FID-16** · §3 registry keys |
| **acceptance** | 100% transactional rows use catalog codes present in `synced_catalogs` snapshot per `(tenant_id, company_id)` |

## Verdict

**FAIL → dev-be** — Catalog lineage **far below 100%** on all five pilot slugs. Row-level probes on contracts / insurance (via employee `job_title_key`) / attendance (`leave_type` + employee job title) show **0%–40%** lineage vs required **100%**. Distinct-code probe: **35/35** module×slug checks **FAIL** (exit **1**).

**AC-FID-16 remains OPEN.** Do not promote to QC final gate (15–16) until seed + snapshot alignment is fixed and QA re-runs.

## Environment

| Item | Value |
|------|-------|
| Stack | `pnpm run qc:dev-stack` **exit 0** |
| hrm-api | `http://127.0.0.1:28001` |
| DB | `xevn_hrm` · tenant `xevn` |
| Pilot slugs | `holding`, `trsport`, `logistics`, `finance`, `services` |
| Menu density | `pnpm run verify:hrm:menu-density` **11/11 PASS** (density ≠ lineage) |

## L0 — Stack

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | **exit 0** |

## AC-FID-16 — §3 catalog keys vs transactional codes

**Probe:** `node ./scripts/tmp-p1-hrm-acfid16-lineage-probe.mjs`  
**JSON:** `docs/qa/evidence/p1-hrm-h26-ac-fid-16-lineage-probe-20260607.json`  
**Exit:** **1** — `=== AC-FID-16 FAIL (35 probe failures) ===`

### Synced snapshot codes @ `holding` (reference)

| catalog_key | codes in snapshot (sample) | Transactional values seen |
|-------------|---------------------------|---------------------------|
| `job_titles` | `CEO`, `CHRO`, `DRIVER_LEAD`, `OPS_MANAGER` (**4**) | 25 UAT roles e.g. `DRIVER`, `HRBP_MANAGER`, `LEGAL_SPECIALIST` |
| `contract_types` | `HDLD_KTH`, `HDLD_XDHN_12`, `HDLD_XDHN_36`, `HDTV_60`, `HDHV` | Vietnamese labels e.g. `HĐ 1 năm`, `HĐ không thời hạn`, `HDLD 12 thang` |
| `leave_types` | `LVT_01`…`LVT_04` | `annual`, `sick`, `personal` |
| `candidate_sources` | `CSO_01`…`CSO_04` | `website`, `referral`, `headhunt` |

**Root cause class:** `BR-LINK-03` — transactional fields store **display labels or ad-hoc enums**, not **`code`** values from `synced_catalogs.payload.items[].code`. `job_titles` snapshot also **under-seeded** (4 codes vs 25 workforce roles).

## Row-level lineage — contracts / insurance / attendance (user-requested sample)

**Probe:** `node ./scripts/tmp-p1-hrm-acfid16-row-level.mjs`

| company_id | Module | Column / join | total_rows | orphan_rows | lineage_pct | Target |
|------------|--------|---------------|------------|-------------|-------------|--------|
| holding | contracts | `contract_type` | 304 | 286 | **0.059** | 1.000 |
| holding | insurance | `employees.job_title_key` | 203 | 161 | **0.207** | 1.000 |
| holding | attendance | `employees.job_title_key` | 2649 | 2125 | **0.198** | 1.000 |
| holding | attendance | `leave_requests.leave_type` | 39 | 39 | **0.000** | 1.000 |
| trsport | contracts | `contract_type` | 244 | 225 | **0.078** | 1.000 |
| trsport | insurance | job title | 214 | 214 | **0.000** | 1.000 |
| trsport | attendance | job title | 2577 | 2577 | **0.000** | 1.000 |
| trsport | attendance | leave_type | 15 | 15 | **0.000** | 1.000 |
| logistics | contracts | `contract_type` | 233 | 215 | **0.077** | 1.000 |
| logistics | insurance | job title | 204 | 204 | **0.000** | 1.000 |
| logistics | attendance | job title | 2594 | 2594 | **0.000** | 1.000 |
| logistics | attendance | leave_type | 15 | 15 | **0.000** | 1.000 |
| finance | contracts | `contract_type` | 241 | 227 | **0.058** | 1.000 |
| finance | insurance | job title | 211 | 167 | **0.209** | 1.000 |
| finance | attendance | job title | 2583 | 2054 | **0.205** | 1.000 |
| finance | attendance | leave_type | 15 | 15 | **0.000** | 1.000 |
| services | contracts | `contract_type` | 234 | 216 | **0.077** | 1.000 |
| services | insurance | job title | 205 | 124 | **0.395** | 1.000 |
| services | attendance | job title | 2593 | 1570 | **0.395** | 1.000 |
| services | attendance | leave_type | 15 | 15 | **0.000** | 1.000 |

**Note:** `leave_requests.company_id` is UUID scope key (`attendanceCompanyUuid`); transactional text slugs used elsewhere — probe uses correct UUID per slug.

## Distinct-code failures (all slugs — summary)

| probe_id | catalog_key | fail slugs | Typical missing codes |
|----------|-------------|------------|------------------------|
| `employees.job_title_key` | `job_titles` | 5/5 | UAT roles not in 4-code snapshot |
| `contracts.contract_type` | `contract_types` | 5/5 | Vietnamese labels vs `HDLD_*` keys |
| `contracts.employee_job_title` | `job_titles` | 5/5 | same as employees |
| `insurance.employee_job_title` | `job_titles` | 5/5 | same |
| `attendance.leave_type` | `leave_types` | 5/5 | `annual`/`sick`/`personal` |
| `attendance.employee_job_title` | `job_titles` | 5/5 | same |
| `recruitment.candidate_source` | `candidate_sources` | 5/5 | `website`/`referral`/`headhunt` |

`operations.service_type` — no orphan distinct codes detected (low cardinality / aligned or empty slice).

## Recommended dev-be fix (exit criteria for retest)

1. **Expand `synced_catalogs` snapshots** per §3 for pilot slugs: `job_titles` must include all **25** `UAT_ROLES` codes used by workforce seed.
2. **Re-seed or migrate transactional columns** to store catalog **`code`**, not Vietnamese label:
   - `employee_contracts.contract_type` → `HDLD_KTH`, `HDLD_XDHN_12`, …
   - `leave_requests.leave_type` → map to `leave_types` codes (or extend snapshot with `annual`/`sick`/`personal` if product chooses English enums — must match snapshot)
   - `recruitment_candidates.source` → `CSO_*` codes
3. Idempotent migration script + regression: `tmp-p1-hrm-acfid16-lineage-probe.mjs` **exit 0** all slugs; row-level lineage_pct **= 1.000** on contracts / insurance / attendance probes above.
4. Optional: add `verify:hrm:catalog-lineage` gate to menu-density script (distinct from AC-FID-10 key count).

## Residual

| ID | Owner | Note |
|----|-------|------|
| AC-FID-16 | dev-be | **OPEN** — blocker for fidelity QC final 15–16 |
| AC-FID-15 | qa backlog | UI fidelity — separate wave |
| L2/L2.5 | qa | Not in scope this SQL wave; retest after BE fix if UI shows catalog-missing badges |

---

**completion_report:** AC-FID-16 catalog lineage **FAIL** on all five pilot companies. SQL distinct-code probe 35 failures; row-level contracts/insurance/attendance lineage **6%–40%** (leave_type **0%**). L0 stack PASS; menu-density 11/11 PASS but does not cover lineage. **AC-FID-16 not closable.**

**next_owner:** dev-be

**next_dispatch_prompt:** Dev-BE `P1-HRM-H26-AC-FID-16-LINEAGE-FIX`: align transactional catalog fields with `synced_catalogs` §3 codes — (1) expand `job_titles` snapshot to all UAT roles; (2) migrate `employee_contracts.contract_type` to `HDLD_*` keys not Vietnamese labels; (3) map `leave_requests.leave_type` and `recruitment_candidates.source` to synced codes; idempotent seed/migration for five slugs. Handoff `READY_FOR_QA` with probe `node ./scripts/tmp-p1-hrm-acfid16-lineage-probe.mjs` exit 0 + row-level script 100% on contracts/insurance/attendance.

**evidence_path:** `docs/qa/evidence/p1-hrm-h26-ac-fid-16-lineage-20260607.md`

**pm_dispatch_hint:** Block QC `P1-HRM-FIDELITY-QC-FINAL-15-16` until AC-FID-16 probe exit 0 — density gates alone insufficient (BR-LINK-03).
