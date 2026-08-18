# Evidence — PO-HRM-E2E-LINK-PAY-HIRE-FE-04

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-E2E-LINK-PAY-HIRE-FE-04` |
| from_role | dev-fe |
| to_role | pm |
| lane | execution |
| parent | `PO-HRM-E2E-LINK-PAY-HIRE-QA-03` (3× FAIL items) |
| change_mode | FIX narrow |
| date | 2026-08-06 |
| ack_status | **READY_FOR_QA** |
| honesty | `payroll_e2e_ready=false` |
| u65 | zero-seed · no DB mutate |

---

## Scope completed

### P0-1 — Create dialog month/year Select accessible (QA timeout «Tháng 6»)

- **Root cause:** Select trong Dialog embed CC portal mặc định mount dropdown vào `parent` document; Playwright (iframe context) không thấy `role="option"`.
- **Fix:** `SelectContent portalScope="iframe"` cho Tháng / Năm / Mẫu / Đơn vị trong `[data-testid="pay-batch-create-dialog-precision"]`.
- **Testids:** `pay-batch-create-month-select`, `pay-batch-create-month-option-{1..12}`, `pay-batch-create-year-select`, `pay-batch-create-year-option-{year}`.

### P0-2 — Enroll POST body whitelist (HRM-VAL-001 company_id)

- **Root cause:** BE `CreatePayrollEnrollDto` chỉ nhận `mode` + `employee_ids` — scope từ JWT/`x-company-id`; mọi `company_id` trong body → HRM-VAL-001.
- **Fix:** `lib/payrollEnrollPayload.ts` — `buildPayrollEnrollPayload` + `serializePayrollEnrollBody` (whitelist, không company_id). `hrmApi.enrollPayrollPeriod` dùng serializer. `addRecord` gom `employeeIds[]` → một POST explicit.

### P0-3 — Thêm NV visible sau tạo draft + chọn batch

- **Root cause:** Sau `createBatch` UI ở list view; QA probe `addEmpBtn` trên detail-only CTA.
- **Fix:** `handleCreateBatch` → `setSelectedBatch(mapPayrollPeriodToBatch(created))` + sync `periodMonth`/`periodYear` filter. Nút **Thêm nhân viên** có `data-testid="pay-batch-add-emp-btn"`.

---

## Files changed

| File | Change |
|------|--------|
| `apps/web/hrm/src/lib/payrollEnrollPayload.ts` | Enroll body whitelist (new) |
| `apps/web/hrm/src/lib/payrollEnrollPayload.test.ts` | 3 vitest — no company_id in body |
| `apps/web/hrm/src/integrations/hrmApi.ts` | `enrollPayrollPeriod` → serializePayrollEnrollBody |
| `apps/web/hrm/src/hooks/usePayrollBatches.ts` | Bulk enroll `employeeIds[]` + buildPayrollEnrollPayload |
| `apps/web/hrm/src/components/payroll/PayrollBatchesTab.tsx` | iframe portal Selects, testids, auto-open detail after create |

---

## Validation

```text
pnpm exec vitest run src/lib/payrollEnrollPayload.test.ts \
  src/components/payroll/payrollTemplateSelect.test.ts \
  src/components/payroll/__tests__/payrollDomainUi.test.ts \
  src/hooks/usePayrollBatches.test.ts
→ 26/26 PASS
```

Lint (touched files): no errors.

**must_keep verified:** FE-02 calc-list batches tab · FE-03 template sentinel · eligibility API wire unchanged.

**forbidden:** `payroll_e2e_ready=true` not set.

---

## QA entry (browser — U65)

1. Login `ceo@xe.vn` → **Tiền lương** → **Tính lương** → **Danh sách bảng lương**.
2. **Lập bảng lương** → dialog → chọn **Tháng 6** (option visible) → submit → **detail view** mở, `[data-testid="pay-batch-add-emp-btn"]` visible.
3. **Thêm nhân viên** → enroll POST body `{ mode, employee_ids }` only (no company_id) → 2xx or HRM-PAY-ENROLL-EMPTY if U65 all ineligible.
4. Eligibility badges `NO_CLOSED_SHEET` still render in add dialog.

---

## Residual

| ID | Owner | Notes |
|----|-------|-------|
| R-PAY-HIRE-NO-ELIGIBLE-U65 | pm/qa | U65 zero-seed — 53 NV NO_CLOSED_SHEET; AC-PAY-HIRE-04 may FAIL enroll empty until attendance close path |
| R-PAY-HIRE-ATT-412-BROWSER | qa | Process/412 after enroll unblocked |
| AC-PAY-HIRE-05 F5 | qa | Browser proof after enroll 2xx |

---

## completion_report

- **Closed:** QA-03 FE items — month Select iframe portal + testids; enroll body whitelist; auto detail + add-emp testid after create.
- **Open:** Full AC-PAY-HIRE-04/05 browser chain depends on eligible NV or attendance close; QA-04 retest required.

## next_owner

**qa**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-QA-04
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-E2E-LINK-PAY-HIRE-FE-04 READY_FOR_QA

read_first:
- docs/qa/evidence/po-hrm-e2e-link-pay-hire-fe-04.md
- docs/qa/evidence/po-hrm-e2e-link-pay-hire-qa-03.md (supersede FAIL items)

task:
- U65 browser-only: ceo@xe.vn → /hr/payroll → Tính lương → Lập bảng lương
- Month Select: option «Tháng 6» clickable (no 30s timeout)
- After create: detail view + pay-batch-add-emp-btn visible without manual row click
- Enroll POST: body must NOT contain company_id; expect 2xx or HRM-PAY-ENROLL-EMPTY (U65)
- AC-PAY-HIRE-05 F5 if enroll succeeds
- Eligibility NO_CLOSED_SHEET badges in add dialog
- cấm: seed; payroll_e2e_ready=true

exit: docs/qa/evidence/po-hrm-e2e-link-pay-hire-qa-04.md PASS_TO_PM or FAIL_TO_PM
```

## ack_status

**READY_FOR_QA**
