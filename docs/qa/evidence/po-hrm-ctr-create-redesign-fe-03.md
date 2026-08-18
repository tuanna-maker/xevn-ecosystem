# FE evidence — CTR create redesign FE-03

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-CTR-CREATE-REDESIGN-FE-03` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **ack_status** | `READY_FOR_QA` |
| **date** | 2026-08-10 |
| **honesty** | `contracts_printable_ready=false` · **C-SLICE-≠-MODULE** |

## spec_read_ack

- **srs:** `docs/program/specs/PO-HRM-CTR-CREATE-REDESIGN-BA-02.md` §2–§4 · FR-UC-BP-CORE-09a · AC-CTR-UX-06/07 · FIELD-01..05 · SUBJECT-01..03 · DND-01/02 · CATALOG-01
- **tech_spec:** `docs/ecosystem/TECHSPEC.md` §4.1 (parent portal overlay)
- **db_design:** `docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md` §12 delta (SA-02) — cite columns `signed_at`, `work_arrangement`, `salary_ratio_percent`, `contract_abstract`, `candidate_id`, `subject_type`
- **api_design:** `POST /api/hrm/contracts-insurance/contracts` — FE sends `signed_at`, `work_arrangement`, `salary_ratio_percent`, `contract_abstract`, `subject_type`, `candidate_id` / `employee_id` per mode
- **sponsor_confirm:** BA-02 CONFIRM 2026-08-10 · SA-02 Option A LOCK

## Closed (FE scope)

| Item | Implementation |
|------|----------------|
| Portal Option A | `Contracts.tsx` create `DialogContent` — **no** `portalScope="iframe"` · `data-hrm-dialog-portal="parent"` · `w-[min(90vw,96rem)]` · `max-h-[90vh]` |
| DnD Path A | Wizard + `ContractCreateStep2ClausePreview` remain inside portaled dialog; `DragDropContext` descendant of dialog |
| Q3-B Tên HĐ | Read-only `deriveContractDisplayName` · `ctr-create-contract-name-readonly` |
| Q4 Ngày ký | Required GĐ1 (non registry-only) · `ctr-create-signing-date` |
| Q5 LV + % | `ctr-create-work-arrangement` · `ctr-create-salary-ratio` (0–100, no thousand group) |
| Q6 UV/NV | Tabs `ctr-create-subject-tab-*` · `CatalogSearchPicker` UV/NV · default **Ứng viên** · no auto-prefill first NV |
| Q7–8 Gỡ | Canvas «Gỡ» · confirm when `clause.mandatory` |
| Q9 C&B | Single read-only C&B card — removed `ContractAllowancesSubGrid` from step 1 |
| Q10 Trích yếu | `ctr-create-abstract` → `contract_abstract` on POST |
| Q12 | Unchanged active template picker (`listContractTemplates` status active) — probation templates in catalog |

## Tests run

```text
pnpm exec vitest run src/lib/contractCreateWizard.source.test.ts src/lib/contractCreatePayload.test.ts
exit 0 (13 tests)
```

## QA entry (U65 · mandatory)

| Field | Value |
|-------|--------|
| **URL** | `http://localhost:5173/command-center/hrm/contracts` (or `:8088` same path) |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` |
| **J-*** | J-HRM-CTR-CREATE-01..03 · **DnD PASS only on CC URL** (not `/hr/contracts?portal=1` alone) |
| **UF** | AC-CTR-UX-06 · UX-07 · FIELD-01..05 · SUBJECT-01..03 · DND-01/02 · CATALOG-01 |

## Residual / not promoted

| ID | Note | Owner |
|----|------|--------|
| **G-CTR-SUBJ-01** | POST «chỉ UV» needs BE nullable `employee_id` + `candidate_id` persist — FE payload ready; **employee** path works on current BE | `PO-HRM-CTR-CREATE-REDESIGN-BE-SUBJ-01` |
| **Print/PDF** | No claim printable module UAT | QA scope only |
| **Browser** | No live DnD screenshot in this seat — QA-03 on CC | qa |

## Files touched

- `apps/web/hrm/src/pages/Contracts.tsx`
- `apps/web/hrm/src/components/contracts/ContractCreateWizardDialog.tsx`
- `apps/web/hrm/src/components/contracts/ContractCreateStep1GeneralGrid.tsx`
- `apps/web/hrm/src/components/contracts/ContractCreateStep2ClausePreview.tsx`
- `apps/web/hrm/src/lib/contractCreateWizardState.ts`
- `apps/web/hrm/src/lib/contractCreateDisplayName.ts`
- `apps/web/hrm/src/integrations/hrmApi.ts` (create/PATCH field expand)
- `apps/web/hrm/src/lib/contractCreateWizard.source.test.ts`
