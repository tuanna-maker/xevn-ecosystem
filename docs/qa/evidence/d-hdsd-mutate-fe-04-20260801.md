# D-HDSD-MUTATE-FE-04 — Contract/YCTD prefill + leave overview F5 marker

**work_item_id:** `D-HDSD-MUTATE-FE-04`  
**Program:** `P-HDSD-QA-SRS-01`  
**Date:** 2026-08-01  
**Owner:** dev-fe  
**ack_status:** `READY_FOR_QA`  
**Prior:** `docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-20260731.md` (FAIL_TO_PM — HĐ/YCTD no POST; leave F5 soft)

## spec_read_ack

- **srs:** UF-HRM-05 (HĐ) · UF-HRM-07 (YCTD) · UF-HRM-09 (leave POST + F5 persist)
- **tech_spec:** HRM embed mutate dialogs · CatalogSearchPicker contract_types / departments
- **change_mode:** FIX · **preserve_default:** NV create 🟢 · UF-XBOS-10 · internal_services · shareholder untouched

## Root cause → fix map

| TC | Symptom (QA RET-03-HRM) | Fix | Expected Network |
|----|-------------------------|-----|------------------|
| TC-HDSD-06-02-01 | Dialog ✓ · no POST — `contract_type` empty when catalog loads after open | `useEffect` prefill first `contract_types` when dialog open; testids employee + type + `hdsd-contracts-form-ready` | POST contract **2xx** after 2s harness wait |
| TC-HDSD-07-02-01 | JD picked · no POST — `department` required but empty after async catalog | `applyTemplate` + `useEffect` backfill first department; testids title/dept/headcount/employment/JD + `hdsd-requisition-form-ready` | POST `/recruitment/requisitions` **2xx** |
| TC-HDSD-08-02-01 F5 | POST 201 ✓ · marker absent on overview after F5 | `LeaveOverviewRecentPanel` on attendance overview tab (`hdsd-leave-overview-recent`) shows reason text | F5 `/hr/attendance` body contains `QA-LEAVE-*` marker |

## Files touched

| File | Change |
|------|--------|
| `apps/web/hrm/src/lib/hdsdMutateTestIds.ts` | FE-04 test ids (contract type, requisition fields, leave overview) |
| `apps/web/hrm/src/lib/hdsdMutateTestIds.test.ts` | Assert new ids |
| `apps/web/hrm/src/components/common/CatalogSearchPicker.tsx` | Optional `data-testid` on combobox trigger |
| `apps/web/hrm/src/pages/Contracts.tsx` | Async contract_type prefill; employee/type testids; form-ready sentinel |
| `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx` | Department backfill on JD pick; field testids; controlled employment_type Select |
| `apps/web/hrm/src/components/attendance/LeaveOverviewRecentPanel.tsx` | **NEW** — recent leave reasons on overview |
| `apps/web/hrm/src/pages/Attendance.tsx` | Wire overview recent-leave panel (replaces empty frequency placeholder) |

## Regression

```text
apps/web/hrm:
  pnpm exec vitest run src/lib/hdsdMutateTestIds.test.ts → 2/2 PASS
```

**Not modified:** Employees create · Command Center shareholder · workflow designer · internal_services redirect.

## QA retest (U65 browser · :5173)

**Persona:** `ceo@xe.vn` / `Xevn@2026`

1. **UF-HRM-05:** `#hdsd-contracts-create-btn` → wait `[data-testid=hdsd-contracts-form-ready]` (optional) → `#hdsd-contracts-form-submit` → POST 2xx → F5 row with stamp
2. **UF-HRM-07:** JD library row (U65) → `#hdsd-requisition-create-btn` → pick JD combobox `#hdsd-requisition-job-template` → wait ready → Lưu → POST 2xx
3. **UF-HRM-09 F5:** leave POST 201 → F5 `/hr/attendance` overview → `[data-testid=hdsd-leave-overview-recent]` contains marker reason
4. **Regression 🟢:** TC-HDSD-05-03-01 NV · TC-HDSD-04-02-01 WF · TC-HDSD-10-04-01 internal_services

Harness hint: prefer waiting `hdsd-contracts-form-ready` / `hdsd-requisition-form-ready` before submit click.

## completion_report

**Closed:** R-QA-HD-CREATE-01 contract_type async prefill + harness testids; R-QA-YCTD-FORM-FILL-01 department backfill after JD/catalog load; leave F5 overview marker via `LeaveOverviewRecentPanel`.

**Residual:** QA harness may still benefit from explicit wait on `*-form-ready` selectors (optional hardening in RET-03-HRM-R2 script).

## next_owner

qa

## next_dispatch_prompt

```
work_item_id: QA-HDSD-MUTATE-RET-03-HRM-R2
from_role: dev-fe | to_role: qa
program: P-HDSD-QA-SRS-01
entry_criteria: docs/qa/evidence/d-hdsd-mutate-fe-04-20260801.md READY_FOR_QA; portal :5173; L0 exit 0; U65 zero-seed
exit_criteria: TC-HDSD-06-02-01 + 07-02-01 POST 2xx + F5 where applicable; TC-HDSD-08-02-01 F5 marker on overview (`hdsd-leave-overview-recent`); confirm 05+08+04+10 still 🟢; evidence docs/qa/evidence/qa-hdsd-mutate-ret-03-hrm-r2-20260801.md
UF/J-*: UF-HRM-05, UF-HRM-07, UF-HRM-09
cấm: seed; probe-only PASS
ack_status: PASS_TO_PM or FAIL_TO_PM
pm_dispatch_hint: wait `[data-testid=hdsd-contracts-form-ready]` and `[data-testid=hdsd-requisition-form-ready]` before submit
```
