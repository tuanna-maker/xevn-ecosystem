# D-P1-HRM-PAY-I18N-STATUS-01 — Dev-FE evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `D-P1-HRM-PAY-I18N-STATUS-01` |
| **date** | 2026-07-17 |
| **owner** | dev-fe |
| **from** | QA residual `docs/qa/evidence/p1-hrm-menu-payroll-20260717.md` |
| **ack_status** | **READY_FOR_QA** |

---

## Symptom (QA)

Payslip list column header rendered literal:

`key 'common.status (vi)' returned an object instead of string.`

Badge cell still showed raw API value `processed` (separate StatusBadge gap — see residual).

## Root cause

`PayrollPayslipsApiTab` called `t('common.status', 'Trạng thái')`. In locales, `common.status` is an **object** (`label`, `pending`, `approved`, …), not a string leaf. i18next returns the object → error string in the header.

## Fix (minimal delta)

**File:** `apps/web/hrm/src/components/payroll/PayrollPayslipsApiTab.tsx`

| Before | After |
|--------|-------|
| `t('common.status', 'Trạng thái')` | `t('common.status.label')` |

Same leaf used by Employees, PaymentBatches, LeaveTab, etc.

**Verified leaf:**

- `vi.common.status.label` → `"Trạng thái"` (string)
- `en.common.status.label` → `"Status"` (string)

## Residual (out of this work_item scope)

| Item | Notes |
|------|-------|
| StatusBadge `processed` | API `HrmPayrollPeriodStatus` includes `processed`; `StatusBadge` has no `processed` key → falls back to raw English. Follow-up: map `processed` → VN label (e.g. «Đã xử lý») or align with batch map `processed`→`approved`. |

## QA retest (copy-ready)

1. Open `/command-center/hrm/payroll` (or `/hr/payroll`) · `ceo@xe.vn` · `companyId=main`
2. Confirm column header = **Trạng thái** (not i18n object error)
3. Regression: list still loads; J-HRM-07 detail dialog still opens

---

## Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** qa
- **next_dispatch_prompt:** Retest D-P1-HRM-PAY-I18N-STATUS-01 on payroll payslip list — column header must show «Trạng thái» (vi), not `key 'common.status…' returned an object`. Evidence: docs/qa/evidence/d-p1-hrm-pay-i18n-status-20260717.md. Optional note: badge may still show raw `processed` (residual, not this WI).
