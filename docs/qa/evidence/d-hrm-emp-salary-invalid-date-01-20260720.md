# D-HRM-EMP-SALARY-INVALID-DATE-01 — FE evidence (2026-07-20)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HRM-EMP-SALARY-INVALID-DATE-01` |
| **from_role** | dev-fe |
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | qa |
| **sponsor_lock** | U65 zero-seed · no Phase1/PROD claim |
| **date** | 2026-07-20 |

---

## spec_read_ack

| Artifact | Notes |
|----------|--------|
| Sponsor symptom | `RangeError: Invalid time value` at `EmployeeSalary.tsx` `format(new Date(payroll.payDate))` |
| API | `HrmPayslipRow.period_label` (often `MM/yyyy`, not ISO date) |
| UF | UF-HRM-06 payroll path — must_keep |
| F5 | Compensation tab riêng — không đụng |

**change_mode:** FIX

**spec says / code does:**
- Symptom: null/invalid/`MM/yyyy` payDate → `format(new Date(...))` throws.
- Code: `formatPayrollPayDateCell` / `formatDisplayDate` — null → `—`; period labels kept as text; ISO formatted safely. Both DialogContent have DialogTitle.

---

## Closed (FE)

1. `EmployeeSalary.tsx` — payroll payDate + allowance/history dates via `formatDisplayDate` / `formatPayrollPayDateCell`; never `format(new Date(apiValue))` on payslip fields
2. Dialog add/edit allowance — `DialogTitle` with i18n + VI fallback (a11y)
3. `lib/formatDisplayDate.ts` — period_label `MM/yyyy` / `yyyy-MM` **before** `new Date()` (JS coerces `2026-07` to day 1)
4. `formatDisplayDate.test.ts` — invalid payDate row suite (null / garbage / period labels)
5. `@CODE-MEMORY` + `@CODE-MEMORY-CHANGE` on EmployeeSalary + formatDisplayDate

**must_keep:** UF-HRM-06 payroll path; F5 compensation tab untouched.

---

## Verification

```text
cd apps/web/hrm
pnpm exec vitest run src/lib/formatDisplayDate.test.ts
→ Test Files: 1 passed | Tests: 8 passed
```

U65: no seed. Browser open employee → Lương tab = QA lane.

---

## Residual

| Item | Owner |
|------|-------|
| Browser: employee → tab Lương — no crash / no Invalid time; open add/edit allowance — no DialogTitle a11y warn | **qa** |
| F5 compensation regression smoke (must_keep) | qa (spot-check) |

**Not claimed:** Phase 1 / PROD DONE.

---

## completion_report

Fixed EmployeeSalary payDate crash: safe display for null/invalid/`MM/yyyy` period labels; DialogTitle confirmed on both salary dialogs; vitest 8 PASS. READY_FOR_QA.

**next_owner:** qa

**next_dispatch_prompt:**

```text
work_item_id: D-HRM-EMP-SALARY-INVALID-DATE-01
from_role: pm
to_role: qa
lane: execution
entry_criteria: FE READY_FOR_QA; U65 zero-seed; L0 stack up
exit_criteria: Browser employee → tab Lương — no RangeError Invalid time; payDate shows «—» or period text; open Thêm/Sửa phụ cấp — no DialogContent DialogTitle console warn; F5 compensation tab still loads if present
evidence_path: docs/qa/evidence/d-hrm-emp-salary-invalid-date-01-qa-20260720.md
cấm: seed · Phase1/PROD
read_first:
  - docs/qa/evidence/d-hrm-emp-salary-invalid-date-01-20260720.md
  - apps/web/hrm/src/components/employee/EmployeeSalary.tsx
  - apps/web/hrm/src/lib/formatDisplayDate.ts
persona: ceo@xe.vn / Xevn@2026 (or any employee with payroll rows)
click_path: HRM → Nhân viên → mở NV → tab Lương → scroll bảng lịch sử phiếu lương → (optional) Thêm phụ cấp dialog
```

**ack_status:** READY_FOR_QA
