# PO-HRM-CTR-CREATE-REDESIGN-BE-SUBJ-01 — evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-CREATE-REDESIGN-BE-SUBJ-01` |
| **ack_status** | `READY_FOR_QA` |
| **date** | 2026-08-10 |
| **honesty** | `contracts_printable_ready=false` · C-SLICE |

## spec_read_ack

- **srs:** `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` · FR-UC-BP-CORE-09a · UF-HRM-02 · BA-02 §5 N2–N9
- **tech_spec:** `docs/program/specs/PO-HRM-CTR-CREATE-REDESIGN-SA-02.md` §4.1–§4.5
- **ba:** `docs/program/specs/PO-HRM-CTR-CREATE-REDESIGN-BA-02.md` §5
- **api_design:** `docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md` §12 (subject + GĐ1 EXPAND)
- **sa_lock:** G-CTR-SUBJ-01 **EXPAND-REGISTRY-01**

## Closed (BE)

| Item | Implementation |
|------|----------------|
| Schema | `employee_id` nullable; `candidate_id`, `requisition_id`, `subject_type`, `contract_abstract`; index `ix_employee_contracts_candidate` |
| DTO | `CreateContractDto` / `UpdateContractDto` — subject + aliases `signing_date`, `work_form`, `abstract`, `registry_only` |
| POST create | Candidate path (`employee_id` null); employee path **must_keep** legacy; GĐ1 validation when wizard fields present |
| Errors | `HRM-CTR-SIGN-REQ-400`, `HRM-CTR-SUBJECT-400`, `HRM-CTR-CANDIDATE-404`, `HRM-CTR-SUBJECT-REC-400`, `HRM-CTR-WORK-FORM-400`, `HRM-CTR-SALARY-RATIO-400` |
| GET list/get | `candidate_label`, `signing_date`, `work_form_label_vi`; JOIN `recruitment_candidates`; candidate-only rows visible |
| Scope parity | `ec.employee_id IS NULL OR ec.employee_id IN (workforce)` — list ↔ get-by-id same filter family |
| UF-HRM-02 | Legacy employee create without wizard fields unchanged |

## Verification

```bash
pnpm --filter hrm-api test -- po-hrm-ctr-create-redesign-be-subj-01.spec.ts
pnpm --filter hrm-api test -- contracts-insurance.service.spec.ts
pnpm --filter hrm-api test -- po-hrm-ctr-create-redesign-be-01.spec.ts
pnpm --filter hrm-api build
```

Exit **0** on 2026-08-10 run.

## Residual

- `work_arrangements` catalog physical key — soft-allow when catalog empty (R-CTR-CATALOG-WF)
- OpenAPI stub sync optional
- `contract-legal-print` preview for candidate-only contracts may still need FE context (FE-03)

## QA entry (U65)

- Coordinate with `PO-HRM-CTR-CREATE-REDESIGN-FE-03`
- Browser: tab **Ứng viên** → POST 201 → F5 list shows `candidate_label` + `contract_abstract`
- Employee regression: UF-HRM-02 create with `employee_id` only

## Handoff

| Field | Value |
|-------|--------|
| **next_owner** | `qa` (after FE-03 READY) · `dev-fe` parallel |
| **evidence_path** | `docs/qa/evidence/po-hrm-ctr-create-redesign-be-subj-01.md` |
