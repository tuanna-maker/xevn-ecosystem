# D-HDSD-MUTATE-FE-10 — Contract POST + YCTD form-ready

**work_item_id:** `D-HDSD-MUTATE-FE-10`  
**Program:** `P-HDSD-QA-SRS-01` · BF-03  
**Date:** 2026-08-01  
**Owner:** dev-fe  
**ack_status:** `READY_FOR_QA`  
**Prior QA:** `docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r7-20260801.md` (FAIL_TO_PM)

## spec_read_ack

- **srs:** UF-HRM-05 (HĐ create POST position_key+contract_code) · UF-HRM-07 (YCTD form-ready + POST) · UF-HRM-09 (leave — preserve 🟢)
- **tech_spec:** `contractCreatePayload` · `jobRequisitionUi` · `JobRequisitionsTab` template hydration
- **change_mode:** FIX · **preserve:** FE-09 leave/STAMP dates · FE-07 refetch guard · TC-HDSD-08-02-01 path

## Root cause → fix map

| TC | Symptom (QA R7) | Root cause | Fix |
|----|-----------------|------------|-----|
| TC-HDSD-06-02-01 | formReady 🟢 (3ms) · **no POST** | `resolveContractCreatePositionKey` returned null — pilot NV without `job_title_key` + empty position catalog → submit guard before API | Pass-through chain: catalog first row → department → `employee_code`; submit passes `departmentSnapshot` + `employeeCodeSnapshot` |
| TC-HDSD-07-02-01 | `hdsd-requisition-form-ready` timeout 22s | Parent `jobTemplates={[]}` blocked internal `useJobTemplates` (`prop === []` not `undefined`); RHF watch empty employment/headcount | Enable internal fetch when prop empty; refetch on open create; `isRequisitionCreateFormReady` defaults employment/headcount + title/code fallbacks |
| TC-HDSD-08-02-01 | 🟢 | — | **Untouched** (leave overlap + STAMP dates from FE-09) |

## Files touched

| File | Change |
|------|--------|
| `apps/web/hrm/src/lib/contractCreatePayload.ts` | Extended resolver: catalog → dept → employee_code; pass-through empKey only when catalog empty |
| `apps/web/hrm/src/lib/contractCreatePayload.test.ts` | +3 tests (pass-through, dept, employee_code) |
| `apps/web/hrm/src/pages/Contracts.tsx` | Submit passes department + employee_code to resolver; CODE-MEMORY FE-10 |
| `apps/web/hrm/src/lib/jobRequisitionUi.ts` | Form-ready: default employment/headcount; title/code/position_name fallbacks |
| `apps/web/hrm/src/lib/jobRequisitionUi.test.ts` | +1 test (code-only template); relaxed empty RHF watch case |
| `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx` | Internal template fetch when parent prop []; refetch on open if library empty |

## Regression

```text
apps/web/hrm:
  pnpm exec vitest run src/lib/contractCreatePayload.test.ts src/lib/contractEndDatePolicy.test.ts src/lib/hdsdMutateTestIds.test.ts src/lib/jobRequisitionUi.test.ts src/lib/leaveRequestDateWindow.test.ts → 42/42 PASS
  pnpm exec tsc -p tsconfig.json --noEmit → exit 0
```

## QA retest (U65 browser · portal :5173)

**Prerequisite:** Restart HRM embed `:8080` before retest.

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `company_id=main`

1. **TC-HDSD-06-02-01:** `/hr/contracts` → `#hdsd-contracts-create-btn` → `hdsd-contracts-form-ready` ≤22s → `#hdsd-contracts-form-submit` → **POST 2xx** with `position_key` + `contract_code` in body → F5
2. **TC-HDSD-07-02-01:** JD exists → `/hr/recruitment?tab=requisitions` → `#hdsd-requisition-create-btn` → `hdsd-requisition-form-ready` ≤22s → POST requisition 2xx → F5 · job-templates storm=0
3. **TC-HDSD-08-02-01:** leave POST **201** + F5 overview marker (preserve 🟢)
4. **Regression:** TC-HDSD-05-03-01 · TC-HDSD-04-02-01 · TC-HDSD-10-04-01

## completion_report

**Closed:** R-QA-HD-SUBMIT-NO-POST-R7 (contract position resolver null → POST blocked); R-QA-YCTD-FORMREADY-R7 (empty parent templates prop + RHF watch gaps).

**Residual:** If contract POST **400** with `position_key` present in Network body → `D-HDSD-MUTATE-BE-01`.

## next_owner

qa

## next_dispatch_prompt

```
work_item_id: QA-HDSD-MUTATE-RET-03-HRM-R8
from_role: dev-fe | to_role: qa
program: P-HDSD-QA-SRS-01 · BF-03
entry_criteria: docs/qa/evidence/d-hdsd-mutate-fe-10-20260801.md READY_FOR_QA; restart HRM embed :8080; portal :5173; L0 exit 0; U65 zero-seed
exit_criteria: TC-HDSD-06-02-01 form-ready ≤22s → POST contract 2xx + Network body position_key + contract_code + F5; TC-HDSD-07-02-01 form-ready → POST requisition 2xx + F5; TC-HDSD-08-02-01 🟢 POST 201 + F5 marker; regression 05+04+10 🟢; evidence docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r8-20260801.md
UF/J-*: UF-HRM-05, UF-HRM-07, UF-HRM-09
cấm: seed; probe-only PASS
ack_status: PASS_TO_PM or FAIL_TO_PM
pm_dispatch_hint: if POST 400 with position_key in body → D-HDSD-MUTATE-BE-01; QC BF-03 blocked until R8 PASS
```

## evidence_path

`docs/qa/evidence/d-hdsd-mutate-fe-10-20260801.md`

## ack_status

**READY_FOR_QA**
