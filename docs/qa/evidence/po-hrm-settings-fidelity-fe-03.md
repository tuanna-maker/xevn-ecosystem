# PO-HRM-SETTINGS-FIDELITY-FE-03

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-SETTINGS-FIDELITY-FE-03` |
| **Fixes QA** | `PO-HRM-SETTINGS-FIDELITY-QA-02` stamp `SETFID02-MSMZGC71` defect UF-CTR-DEPT-CATALOG-PICKER |
| **Date** | 2026-08-10 |
| **ack_status** | **READY_FOR_QA** |

## Root cause

`Contracts.tsx` built `activeFormFields` from `hrm_contract_form_fields` effective items only, then forced `contract_code` + `employee_name`. When catalog was **partial** (≥1 active row, no `department`), `hasContractField('department')` was false → `ctr-create-department-picker` not mounted.

## Fix

1. `contractFormFieldResolver.ts` — `buildActiveContractFormFields`:
   - Empty catalog → full `DEFAULT_CONTRACT_FORM_FIELDS` (includes `department`).
   - Partial/active catalog → union configured rows + `REQUIRED_CONTRACT_FORM_FIELDS` (`contract_code`, `employee_name`, **`department`**).
2. `ContractCreateStep1GeneralGrid.tsx` — department `CatalogSearchPicker` uses `searchPlacement="inline"` so QA harness sees `ctr-create-department-picker-combobox` and `catalog-picker-option-*`.

## Files

- `apps/web/hrm/src/components/contracts/contractFormFieldResolver.ts` (new)
- `apps/web/hrm/src/components/contracts/contractFormFieldResolver.test.ts` (new)
- `apps/web/hrm/src/pages/Contracts.tsx`
- `apps/web/hrm/src/components/contracts/ContractCreateStep1GeneralGrid.tsx`
- `apps/web/hrm/src/lib/po-hrm-settings-catalog-consumer-audit-fe-01.test.ts` (source lock)

## Verify (agent)

```text
cd apps/web/hrm
pnpm exec vitest run src/components/contracts/contractFormFieldResolver.test.ts \
  src/lib/po-hrm-settings-catalog-consumer-audit-fe-01.test.ts \
  src/lib/contractCreateWizard.source.test.ts
```

**Result:** exit 0 (22 tests).

## QA re-run (browser — U65)

| Step | Expect |
|------|--------|
| Login `ceo@xe.vn` · `main` | — |
| `/command-center/hrm/contracts` → **Tạo HĐ** step 1 | `ctr-create-wizard-stepper` visible |
| Department row | `ctr-create-department-picker-combobox` in DOM |
| Open picker | ≥1 `catalog-picker-option-*` when departments catalog EFF |

**spec_ref:** UF-HRM-10 · consumer matrix `po-hrm-settings-catalog-consumer-audit-fe-01.md`

## completion_report

- **Closed:** Partial `hrm_contract_form_fields` no longer hides Phòng ban on contract create step 1; inline picker testids aligned with CC parent-portal QA.
- **Residual:** QA browser re-run `PO-HRM-SETTINGS-FIDELITY-QA-02` dept row; JD mutate slice still not in this WI.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-SETTINGS-FIDELITY-QA-02 (re-run dept leg)
role: qa
entry_criteria: PO-HRM-SETTINGS-FIDELITY-FE-03 READY_FOR_QA; evidence docs/qa/evidence/po-hrm-settings-fidelity-fe-03.md; stack L0 qc:fe-be-health exit 0
exit_criteria: UF-CTR-DEPT-CATALOG-PICKER 🟢 — step1 ctr-create-department-picker-combobox mounted; open picker → catalog-picker-option-*; re-stamp SETFID02 or SETFID02-RETRY with full PO-HRM-SETTINGS-FIDELITY-QA-02 scope dept row only if sponsor wants narrow retest
U65: zero seed · ceo@ :5173
evidence_path: docs/qa/evidence/po-hrm-settings-fidelity-qa-02.md (update)
```
