# Evidence — PO-HRM-CTR-WORKSPACE-G4-SUBJECT-REC-NV-FIRST-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-G4-SUBJECT-REC-NV-FIRST-01` |
| **role** | `dev-be` |
| **upstream_qa** | `docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-create-start-date-retest-01.md` § DEF-CTR-G4-SUBJECT-REC-400 |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `contracts_printable_ready=false` |

---

## spec_read_ack

| Artifact | Path / section |
|----------|----------------|
| **srs** | `docs/program/specs/PO-HRM-CTR-WORKSPACE-NV-FIRST-BA-03.md` §3–§4 · AC-CTR-SUBJECT-02 · BR-CTR-CREATE-06/08 AMEND |
| **tech_spec** | `docs/hrm/TECHSPEC.md` §14.2 (contracts create) |
| **db_design** | `docs/hrm/DB_DESIGN_HRM.md` · `employee_contracts.candidate_id` nullable · `subject_type` |
| **api_design** | `docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md` · POST create subject bindings |
| **sponsor_confirm** | BA-03 NV-first G1-1 · 2026-08-11 |

**Policy resolution (BA-02 vs BA-03):** BA-03 **AMEND** BR-CTR-CREATE-08 — REC trace là banner/UV context, **không** chặn NV-first `subject_type=employee` khi `employee_id` hợp lệ. Không `PASS_TO_BA` spec_gap.

---

## Root cause

`createContract` gọi `assertEmployeeRecTrace` khi `subject_type === 'employee'`, yêu cầu row `recruitment_candidates.employee_id` — pilot NV (NV101) có `candidate_id: null` trên employee → **400** `HRM-CTR-SUBJECT-REC-400`, chặn Step2 wizard.

## Fix

| File | Change |
|------|--------|
| `apps/api/hrm-api/src/contracts-insurance/contracts-insurance.service.ts` | Xóa `assertEmployeeRecTrace` và lời gọi trong `createContract` employee branch |
| `po-hrm-ctr-create-redesign-be-subj-01.spec.ts` | Đổi test: legacy NV không REC trace → **2xx** |
| `po-hrm-ctr-workspace-g4-subject-rec-nv-first-01.spec.ts` | **ADD** — NV101 wizard payload + UV path regression |

**must_keep:** `assertCandidateInScope` cho `subject_type=candidate`; G-CI-01 `end_date`; `resolveContractStartDateForCreate`; scope parity list/get.

**Constant `HRM_CTR_SUBJECT_REC_400`:** giữ export (API doc) — không còn throw từ create; FE có thể dùng `employee.candidate_id` cho banner BR-CTR-CREATE-08.

---

## Verification

| Command | Result |
|---------|--------|
| `npx jest po-hrm-ctr-workspace-g4-subject-rec-nv-first-01 po-hrm-ctr-workspace-g4-create-start-date-fix-01 po-hrm-ctr-create-redesign-be-subj-01` | **13/13 PASS** |
| `pnpm run build` (hrm-api) | **PASS** |

### Jest coverage (new spec)

1. NV-first `subject_type=employee` + `employee_id` (NV101 UUID) → INSERT `employee` / no REC trace query
2. `subject_type=candidate` out of scope → `HRM-CTR-CANDIDATE-404`
3. `subject_type=candidate` missing `candidate_id` → `HRM-CTR-SUBJECT-400`

---

## QA handoff (browser U65)

Retest from prior QA click path:

- Persona `ceo@xe.vn` · CC `…/command-center/hrm/contracts`
- Tạo HĐ → tab **Nhân viên** → **Le Van C — NV101** → Tiếp
- **Expect:** POST **2xx** (not `HRM-CTR-SUBJECT-REC-400`); Step2 opens
- Rows: **WS-G4-02**, **WS-G4-06**, **WS-G4-07**, **J-HRM-CTR-CREATE-01**

---

## completion_report

**Closed:** Removed REC→EMP trace gate on NV-first employee contract create; aligned BA-03 AC-CTR-SUBJECT-02; candidate path unchanged; jest 13/13; nest build PASS.

**Residual:** FE banner «Mở tuyển dụng» when `employee.candidate_id` null (BR-CTR-CREATE-08 UI) — dev-fe if not already; `contracts_printable_ready=false`; DEF-CTR-G4-EDIT-DEEPLINK-P1 orthogonal.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CTR-WORKSPACE-G4-SUBJECT-REC-NV-FIRST-01
role: qa
read_first:
  - docs/qa/evidence/po-hrm-ctr-workspace-be-subject-rec-nv-first-01.md
  - docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-create-start-date-retest-01.md (prior FAIL matrix)
entry_criteria: dev-be READY_FOR_QA; hrm-api build + jest PASS; L0 stack up
exit_criteria: U65 browser NV-first Step1→Tiếp POST 2xx on NV101; WS-G4-02/06/07; J-HRM-CTR-CREATE-01; FE Step2 visible; F5 row after full save; no HRM-CTR-SUBJECT-REC-400
cấm: seed; probe-only PASS
evidence_path: docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-subject-rec-nv-first-retest-01.md
ack_status: PASS_TO_PM | FAIL_TO_PM
```
