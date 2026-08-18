# Evidence — PO-HRM-E2E-LINK-PAY-HIRE-FE-03

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-E2E-LINK-PAY-HIRE-FE-03` |
| from_role | dev-fe |
| to_role | pm |
| lane | execution |
| parent | `PO-HRM-E2E-LINK-PAY-HIRE-QA-02` (R-PAY-HIRE-CREATE-DIALOG-CRASH) |
| change_mode | FIX narrow |
| date | 2026-08-06 |
| ack_status | **READY_FOR_QA** |
| honesty | `payroll_e2e_ready=false` |
| u65 | zero-seed · no DB mutate |

---

## Scope completed

### P0 — create-batch dialog Radix Select crash

- **Root cause:** `PayrollBatchesTab.tsx` template picker used `<SelectItem value="">Không sử dụng mẫu</SelectItem>` — Radix forbids empty string values → React fatal on dialog mount when clicking **Lập bảng lương**.
- **Fix:** Sentinel `__none__` pattern (same as `interviewRatingSelect`):
  - New `payrollTemplateSelect.ts`: `PAYROLL_TEMPLATE_NONE_SENTINEL`, `templateFormValue`, `templateApiValue`.
  - Create dialog Select uses sentinel item; form state init/reset uses sentinel; `handleCreateBatch` maps sentinel → `template_id: undefined` for API.
- **Preserved:** FE-02 calc-list batches surface, eligibility wire, enroll API path unchanged.

---

## Files changed

| File | Change |
|------|--------|
| `apps/web/hrm/src/components/payroll/payrollTemplateSelect.ts` | Sentinel + form/API mappers (new) |
| `apps/web/hrm/src/components/payroll/payrollTemplateSelect.test.ts` | 4 vitest cases — no empty Select value |
| `apps/web/hrm/src/components/payroll/PayrollBatchesTab.tsx` | Template Select + create submit/reset use sentinel |

---

## Validation

```text
pnpm exec vitest run src/components/payroll/payrollTemplateSelect.test.ts
→ 4/4 PASS
```

Lint (touched files): no errors.

Static verification: no `SelectItem value=""` remains in `PayrollBatchesTab.tsx`.

---

## QA entry (browser — U65)

1. Login `ceo@xe.vn` → **Tiền lương** → **Tính lương** → **Danh sách bảng lương**.
2. Click **Lập bảng lương**.
3. **Expect:** `[data-testid="pay-batch-create-dialog-precision"]` visible; **no** console `Select.Item must have a value prop that is not an empty string`.
4. Fill tên → **Lập bảng lương** → draft batch created → **Thêm nhân viên** → enroll POST 2xx (AC-PAY-HIRE-04).
5. **Forbidden:** seed; `payroll_e2e_ready=true`.

---

## Residual

| ID | Owner | Notes |
|----|-------|-------|
| R-PAY-HIRE-ELIGIBILITY-FE | qa | Verify `NO_CLOSED_SHEET` badges in add-employee dialog after draft creatable |
| R-PAY-HIRE-ATT-412-BROWSER | qa | Process/412 browser matrix after enroll path unblocked |
| AC-PAY-HIRE-04 full chain | qa | Browser proof enroll 2xx + list refresh — pending QA-03 retest |

---

## completion_report

- **Closed:** R-PAY-HIRE-CREATE-DIALOG-CRASH — Radix empty SelectItem removed; sentinel mapping unit-tested.
- **Open:** Browser AC-PAY-HIRE-04 enroll/lock/F5 full path; eligibility FE badges; ATT-412 — QA retest required.

## next_owner

**qa**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-QA-03
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-E2E-LINK-PAY-HIRE-FE-03 READY_FOR_QA

read_first:
- docs/qa/evidence/po-hrm-e2e-link-pay-hire-fe-03.md
- docs/qa/evidence/po-hrm-e2e-link-pay-hire-qa-02.md (superseded FAIL items)

task:
- U65 browser-only: ceo@xe.vn → /hr/payroll → Tính lương → Lập bảng lương — dialog must mount (no Select crash)
- AC-PAY-HIRE-04: create draft → Thêm nhân viên → POST enroll 2xx → list refresh
- AC-PAY-HIRE-05: F5 persistence on enrolled row
- R-PAY-HIRE-ELIGIBILITY-FE: NO_CLOSED_SHEET vi-VN badges in add-employee dialog
- cấm: seed; payroll_e2e_ready=true until full chain PASS

exit: docs/qa/evidence/po-hrm-e2e-link-pay-hire-qa-03.md PASS_TO_PM or FAIL_TO_PM
```

## ack_status

**READY_FOR_QA**
