# Evidence — PO-HRM-E2E-LINK-PAY-HIRE-FE-02

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-E2E-LINK-PAY-HIRE-FE-02` |
| from_role | dev-fe |
| to_role | pm |
| lane | execution |
| parent | `PO-HRM-E2E-LINK-PAY-HIRE-QA-01` (R-PAY-HIRE-BATCHES-HIDDEN) |
| change_mode | FIX narrow |
| date | 2026-08-06 |
| ack_status | **READY_FOR_QA** |
| honesty | `payroll_e2e_ready=false` |

---

## Scope completed

### P0 — calc-list always mounts PayrollBatchesTab

- **Root cause:** `Payroll.tsx` `calc-list` branch swapped to `PayrollPayslipsApiTab` when `livePayslips.length >= 1`, hiding **Lập bảng lương** / **Thêm nhân viên** (enroll path from FE-01).
- **Fix:** Pure resolver `resolveCalcListTabComponent()` always returns `'batches'` — decoupled from global payslip count. Reports tab still uses `PayrollPayslipsApiTab` for read-only payslip list.
- **Preserved:** FE-01 enroll/process wire in `usePayrollBatches` + `PayrollBatchesTab`; dual-SoT (FE binds BE amounts only).

### P1 — eligibility GET + reasons[] display

- `hrmApi.ts`: `getPayrollEligibility()` + types aligned with BE `GET /payroll/periods/:id/eligibility`.
- `usePayrollPeriodEligibility` hook — fetched when **Thêm nhân viên** dialog opens on draft batch detail.
- `PayrollBatchesTab`: ineligible employees — checkbox disabled + `reasons[]` badges (vi-VN via `formatPayrollEligibilityReason`). Graceful error when API 404 (BE stale) — list still visible, eligibility banner shown.

---

## Files changed

| File | Change |
|------|--------|
| `apps/web/hrm/src/pages/Payroll.tsx` | Use `resolveCalcListTabComponent` for `calc-list` |
| `apps/web/hrm/src/components/payroll/payrollDomainUi.ts` | `resolveCalcListTabComponent`, eligibility label/map helpers |
| `apps/web/hrm/src/integrations/hrmApi.ts` | `getPayrollEligibility` + response types |
| `apps/web/hrm/src/hooks/usePayrollBatches.ts` | `usePayrollPeriodEligibility` hook |
| `apps/web/hrm/src/components/payroll/PayrollBatchesTab.tsx` | Eligibility wire in add-employee dialog |
| `apps/web/hrm/src/components/payroll/__tests__/payrollDomainUi.test.ts` | +4 tests for calc-list + eligibility helpers |

---

## Validation

```text
pnpm test -- payrollDomainUi.test.ts usePayrollBatches.test.ts
→ 19/19 PASS (2 files)
```

Lint (touched files): no errors.

---

## QA entry (expected after BE-02)

1. Login `ceo@xe.vn` → **Tiền lương** → **Tính lương** → **Danh sách bảng lương**.
2. **Expect:** `PayrollBatchesTab` visible with **Lập bảng lương** even when overview shows ≥1 phiếu lương.
3. Draft period → **Thêm nhân viên** → eligibility badges for NV without closed sheet; POST enroll when BE live.
4. **Forbidden:** seed; `payroll_e2e_ready=true`.

---

## Residual

| ID | Owner | Notes |
|----|-------|-------|
| R-PAY-HIRE-BE-STALE | dev-be | Eligibility/enroll **404** on `:28001` until hrm-api rebuild + restart |
| Browser AC-PAY-HIRE-04 | qa | Full enroll 2xx → row refresh blocked on BE until BE-02 |

---

## completion_report

- **Closed:** FE surface gate R-PAY-HIRE-BATCHES-HIDDEN; calc-list always routes to batch/enroll UX; eligibility reasons wired P1.
- **Open:** End-to-end enroll requires BE-02 runtime; QA browser matrix pending stack with live enroll/eligibility routes.

## next_owner

`qa` (after `PO-HRM-E2E-LINK-PAY-HIRE-BE-02` READY_FOR_QA)

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-QA-02
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-E2E-LINK-PAY-HIRE-FE-02 + PO-HRM-E2E-LINK-PAY-HIRE-BE-02
entry_criteria: BE-02 curl eligibility/enroll not 404; FE-02 READY_FOR_QA merged

read_first:
- docs/qa/evidence/po-hrm-e2e-link-pay-hire-fe-02.md
- docs/qa/evidence/po-hrm-e2e-link-pay-hire-qa-01.md (supersede)

task:
- Browser U65: ceo@xe.vn → /hr/payroll → Tính lương → Danh sách bảng lương
- Verify PayrollBatchesTab + Lập bảng + Thêm NV reachable when global payslip count >= 1
- AC-PAY-HIRE-04: enroll POST 2xx → table row + employee_count refresh
- AC-PAY-HIRE-05: F5 persistence
- Eligibility: ineligible NV shows reasons[]; no fake toast on zero enrolled
- dual-SoT: FE amounts from BE only

forbidden: seed; payroll_e2e_ready=true claim

exit_criteria:
- evidence_path: docs/qa/evidence/po-hrm-e2e-link-pay-hire-qa-02.md
- ack_status: PASS_TO_PM or FAIL_TO_PM with residuals
```
