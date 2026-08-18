# D-HDSD-MUTATE-FE-02 — HDSD mutate FE automation + prefill fixes

**work_item_id:** `D-HDSD-MUTATE-FE-02`  
**Program:** `P-HDSD-QA-SRS-01`  
**Date:** 2026-07-30  
**Owner:** dev-fe  
**ack_status:** `READY_FOR_QA`  
**Prior:** `docs/qa/evidence/qa-hdsd-mutate-ret-01-20260730.md` (FAIL shareholder/NV/HĐ/YCTD)

## spec_read_ack

- **srs:** UF-XBOS-05 (cổ đông holding) · UF-HRM-02/05/07 (NV/HĐ/YCTD)
- **tech_spec:** Command Center legal profile scope · HRM embed mutate dialogs
- **change_mode:** FIX · **preserve_default:** true (WF canvas + internal_services 🟢 untouched)

## Root cause → fix map

| TC | Symptom (QA RET-01) | Fix | Expected Network |
|----|---------------------|-----|------------------|
| TC-HDSD-03-02-01 | `save ok:false` — save icon / React state miss | `data-testid` add/save/name per row; `onInput` sync holderName; `aria-label` | POST/PUT `/shareholders` **2xx** after type + Lưu |
| TC-HDSD-05-03-01 | Dialog không mở / fill search | `data-testid=hdsd-employees-create-btn`; dialog `name=full_name`; submit `aria-label=Lưu` | POST `/employees` **201** |
| TC-HDSD-06-02-01 | POST absent; picker race | `useEffect` prefill `employee_id` when picker loads; create btn always «Thêm hợp đồng»; submit **Lưu** + `data-testid` | POST contract **2xx** |
| TC-HDSD-07-02-01 | Form không mở | `data-testid=hdsd-requisition-create-btn`; dialog/submit hooks | Form open; POST when JD exists (U65 FE catalog) |

## Files touched

| File | Change |
|------|--------|
| `apps/web/web-portal/src/lib/hdsdMutateTestIds.ts` | Shareholder test id helpers |
| `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` | Shareholder row UX + testids |
| `apps/web/hrm/src/lib/hdsdMutateTestIds.ts` | HRM mutate test id constants |
| `apps/web/hrm/src/pages/Employees.tsx` | Create btn testid + aria |
| `apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx` | Dialog testid; `name` on NV fields; submit aria |
| `apps/web/hrm/src/pages/Contracts.tsx` | Employee prefill effect; Lưu label; testids |
| `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx` | Create dialog testids |

## Regression

```text
apps/web/hrm:
  pnpm exec vitest run src/lib/hdsdMutateTestIds.test.ts → 2/2 PASS

apps/web/web-portal:
  pnpm exec vitest run src/lib/hdsdMutateTestIds.test.ts \
    src/modules/hrm/commandCenterUrl.test.ts \
    src/integrations/legalEntityProfileScope.test.ts → PASS
```

## QA retest (U65 browser · :5173)

**Persona:** `ceo@xe.vn` / `Xevn@2026`

1. **UF-XBOS-05:** `#hdsd-shareholder-add-row` → type name → `[data-testid^=hdsd-shareholder-save-]` → POST 2xx → F5
2. **UF-HRM-02:** `#hdsd-employees-create-btn` → `[data-testid=hdsd-employee-form-dialog]` → `input[name=full_name]` → Lưu → POST 201 → F5
3. **UF-HRM-05:** `#hdsd-contracts-create-btn` → dialog → Lưu (prefill NV) → POST 2xx → F5
4. **UF-HRM-07:** `#hdsd-requisition-create-btn` → (nếu JD trống: tạo JD từ Thư viện JD qua FE trước) → chọn JD → Lưu yêu cầu → POST 2xx
5. **Regression 🟢:** WF `?settings=workflow_designer` · `/hr/internal_services` redirect

Harness hint: prefer `[data-testid=…]` over text-only when duplicate «Thêm nhân viên» in DOM.

## completion_report

**Closed:** R-HDSD-W1-01 automation hooks + shareholder input sync; R-HDSD-W2-01 employee/contract dialog open + contract employee_id prefill race; YCTD create entry testids. WF canvas + internal_services **not modified** (🟢 preserved).

**Residual:** TC-HDSD-07 POST still requires JD template created via FE catalog (U65 — no seed); leave POST 400 remains dev-be (`D-HDSD-MUTATE-BE-01`).

## next_owner

qa

## next_dispatch_prompt

```
work_item_id: QA-HDSD-MUTATE-RET-02
from_role: dev-fe | to_role: qa
entry_criteria: docs/qa/evidence/d-hdsd-mutate-fe-02-20260730.md; portal :5173; L0 PASS; U65 zero-seed
exit_criteria: Browser retest TC-HDSD-03-02-01, 05-03-01, 06-02-01, 07-02-01 — mutate POST 2xx + F5 where applicable; use data-testid selectors from evidence; UF-XBOS-10 + internal_services regression 🟢; evidence docs/qa/evidence/qa-hdsd-mutate-ret-02-20260730.md
UF/J-*: UF-XBOS-05, UF-HRM-02, UF-HRM-05, UF-HRM-07
cấm: seed; probe-only PASS
ack_status: PASS_TO_PM
pm_dispatch_hint: QC after QA PASS mutate wave
```
