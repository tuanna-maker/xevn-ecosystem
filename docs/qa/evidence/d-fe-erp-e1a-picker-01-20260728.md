# Evidence — D-FE-ERP-E1A-PICKER-01

| Field | Value |
|-------|--------|
| **work_item_id** | `D-FE-ERP-E1A-PICKER-01` |
| **role** | dev-fe |
| **date** | 2026-07-28 |
| **lane** | execution E1-A MD-BIND |
| **change_mode** | ADD |
| **ack_status** | **READY_FOR_QA** |
| **HOLD_DEPLOY** | yes |
| **U65** | no seed |

## spec_read_ack

| Artifact | Cite |
|----------|------|
| SRS delta | `docs/program/deltas/BA_ERP_E1A_SRS_01_20260728.md` · FR-HRM-MD-BIND-E1A-01 · AC-E1A-* |
| DB_DESIGN | `docs/hrm/DB_DESIGN_HRM_MD_BIND_E1A.md` |
| API_DESIGN | `docs/hrm/API_DESIGN_HRM_MD_BIND_E1A.md` · WH/DEC/JP/HCP/CI |
| SA ACK | `docs/qa/evidence/sa-erp-e1a-ack-01-20260728.md` |
| Program | `FIDELITY_PROGRAM_DISPATCH` Cohort E1-A |

## Closed scope

| Screen | UI bind | Network body | U72 display |
|--------|---------|--------------|-------------|
| **A1/A2 Work History** = `EmployeeWorkTimeline` (live profile tab) | CatalogSearchPicker `position_key` + `department_key` | POST/PATCH sends `position_key` + snapshot `position`; optional `department_key` | list via `resolvePositionDisplayLabel` / `resolveDepartmentLabel` |
| **A3 Decisions position** | CatalogSearchPicker position + signer_position + department | `position_key` / `signer_position_key` / `department_key` + snapshots | view dialog labels |
| **A5 Job Postings** | CatalogSearchPicker position + department | `position_key` + `department_key` + snapshots | list/grid/detail |
| **A6 Headcount** | CatalogSearchPicker position + department | `position_key` + `position_name` snapshot; `department_key` + `department` | table + view |
| **A7 EmployeeContracts** | CatalogSearchPicker position + dept + signer_position | create/update pass `*_key` (+ snapshots) | — |

### Shared helpers (`catalogSearchPicker.ts`)

- `buildPositionKeyFields` / `buildDepartmentKeyFields`
- `resolvePositionDisplayLabel` / `resolveDepartmentLabel`
- Vitest: **22/22** `catalogSearchPicker.test.ts` (+ E1-A cases)
- `useEmployeeContracts.test.ts` **2/2**
- `tsc --noEmit` apps/web/hrm: **exit 0**

### API types (`hrmApi.ts`)

ADD optional `position_key` / `department_key` / `signer_position_key` on decisions, job postings, contracts create/update/row types.

## must_keep (not touched / regression)

| Island | Status |
|--------|--------|
| EmployeeFormDialog JT/dept CatalogSearchPicker | **untouched** |
| LeaveTab leave_types | **untouched** |
| JobTemplates position_code | **untouched** |
| JobRequisitions JD+dept | **untouched** |
| Decisions `decision_type` picker | **kept** (E1-B alias merge intact) |
| A9 Candidate | **deferred** (R-E1A-A9-CAND) |
| U65 / HOLD_DEPLOY | **kept** |

## Residual

| ID | Note | Owner |
|----|------|-------|
| R-E1A-A9-CAND | CandidateForm position picker out of scope | follow-on WI |
| R-E1A-A8-CTYPE | contract_types HARDCODE → catalog bind | E2 |
| R-E1A-WH-ORPHAN | `EmployeeWorkHistory.tsx` local-only (not mounted in Profile); live path = WorkTimeline | optional cleanup |
| R-E1A-BE | FE sends keys; BE assert/ensureSchema = `D-BE-ERP-E1A-POS-KEY-01` parallel | QA after BE |

## QA entry (browser — U65)

Persona: `ceo@xe.vn` / stack L0. For each screen: open form → pick catalog Vị trí → Lưu → DevTools Network body has `position_key` (code) not label-only → F5 label VI. Empty catalog → empty CTA Settings (no invent). Regression: Employee create JT/dept + Leave + JobTemplates still picker.

## Handoff

```yaml
work_item_id: D-FE-ERP-E1A-PICKER-01
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/d-fe-erp-e1a-picker-01-20260728.md
next_owner: qa
```
