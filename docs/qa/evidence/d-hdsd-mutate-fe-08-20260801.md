# D-HDSD-MUTATE-FE-08 — Contract POST position_key + YCTD dept hydrate

**work_item_id:** `D-HDSD-MUTATE-FE-08`  
**Program:** `P-HDSD-QA-SRS-01` · BF-03  
**Date:** 2026-08-01  
**Owner:** dev-fe  
**ack_status:** `READY_FOR_QA`  
**Prior QA:** `docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r5-20260801.md` (FAIL_TO_PM)

## spec_read_ack

- **srs:** UF-HRM-05 (HĐ create POST + E1-A position_key) · UF-HRM-07 (YCTD dept hydrate + form-ready)
- **tech_spec:** `CreateContractDto.position_key` required · `buildRequisitionCreateFormDefaults` · G-CI-01 dates
- **change_mode:** FIX · **preserve_default:** TC-HDSD-08-02-01 🟢 · FE-07 date prefill + job-templates refetch guard · regression 04/05/10

## Root cause → fix map

| TC | Symptom (QA R5) | Root cause | Fix |
|----|-----------------|------------|-----|
| TC-HDSD-06-02-01 | form-ready 🟢 · **POST 400** | `useContracts.createContract` omitted required `position_key` + `contract_code` on POST body | `resolveContractCreatePositionKey` (employee `job_title_key` → first `job_titles` catalog); gate `isCreateFormReady`; submit payload aligned with BE DTO |
| TC-HDSD-07-02-01 | `hdsd-requisition-form-ready` absent · dept empty | JD pre-selected on open skipped `applyTemplate`; pilot JD lacks dept catalog + position_name | `resolveRequisitionDepartmentDefault` (title/code/job-title label fallbacks); template hints in dept picker; dept backfill when `job_template_id` set but dept empty |

## Files touched

| File | Change |
|------|--------|
| `apps/web/hrm/src/lib/contractCreatePayload.ts` | **NEW** — `resolveContractCreatePositionKey` |
| `apps/web/hrm/src/lib/contractCreatePayload.test.ts` | **NEW** — unit tests |
| `apps/web/hrm/src/hooks/useContracts.ts` | POST includes `contract_code` + `position_key` + department |
| `apps/web/hrm/src/integrations/hrmApi.ts` | `createEmployeeContract` requires `position_key`; optional `contract_code` |
| `apps/web/hrm/src/pages/Contracts.tsx` | Position catalog resolve; form-ready + submit payload |
| `apps/web/hrm/src/lib/jobRequisitionUi.ts` | `resolveRequisitionDepartmentDefault`; expanded dept picker hints |
| `apps/web/hrm/src/lib/jobRequisitionUi.test.ts` | Tests for new dept resolver |
| `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx` | Job-title catalog lookup; dept backfill effects; applyTemplate when JD pre-set |

**Not modified:** Leave overview (TC-HDSD-08-02-01) · Employees · workflow · internal_services · `useJobTemplates` refetch guard (FE-07).

## Regression

```text
apps/web/hrm:
  pnpm exec vitest run src/lib/contractCreatePayload.test.ts src/lib/contractEndDatePolicy.test.ts src/lib/hdsdMutateTestIds.test.ts src/lib/jobRequisitionUi.test.ts → 34/34 PASS
  pnpm exec tsc -p tsconfig.json --noEmit → exit 0
```

## QA retest (U65 browser · portal :5173)

**Prerequisite:** Restart HRM embed `:8080` before retest.

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `company_id=main`

1. **TC-HDSD-06-02-01:** `/hr/contracts` → `#hdsd-contracts-create-btn` → wait `hdsd-contracts-form-ready` (≤22s) → `#hdsd-contracts-form-submit` → **POST `/api/hrm/contracts-insurance/contracts` 2xx** → F5
2. **TC-HDSD-07-02-01:** JD library row exists → `/hr/recruitment?tab=requisitions` → `#hdsd-requisition-create-btn` → wait `hdsd-requisition-form-ready` → Lưu → **POST requisition 2xx** → F5 · job-templates GET storm still 0
3. **TC-HDSD-08-02-01:** leave POST + F5 overview marker (regression 🟢)
4. **Regression:** TC-HDSD-05-03-01 · TC-HDSD-04-02-01 · TC-HDSD-10-04-01

## completion_report

**Closed:** R-QA-HD-POST-400-01 (FE layer — missing `position_key`/`contract_code` on create); R-QA-YCTD-DEPT-HYDRATE-04 (dept fallback + backfill when JD pre-selected).

**Residual:** If POST 400 persists with `HRM-CON-POS-KEY` after FE payload includes catalog `position_key`, coordinate `D-HDSD-MUTATE-BE-01` (catalog seed / assert parity).

## next_owner

qa

## next_dispatch_prompt

```
work_item_id: QA-HDSD-MUTATE-RET-03-HRM-R6
from_role: dev-fe | to_role: qa
program: P-HDSD-QA-SRS-01
entry_criteria: docs/qa/evidence/d-hdsd-mutate-fe-08-20260801.md READY_FOR_QA; restart HRM embed :8080; portal :5173; L0 exit 0; U65 zero-seed; after D-HDSD-MUTATE-BE-01 if dispatched
exit_criteria: TC-HDSD-06-02-01 + 07-02-01 POST 2xx + F5/form-ready within 22s; TC-HDSD-08-02-01 🟢 preserved; regression 05+04+10 🟢; evidence docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r6-20260801.md
UF/J-*: UF-HRM-05, UF-HRM-07, UF-HRM-09
cấm: seed; probe-only PASS
ack_status: PASS_TO_PM or FAIL_TO_PM
pm_dispatch_hint: capture 400 body if contract still fails — Network POST body must show position_key + contract_code
```

## evidence_path

`docs/qa/evidence/d-hdsd-mutate-fe-08-20260801.md`

## ack_status

**READY_FOR_QA**
