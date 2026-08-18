# Evidence — PO-HRM-E2E-LINK-PAY-ATT-CLOSE-FE-02

| Field | Value |
|-------|-------|
| work_item_id | `PO-HRM-E2E-LINK-PAY-ATT-CLOSE-FE-02` |
| from_role | dev-fe |
| to_role | pm |
| lane | execution |
| parent | `PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QA-02` FAIL_TO_PM |
| change_mode | FIX narrow |
| date | 2026-08-06 |
| ack_status | **READY_FOR_QA** |
| honesty | `payroll_e2e_ready=false` |
| u65 | zero-seed · no DB mutate · cấm `payroll_e2e_ready=true` |

---

## Defect closed

**R-PAY-PERIOD-ROW-NAV (P1)** — Payroll list defaulted to Tháng 8/2026; Jan 2026 draft hidden; month combobox click timeout in CC embed; `pay-batch-add-emp-btn` unreachable → AC-PAY-HIRE-04/05 blocked.

---

## Root cause

1. Month filter `SelectContent` mounted to parent document (no `portalScope="iframe"`) → Playwright combobox click timeout in portal embed (QA-02 `phaseError`).
2. No stable `data-testid` on period filter / batch rows → harness used fragile `button[role="combobox"]` selector.
3. No URL persistence for period filter / batch detail — navigation to `/hr/payroll` always reset to current calendar month.
4. `mapPayrollPeriodToBatch` used browser-local `getMonth()` on UTC `start_date` → Jan 2026 VN period (`2025-12-31T17:00:00.000Z`) could map to Dec/2025 on UTC hosts, failing month filter match.

---

## Fix summary

| # | Change |
|---|--------|
| 1 | `data-testid="pay-batch-period-filter"` + `pay-batch-period-option-{month}-{year}` on month filter (iframe portal) |
| 2 | `data-testid="pay-batch-row-{id}"` on list rows + `pay-batch-list-table` |
| 3 | URL deep-link / persist: `pay_period_month`, `pay_period_year`, `pay_batch_id` — auto-open detail when batch id present |
| 4 | `resolvePayrollPeriodCalendarMonth` (VN UTC+7) in `mapPayrollPeriodToBatch` — aligns list filter with BE-01 eligibility gate |
| 5 | Row click / menu → `openBatchDetail` syncs filter + URL; back button clears `pay_batch_id` |

---

## Files changed

| File | Change |
|------|--------|
| `apps/web/hrm/src/components/payroll/PayrollBatchesTab.tsx` | testids, URL sync, iframe portalScope, openBatchDetail |
| `apps/web/hrm/src/hooks/usePayrollBatches.ts` | VN calendar month resolver for period mapping |
| `apps/web/hrm/src/hooks/usePayrollBatches.test.ts` | Jan 2026 UTC start_date regression |

---

## Validation

```text
pnpm exec vitest run src/hooks/usePayrollBatches.test.ts \
  src/components/payroll/__tests__/payrollDomainUi.test.ts \
  src/lib/payrollEnrollPayload.test.ts
→ 24/24 PASS
```

**must_keep verified:** FE-02 calc-list batches · FE-03/04/05 enroll whitelist + eligibility fail-closed · BE-03 scope unchanged.

---

## QA entry (browser — U65)

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `company_id=main`

### Path A — deep link (preferred after att close)

1. Navigate: `/hr/payroll?pay_period_month=1&pay_period_year=2026&pay_batch_id=dffbb1fe-05b7-4f6e-91f1-0a6c6e739ad8` (+ portal query params).
2. Tab **Tính lương** → expect filter **Tháng 1/2026** + detail auto-open.
3. Expect `[data-testid="pay-batch-add-emp-btn"]` visible (draft status).

### Path B — filter + row click

1. **Tiền lương** → **Tính lương**.
2. Click `[data-testid="pay-batch-period-filter"]` → select `[data-testid="pay-batch-period-option-1-2026"]`.
3. Click `[data-testid="pay-batch-row-dffbb1fe-05b7-4f6e-91f1-0a6c6e739ad8"]` (or first Jan draft row).
4. **Thêm nhân viên** → enroll POST 2xx (AC-PAY-HIRE-04) → F5 (AC-PAY-HIRE-05).

**Precondition:** Jan 2026 att sheet closed (J-HRM-06c PASS from QA-02); API eligibility `eligible_count≥1` on period `dffbb1fe…`.

---

## completion_report

- **Closed:** R-PAY-PERIOD-ROW-NAV — period filter testids + iframe portal; batch row testids; URL deep-link/persist; VN month mapping for Jan 2026 filter parity; vitest 24/24 PASS.
- **Not closed:** AC-PAY-HIRE-04/05 browser enroll + F5 (QA-03 scope).
- **Honesty:** `payroll_e2e_ready=false`.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QA-03
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-E2E-LINK-PAY-ATT-CLOSE-FE-02 READY_FOR_QA

read_first:
- docs/qa/evidence/po-hrm-e2e-link-pay-att-close-fe-02.md
- docs/qa/evidence/po-hrm-e2e-link-pay-att-close-qa-02.md

entry_criteria:
- L0 stack up; J-HRM-06c att close already PASS (Jan sheet closed)
- BE eligibility eligible_count=53 on dffbb1fe period

task:
1) U65 browser: Path A deep-link OR Path B pay-batch-period-filter + pay-batch-row-{id}
2) Assert pay-batch-add-emp-btn visible on Jan 2026 draft detail
3) AC-PAY-HIRE-04 enroll POST 2xx from FE; AC-PAY-HIRE-05 F5 persistence
4) cấm seed; payroll_e2e_ready=true only if full chain PASS

exit: PASS_TO_PM or FAIL_TO_PM → docs/qa/evidence/po-hrm-e2e-link-pay-att-close-qa-03.md
```

## ack_status

**READY_FOR_QA**
