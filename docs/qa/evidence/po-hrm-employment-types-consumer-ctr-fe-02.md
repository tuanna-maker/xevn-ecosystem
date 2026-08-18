# Evidence — PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-FE-02-HARNESS-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-FE-02-HARNESS-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-08-11 |
| **ack_status** | **READY_FOR_QA** → `QA-PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-01-RETEST-03` |
| **spec_ref** | `BA-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-01` · AC-SET-CONSUMER-ET-CTR-01 |
| **must_keep** | QACONPAYSTQC1 · employment_types picker FE-01 |

## Root cause (edit F5)

`ContractCreateWizardDialog` reset `extra` to `initialWizardExtraFields` on every Sửa — **không** map `editingContract.work_arrangement` → picker luôn «Chọn hình thức» sau F5 dù PATCH thành công.

## Fix (FE)

| Change | Path |
|--------|------|
| `wizardExtraFieldsFromEditingContract` + `parseContractWizardDate` | `apps/web/hrm/src/lib/contractCreateWizardState.ts` |
| Hydrate `extra` + `subject_type=employee` on edit open | `ContractCreateWizardDialog.tsx` |
| `searchPlacement="inline"` on WA picker (CC iframe harness) | `ContractCreateStep1GeneralGrid.tsx` |
| Mutate probe aligned (auth, stepper, NV001-HD PATCH leg) | `scripts/qa/_tmp-qa-po-hrm-employment-types-consumer-ctr-mutate-probe.mjs` |

## Verification

| Check | Result |
|-------|--------|
| `pnpm exec vitest run apps/web/hrm/src/lib/contractCreateWizard.source.test.ts` | **15/15 PASS** |
| Mutate probe (local stack) | **exit 1** — `patchStatus: 400` · body `work_arrangement` = selected `*emp` code (FE bind OK) |

## Residual (P0 — dev-be, not FE)

BE `assertWorkArrangementCode` still validates against settings catalog key **`work_arrangements`**, while FE picker posts **`employmentTypeKey`** from GET `/employees/employment-types/effective` per AC-SET-CONSUMER-ET-CTR-01.

- Error class: `HRM-CTR-WORK-FORM-400` — code not in `work_arrangements`
- File: `apps/api/hrm-api/src/contracts-insurance/contracts-insurance.service.ts` (`assertWorkArrangementCode` / `resolveWorkFormLabelVi`)
- **QA retest FE:** parity 15/15 + edit hydrate label **before** save; **mutate 2xx + F5** blocked until BE accepts EMP effective keys (or dual-catalog bridge per BA §6.2)

## QA entry (U65)

- Persona: `ceo@xe.vn` / `companyId=main`
- URL: `http://127.0.0.1:5173/command-center/hrm/contracts`
- **Parity:** harness `_tmp-qa-po-hrm-employment-types-consumer-ctr-01.mjs`
- **Mutate:** NV001-HD → Sửa → `ctr-create-work-arrangement` → Lưu → F5 → Sửa (expect catalog label if PATCH 2xx)
- **Create REC-400:** unchanged pilot policy — not ET mapping defect

## completion_report

**Closed:** Edit wizard hydrates `work_arrangement` / signing / ratio; inline WA picker; vitest 15; mutate probe harness parity with main script.

**Open:** PATCH 2xx for `*emp` codes requires BE catalog assert alignment (residual above).

## next_owner

`qa` (narrow FE hydrate + parity) · then `dev-be` if mutate still 400.

## next_dispatch_prompt

```text
work_item_id: QA-PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-01-RETEST-03
role: qa
read_first: docs/qa/evidence/po-hrm-employment-types-consumer-ctr-fe-02.md
entry_criteria: L0 exit 0; FE-02 merged locally
exit_criteria: U65 — parity 15/15; NV001-HD Sửa shows persisted WA label after F5 when PATCH 2xx; if PATCH 400 HRM-CTR-WORK-FORM-400 with *emp code → FAIL_TO_PM dispatch dev-be PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-BE-01 (assert employment_types EFF not work_arrangements only)
evidence_path: docs/qa/evidence/qa-po-hrm-employment-types-consumer-ctr-01.md
cấm: seed; UF-HRM-10 full claim
```
