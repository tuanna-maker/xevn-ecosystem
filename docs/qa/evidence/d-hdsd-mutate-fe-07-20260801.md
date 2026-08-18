# D-HDSD-MUTATE-FE-07 — Contract date open prefill + YCTD sync hydrate

**work_item_id:** `D-HDSD-MUTATE-FE-07`  
**Program:** `P-HDSD-QA-SRS-01` · BF-03  
**Date:** 2026-08-01  
**Owner:** dev-fe  
**ack_status:** `READY_FOR_QA`  
**Prior QA:** `docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r4-20260801.md` (FAIL_TO_PM)

## spec_read_ack

- **srs:** UF-HRM-05 (HĐ create POST + hidden date fields) · UF-HRM-07 (YCTD JD/dept hydrate + form-ready)
- **tech_spec:** `contractEndDatePolicy` G-CI-01 · `CatalogSearchPicker` · `useJobTemplates` scope
- **change_mode:** FIX · **preserve_default:** TC-HDSD-08-02-01 🟢 · TC-HDSD-04/05/10 regression

## Root cause → fix map

| TC | Symptom (QA R4) | Root cause | Fix |
|----|-----------------|------------|-----|
| TC-HDSD-06-02-01 | `hdsd-contracts-form-ready` timeout · no POST | Empty `contract_type` + hidden date columns → `validateContractDatesForSubmit` treats '' as fixed-term requiring expiry; date effect blocked until type loads | `ensureContractCreateDates` + `resolveContractTypeForDatePolicy` on dialog open, form-ready gate, and submit payload |
| TC-HDSD-07-02-01 | `hdsd-requisition-form-ready` timeout · job-templates storm | Async `applyTemplate` after open + refetch loop; dept empty when catalog/position_name null | `handleOpenCreate` + `buildRequisitionCreateFormDefaults` sync reset; in-flight guard + mount-only fetch in `useJobTemplates`; dept fallback chain catalog → position_code/name → OU |

## Files touched

| File | Change |
|------|--------|
| `apps/web/hrm/src/lib/contractEndDatePolicy.ts` | `resolveContractTypeForDatePolicy`, `ensureContractCreateDates` |
| `apps/web/hrm/src/lib/contractEndDatePolicy.test.ts` | Unit tests for new helpers |
| `apps/web/hrm/src/pages/Contracts.tsx` | Open/submit date prefill; form-ready uses resolved type |
| `apps/web/hrm/src/lib/jobRequisitionUi.ts` | `buildRequisitionCreateFormDefaults` |
| `apps/web/hrm/src/lib/jobRequisitionUi.test.ts` | Defaults + source contract tests |
| `apps/web/hrm/src/hooks/useJobTemplates.ts` | In-flight guard; mount fetch keyed by companyId only |
| `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx` | `handleOpenCreate` sync hydrate; OU/position_code dept fallback |

**Not modified:** Leave overview (TC-HDSD-08-02-01) · Employees · workflow · internal_services.

## Regression

```text
apps/web/hrm:
  pnpm exec vitest run src/lib/contractEndDatePolicy.test.ts src/lib/hdsdMutateTestIds.test.ts src/lib/jobRequisitionUi.test.ts → 29/29 PASS
```

## QA retest (U65 browser · portal :5173)

**Prerequisite:** Restart HRM embed `:8080` before retest.

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `company_id=main`

1. **TC-HDSD-06-02-01:** `/hr/contracts` → `#hdsd-contracts-create-btn` → wait `hdsd-contracts-form-ready` (≤22s) → `#hdsd-contracts-form-submit` → **POST contract 2xx** → F5
2. **TC-HDSD-07-02-01:** JD library row exists → `/hr/recruitment?tab=requisitions` → `#hdsd-requisition-create-btn` → wait `hdsd-requisition-form-ready` → Lưu → **POST requisition 2xx** → F5
3. **TC-HDSD-08-02-01:** leave POST + F5 overview marker (regression 🟢)
4. **Regression:** TC-HDSD-05-03-01 · TC-HDSD-04-02-01 · TC-HDSD-10-04-01

## completion_report

**Closed:** R-QA-HD-DATE-PREFILL-03 (date prefill on dialog open + submit parity); R-QA-YCTD-CATALOG-PICKER-03 (sync applyTemplate on create open + refetch storm stop).

**Residual:** None in FE scope — QA RET-03-HRM-R5 browser harness.

## next_owner

qa

## next_dispatch_prompt

```
work_item_id: QA-HDSD-MUTATE-RET-03-HRM-R5
from_role: dev-fe | to_role: qa
program: P-HDSD-QA-SRS-01
entry_criteria: docs/qa/evidence/d-hdsd-mutate-fe-07-20260801.md READY_FOR_QA; restart HRM embed :8080; portal :5173; L0 exit 0; U65 zero-seed
exit_criteria: TC-HDSD-06-02-01 + 07-02-01 POST 2xx + F5/form-ready within 22s; TC-HDSD-08-02-01 🟢 preserved; regression 05+04+10 🟢; evidence docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r5-20260801.md
UF/J-*: UF-HRM-05, UF-HRM-07, UF-HRM-09
cấm: seed; probe-only PASS
ack_status: PASS_TO_PM or FAIL_TO_PM
pm_dispatch_hint: verify job-templates GET count stable (no storm) during TC-HDSD-07-02-01
```

## evidence_path

`docs/qa/evidence/d-hdsd-mutate-fe-07-20260801.md`

## ack_status

**READY_FOR_QA**
