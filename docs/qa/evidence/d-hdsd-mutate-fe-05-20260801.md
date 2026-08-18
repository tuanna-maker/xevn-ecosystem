# D-HDSD-MUTATE-FE-05 — Contract dates + YCTD catalog hydrate + leave reason F5

**work_item_id:** `D-HDSD-MUTATE-FE-05`  
**Program:** `P-HDSD-QA-SRS-01` · BF-03  
**Date:** 2026-08-01  
**Owner:** dev-fe  
**ack_status:** `READY_FOR_QA`  
**Prior QA:** `docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r2-20260801.md` (FAIL_TO_PM)

## spec_read_ack

- **srs:** UF-HRM-05 (HĐ create POST) · UF-HRM-07 (YCTD JD/dept hydrate) · UF-HRM-09 (leave reason on overview F5)
- **tech_spec:** `contractEndDatePolicy` G-CI-01 · CatalogSearchPicker departments · leave overview panel
- **change_mode:** FIX · **preserve_default:** TC-HDSD-05-03-01 NV 🟢 · TC-HDSD-04-02-01 WF 🟢 · TC-HDSD-10-04-01 internal 🟢

## Root cause → fix map

| TC | Symptom (QA R2) | Fix | Expected |
|----|-----------------|-----|----------|
| TC-HDSD-06-02-01 | `form-ready` true but toast thiếu ngày — no POST | Prefill `expiry_date` via `defaultContractExpiryDate`; `isCreateFormReady` includes `validateContractDatesForSubmit` | POST contract **2xx** + F5 |
| TC-HDSD-07-02-01 | JD + dept catalog trống; `hdsd-requisition-form-ready` absent | Catalogs always-on; `refetchTemplates` on create open; auto `applyTemplate(first JD)`; `departmentOptionsFromCatalog` alias merge | POST requisition **2xx** |
| TC-HDSD-08-02-01 | POST 201 · `QA-LEAVE-*` absent in overview panel | Leave create reads DOM reason fallback (automation-safe); overview sorts newest-first via `useLeaveRequests` | F5 marker in `hdsd-leave-overview-recent` |

## Files touched

| File | Change |
|------|--------|
| `apps/web/hrm/src/lib/contractEndDatePolicy.ts` | `defaultContractExpiryDate` helper |
| `apps/web/hrm/src/lib/contractEndDatePolicy.test.ts` | Unit test for default expiry |
| `apps/web/hrm/src/pages/Contracts.tsx` | Date prefill + form-ready aligns with submit gate |
| `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx` | Catalog hydrate + JD auto-pick on create |
| `apps/web/hrm/src/components/attendance/LeaveOverviewRecentPanel.tsx` | `useLeaveRequests` + newest-first sort + reason testid |
| `apps/web/hrm/src/components/attendance/LeaveTab.tsx` | Reason ref/onInput fallback for POST body |
| `apps/web/hrm/src/lib/hdsdMutateTestIds.ts` | `hdsd-leave-reason` · `hdsd-leave-overview-reason` |
| `apps/web/hrm/src/lib/hdsdMutateTestIds.test.ts` | Assert new ids |

## Regression

```text
apps/web/hrm:
  pnpm exec vitest run src/lib/contractEndDatePolicy.test.ts src/lib/hdsdMutateTestIds.test.ts → 14/14 PASS
```

**Not modified:** Employees create · workflow designer · internal_services · shareholder.

## QA retest (U65 browser · :5173)

**Persona:** `ceo@xe.vn` / `Xevn@2026`

1. **TC-HDSD-06-02-01:** `#hdsd-contracts-create-btn` → wait `hdsd-contracts-form-ready` → `#hdsd-contracts-form-submit` → POST 2xx → F5
2. **TC-HDSD-07-02-01:** `/hr/recruitment?tab=requisitions` → `#hdsd-requisition-create-btn` → wait `hdsd-requisition-form-ready` → Lưu → POST 2xx
3. **TC-HDSD-08-02-01:** leave POST with reason `QA-LEAVE-*` → F5 overview → `[data-testid=hdsd-leave-overview-recent]` contains marker
4. **Regression 🟢:** TC-HDSD-05-03-01 · TC-HDSD-04-02-01 · TC-HDSD-10-04-01

## completion_report

**Closed:** R-QA-HD-DATE-PREFILL-01 (expiry prefill + form-ready date gate); R-QA-YCTD-CATALOG-PICKER-01 (catalog always-on + JD auto-pick + departmentOptionsFromCatalog); R-QA-LEAVE-OVERVIEW-REASON-01 (reason POST fallback + overview newest-first display).

**Residual:** None in FE scope — QA RET-03-HRM-R3 browser harness.

## next_owner

qa

## next_dispatch_prompt

```
work_item_id: QA-HDSD-MUTATE-RET-03-HRM-R3
from_role: dev-fe | to_role: qa
program: P-HDSD-QA-SRS-01
entry_criteria: docs/qa/evidence/d-hdsd-mutate-fe-05-20260801.md READY_FOR_QA; portal :5173; L0 exit 0; U65 zero-seed
exit_criteria: TC-HDSD-06-02-01 + 07-02-01 + 08-02-01 all 🟢 POST 2xx + F5/marker; regression 05+04+10 🟢; evidence docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r3-20260801.md
UF/J-*: UF-HRM-05, UF-HRM-07, UF-HRM-09
cấm: seed; probe-only PASS
ack_status: PASS_TO_PM or FAIL_TO_PM
pm_dispatch_hint: wait hdsd-contracts-form-ready and hdsd-requisition-form-ready before submit; leave reason textarea data-testid=hdsd-leave-reason
```
