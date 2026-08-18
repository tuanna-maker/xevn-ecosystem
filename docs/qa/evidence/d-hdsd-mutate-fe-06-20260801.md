# D-HDSD-MUTATE-FE-06 — Contract date POST gate + YCTD catalog hydrate parity

**work_item_id:** `D-HDSD-MUTATE-FE-06`  
**Program:** `P-HDSD-QA-SRS-01` · BF-03  
**Date:** 2026-08-01  
**Owner:** dev-fe  
**ack_status:** `READY_FOR_QA`  
**Prior QA:** `docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r3-20260801.md` (FAIL_TO_PM)

## spec_read_ack

- **srs:** UF-HRM-05 (HĐ create POST) · UF-HRM-07 (YCTD JD/dept hydrate + form-ready)
- **tech_spec:** `contractEndDatePolicy` G-CI-01 · CatalogSearchPicker · `useJobTemplates` scope
- **change_mode:** FIX · **preserve_default:** TC-HDSD-08-02-01 🟢 · TC-HDSD-05/04/10 regression

## Root cause → fix map

| TC | Symptom (QA R3) | Root cause | Fix |
|----|-----------------|------------|-----|
| TC-HDSD-06-02-01 | `form-ready` true · toast thiếu ngày · no POST | Date prefill + `isCreateFormReady` skipped when `activeFormFields` omits date columns; `createContract` always validates dates | Always prefill `effective_date`/`expiry_date` on type change; `isCreateFormReady` always runs `validateContractDatesForSubmit` |
| TC-HDSD-07-02-01 | JD/dept picker empty · `hdsd-requisition-form-ready` absent | Tab switch remounts hook; refetch wiped templates; dept catalog empty in pilot | Prefetch JD at `Recruitment.tsx`; preserve template cache in `useJobTemplates`; `requisitionDepartmentPickerOptions` + OU/requisition fallback; stable `applyTemplate` auto-pick |

## Files touched

| File | Change |
|------|--------|
| `apps/web/hrm/src/pages/Contracts.tsx` | Date prefill + form-ready aligned with `createContract` gate |
| `apps/web/hrm/src/hooks/useJobTemplates.ts` | Do not wipe templates on transient scope miss |
| `apps/web/hrm/src/pages/Recruitment.tsx` | Page-level `useJobTemplates` → pass to requisitions tab |
| `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx` | Prefetched templates props; dept fallback; conditional refetch; `useCallback` applyTemplate |
| `apps/web/hrm/src/lib/jobRequisitionUi.ts` | `requisitionDepartmentPickerOptions` helper |
| `apps/web/hrm/src/lib/jobRequisitionUi.test.ts` | Fallback helper unit test |

**Not modified:** Leave overview (TC-HDSD-08-02-01) · Employees · workflow · internal_services.

## Regression

```text
apps/web/hrm:
  pnpm exec vitest run src/lib/contractEndDatePolicy.test.ts src/lib/hdsdMutateTestIds.test.ts src/lib/jobRequisitionUi.test.ts → 26/26 PASS
```

## QA retest (U65 browser · portal :5173)

**Prerequisite:** Restart HRM embed `:8080` (`pnpm dev` in `apps/web/hrm`) before retest — stale bundle blocked FE-05.

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `company_id=main`

1. **TC-HDSD-06-02-01:** `/hr/contracts` → `#hdsd-contracts-create-btn` → wait `hdsd-contracts-form-ready` → `#hdsd-contracts-form-submit` → **POST contract 2xx** → F5
2. **TC-HDSD-07-02-01:** JD library row exists → `/hr/recruitment?tab=requisitions` → `#hdsd-requisition-create-btn` → wait `hdsd-requisition-form-ready` → Lưu → **POST requisition 2xx**
3. **TC-HDSD-08-02-01:** leave POST + F5 overview marker (regression 🟢)
4. **Regression:** TC-HDSD-05-03-01 · TC-HDSD-04-02-01 · TC-HDSD-10-04-01

## completion_report

**Closed:** R-QA-HD-DATE-PREFILL-02 (hidden date fields + POST gate parity); R-QA-YCTD-CATALOG-PICKER-02 (JD prefetch across tab switch + dept hydrate fallback).

**Residual:** None in FE scope — QA RET-03-HRM-R4 browser harness.

## next_owner

qa

## next_dispatch_prompt

```
work_item_id: QA-HDSD-MUTATE-RET-03-HRM-R4
from_role: dev-fe | to_role: qa
program: P-HDSD-QA-SRS-01
entry_criteria: docs/qa/evidence/d-hdsd-mutate-fe-06-20260801.md READY_FOR_QA; restart HRM embed :8080; portal :5173; L0 exit 0; U65 zero-seed
exit_criteria: TC-HDSD-06-02-01 + 07-02-01 POST 2xx + F5/form-ready; TC-HDSD-08-02-01 🟢 preserved; regression 05+04+10 🟢; evidence docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r4-20260801.md
UF/J-*: UF-HRM-05, UF-HRM-07, UF-HRM-09
cấm: seed; probe-only PASS
ack_status: PASS_TO_PM or FAIL_TO_PM
pm_dispatch_hint: wait hdsd-contracts-form-ready and hdsd-requisition-form-ready before submit
```

## evidence_path

`docs/qa/evidence/d-hdsd-mutate-fe-06-20260801.md`

## ack_status

**READY_FOR_QA**
