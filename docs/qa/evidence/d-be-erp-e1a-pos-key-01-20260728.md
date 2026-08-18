# Evidence — D-BE-ERP-E1A-POS-KEY-01 (MD-BIND Layer A position_key)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-BE-ERP-E1A-POS-KEY-01` |
| **from_role** | pm |
| **to_role** | dev-be |
| **lane** | execution E1-A |
| **date** | 2026-07-28 |
| **change_mode** | ADD · preserve_default · CODE-MEMORY APPEND |
| **ack_status** | **READY_FOR_QA** |
| **HOLD_DEPLOY** | yes (no prod cutover this WI) |
| **U65** | no seed in evidence / tests (catalog assert mocked) |

---

## 1. spec_read_ack

| Plane | Path | Cited |
|-------|------|-------|
| SRS delta | `docs/program/deltas/BA_ERP_E1A_SRS_01_20260728.md` · FR-HRM-MD-BIND-E1A-01 · AC-E1A-BE-01 · WH/DEC/JP/HCP/CI | yes |
| SRS §16.4 | `docs/hrm/SRS.md` (pointer via delta) | yes |
| TechSpec | `docs/hrm/TECHSPEC.md` §11.4 / §14 / §17.6 Lane B ≠ FR-RC-01 | yes |
| DB_DESIGN | `docs/hrm/DB_DESIGN_HRM_MD_BIND_E1A.md` tables A–E | yes |
| API_DESIGN | `docs/hrm/API_DESIGN_HRM_MD_BIND_E1A.md` WH/DEC/JP/HCP/CI · mục đích + bước SRS | yes |
| SA ACK | `docs/qa/evidence/sa-erp-e1a-ack-01-20260728.md` · naming `position_key` ≠ `job_title_key` | yes |

---

## 2. Implementation summary

| Surface | Table | ensureSchema | Assert | Error codes |
|---------|-------|--------------|--------|-------------|
| **A WH** | `employee_work_timeline` | `position_key`, `department_key` + index | create required; update invent-only reject | `HRM-WH-POS-KEY` / `HRM-WH-DEPT-KEY` |
| **B DEC** | `hr_decisions` | `position_key`, `signer_position_key` | create required; signer key when signer present; `decision_type` must_keep | `HRM-DEC-POS-KEY` / `HRM-DEC-SIGNER-POS-KEY` / `HRM-DEC-TYPE` |
| **C JP** | `job_postings` | `position_key`, `department_key` | create required; invent-only reject | `HRM-JP-POS-KEY` |
| **D HCP** | `headcount_proposals` | `position_key`, `department_key` | create required | `HRM-HCP-POS-KEY` |
| **E CI** | `employee_contracts` | position/signer snapshots + keys | create required; signer key when signer present | `HRM-CON-POS-KEY` / `HRM-CON-SIGNER-POS-KEY` |

**Helper:** `SettingsCatalogsService.assertCodeInEffectiveCatalog(..., catalogKey: 'job_titles')` — same family as `employees.job_title_key` / JD `position_code`.

**Denorm:** when snapshot label omitted → fill from catalog `label`.

---

## 3. must_keep verified

| Island | Status |
|--------|--------|
| `employees.job_title_key` / `HRM-EMP-JOB-TITLE` | untouched |
| JD `position_code` / `HRM-REC-JD-POS` | regression test green in E1-A suite |
| Decisions `decision_type` / `HRM-DEC-TYPE` | kept + re-assert on PATCH |
| Leave catalog assert | untouched |
| Lane B ≠ FR-RC-01 (`job_requisitions` SoT) | CODE-MEMORY + no rebind |
| A9 Candidate | **deferred** (SA residual R-E1A-A9-CAND) |
| U65 no seed | jest mocks only |
| HOLD_DEPLOY | no deploy this WI |

---

## 4. Files touched (apps)

- `apps/api/hrm-api/src/employees/employee-profile.service.ts`
- `apps/api/hrm-api/src/decisions/decisions.service.ts`
- `apps/api/hrm-api/src/decisions/dto/create-decision.dto.ts`
- `apps/api/hrm-api/src/recruitment/recruitment-catalog.service.ts`
- `apps/api/hrm-api/src/recruitment/dto/create-job-posting.dto.ts`
- `apps/api/hrm-api/src/contracts-insurance/contracts-insurance.service.ts`
- `apps/api/hrm-api/src/contracts-insurance/dto/create-contract.dto.ts`
- `apps/api/hrm-api/src/contracts-insurance/dto/update-contract.dto.ts`
- Specs: `be-erp-e1a-pos-key-01.spec.ts` + CI/DEC controller/service fixture `position_key`

---

## 5. Jest evidence

```text
pnpm exec jest --runInBand \
  src/be-erp-e1a-pos-key-01.spec.ts \
  src/decisions/decisions.service.spec.ts \
  src/contracts-insurance/contracts-insurance.service.spec.ts \
  src/contracts-insurance/contracts-insurance.controller.spec.ts \
  src/recruitment/be-hrm-settings-md-jt-01.spec.ts

Test Suites: 5 passed, 5 total
Tests:       63 passed, 63 total
```

---

## 6. Residual / defer

| ID | Note | Owner |
|----|------|-------|
| **R-E1A-A9-CAND** | Candidate `position_key` not in this BE slice | PM defer / ba-data APPEND |
| **R-E1A-DEPT-P1** | `department_key` assert when FE sends — shipped soft; deepen optional | FE wave / follow-on |
| **R-E1A-A8-CTYPE** | contract_types harden | E2 |
| Legacy NULL keys | dual-read snapshot OK | backfill later |

---

## 7. Handoff

```yaml
work_item_id: D-BE-ERP-E1A-POS-KEY-01
from_role: dev-be
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/d-be-erp-e1a-pos-key-01-20260728.md
next_owner: qa
```

### next_dispatch_prompt (copy-ready)

```text
work_item_id: QA-ERP-E1A-POS-KEY-01
from_role: pm
to_role: qa
lane: execution E1-A

entry_criteria:
  - D-BE-ERP-E1A-POS-KEY-01 READY_FOR_QA — docs/qa/evidence/d-be-erp-e1a-pos-key-01-20260728.md
  - L0 stack up (hrm-api :28001 + portal); U65 browser-only — cấm seed
  - FE D-FE-ERP-E1A-PICKER-01 in-flight or landed for WH/DEC/JP/HCP/CI pickers (if FE not ready: API contract probe only → ⬜ FE-blocked, not 🟢 UF)

read_first:
  - docs/program/deltas/BA_ERP_E1A_SRS_01_20260728.md (AC-E1A-* · A1–A8; defer A9)
  - docs/hrm/API_DESIGN_HRM_MD_BIND_E1A.md §11 error map
  - docs/qa/evidence/d-be-erp-e1a-pos-key-01-20260728.md

scope_UF (browser when FE ready):
  - WH: create timeline → Network body has position_key → 2xx → F5 label (AC-E1A-WH-01)
  - DEC: create with decision_type + position_key → HRM-DEC-201 → F5; unknown key → 400 HRM-DEC-POS-KEY
  - JP / HCP: position_key required; invent-only position → 400 HRM-JP-POS-KEY / HRM-HCP-POS-KEY
  - CI: create contract position_key → HRM-CON-201; signer_position_key when signer set
  - Regression must_keep: EmployeeForm job_title_key picker; Leave; JD position_code; decision_type; cấm FR-RC-01 claim on job_postings

exit_criteria:
  - Evidence browser blocks per qa-fe-outside-browser-gate (or explicit ⬜ FE-blocked with API 400 contract PASS)
  - Matrix / UF rows updated; ack_status PASS_TO_PM
  - No seed in evidence

evidence_path: docs/qa/evidence/qa-erp-e1a-pos-key-01-20260728.md
cấm: pnpm seed:* · invent catalog via API to fake picker · A9 Candidate claim
```
