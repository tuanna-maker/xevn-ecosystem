# D-HDSD-MUTATE-FE-09 — Form-ready regression + leave overlap

**work_item_id:** `D-HDSD-MUTATE-FE-09`  
**Program:** `P-HDSD-QA-SRS-01` · BF-03  
**Date:** 2026-08-01  
**Owner:** dev-fe  
**ack_status:** `READY_FOR_QA`  
**Prior QA:** `docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r6-20260801.md` (FAIL_TO_PM)

## spec_read_ack

- **srs:** UF-HRM-05 (HĐ create) · UF-HRM-07 (YCTD) · UF-HRM-09 (leave POST + F5 overview)
- **tech_spec:** `contractCreatePayload` · `jobRequisitionUi` · leave overlap guard
- **change_mode:** FIX · **preserve:** FE-07 date prefill + refetch guard · BE-01 position_key on wire at submit

## Root cause → fix map

| TC | Symptom (QA R6) | Root cause | Fix |
|----|-----------------|------------|-----|
| TC-HDSD-06-02-01 | formReady R5 true → R6 false 22s | FE-08 gated `hdsd-contracts-form-ready` on `position_key` catalog load | Remove position gate from `isCreateFormReady`; keep `resolveContractCreatePositionKey` on submit only |
| TC-HDSD-07-02-01 | `hdsd-requisition-form-ready` absent | RHF `watch` empty dept/title while pilot JD exists in `templates[0]` | `isRequisitionCreateFormReady` — sync fallback title/dept from template + resolver |
| TC-HDSD-08-02-01 | POST 409 overlap 2027-05-05..07 | Harness `pickLeaveWindow` collided with prior U65 rows | `pickNonOverlappingLeaveWindow` FE prefill + STAMP-hash harness dates |

## Files touched

| File | Change |
|------|--------|
| `apps/web/hrm/src/pages/Contracts.tsx` | Form-ready: dates/employee/type only; position at submit |
| `apps/web/hrm/src/lib/jobRequisitionUi.ts` | **NEW** `isRequisitionCreateFormReady` |
| `apps/web/hrm/src/lib/jobRequisitionUi.test.ts` | Tests for template fallback readiness |
| `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx` | Use `isRequisitionCreateFormReady` |
| `apps/web/hrm/src/lib/leaveRequestDateWindow.ts` | **NEW** — overlap-aware date picker |
| `apps/web/hrm/src/lib/leaveRequestDateWindow.test.ts` | **NEW** — unit tests |
| `apps/web/hrm/src/components/attendance/LeaveTab.tsx` | Prefill unique dates on create open |
| `scripts/qa/qa-hdsd-mutate-ret-03-hrm-r6-browser.mjs` | `pickLeaveWindow(stamp)` STAMP-hash spread |

## Regression

```text
apps/web/hrm:
  pnpm exec vitest run src/lib/contractCreatePayload.test.ts src/lib/contractEndDatePolicy.test.ts src/lib/hdsdMutateTestIds.test.ts src/lib/jobRequisitionUi.test.ts src/lib/leaveRequestDateWindow.test.ts → 38/38 PASS
  pnpm exec tsc -p tsconfig.json --noEmit → exit 0
```

## QA retest (U65 browser · portal :5173)

**Prerequisite:** Restart HRM embed `:8080` before retest.

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `company_id=main`

1. **TC-HDSD-06-02-01:** `/hr/contracts` → `#hdsd-contracts-create-btn` → `hdsd-contracts-form-ready` ≤22s → submit → **POST 2xx** with `position_key` + `contract_code` in body → F5
2. **TC-HDSD-07-02-01:** JD exists → `/hr/recruitment?tab=requisitions` → `#hdsd-requisition-create-btn` → `hdsd-requisition-form-ready` ≤22s → POST requisition 2xx → F5 · job-templates storm=0
3. **TC-HDSD-08-02-01:** leave POST **201** + F5 overview marker (unique dates)
4. **Regression:** TC-HDSD-05-03-01 · TC-HDSD-04-02-01 · TC-HDSD-10-04-01

## completion_report

**Closed:** R-QA-HD-FORMREADY-REGRESS-R6 (contract sentinel); R-QA-YCTD-DEPT-HYDRATE-05 (template fallback readiness); R-QA-LEAVE-409-OVERLAP (FE prefill + harness STAMP salt).

**Residual:** If contract POST still **400** with `position_key` present in Network body → `D-HDSD-MUTATE-BE-01`.

## next_owner

qa

## next_dispatch_prompt

```
work_item_id: QA-HDSD-MUTATE-RET-03-HRM-R7
from_role: dev-fe | to_role: qa
program: P-HDSD-QA-SRS-01
entry_criteria: docs/qa/evidence/d-hdsd-mutate-fe-09-20260801.md READY_FOR_QA; restart HRM embed :8080; portal :5173; L0 exit 0; U65 zero-seed
exit_criteria: TC-HDSD-06-02-01 form-ready ≤22s → POST contract 2xx + Network body position_key + contract_code + F5; TC-HDSD-07-02-01 form-ready → POST requisition 2xx + F5; TC-HDSD-08-02-01 🟢 POST 201 + F5 marker; regression 05+04+10 🟢; evidence docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r7-20260801.md
UF/J-*: UF-HRM-05, UF-HRM-07, UF-HRM-09
cấm: seed; probe-only PASS
ack_status: PASS_TO_PM or FAIL_TO_PM
pm_dispatch_hint: if POST 400 with position_key in body → D-HDSD-MUTATE-BE-01
```

## evidence_path

`docs/qa/evidence/d-hdsd-mutate-fe-09-20260801.md`

## ack_status

**READY_FOR_QA**
