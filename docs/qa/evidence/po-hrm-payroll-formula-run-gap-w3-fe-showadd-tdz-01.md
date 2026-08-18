# Evidence — PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-FE-SHOWADD-TDZ-01

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-FE-SHOWADD-TDZ-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **parent** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-J-HRM-07-01` |
| **ack_status** | **`READY_FOR_QA`** |
| **date** | 2026-08-07 |
| **change_mode** | `FIX` |
| **honesty** | `payroll_e2e_ready=false` — no LIVE / no module UAT claim |
| **U65** | zero-seed · browser retest only |

## Residual closed (this wave)

| Residual | Fix |
|----------|-----|
| **R-PAY-BATCHES-SHOWADD-TDZ** | `showAddDialog` `useState` moved **above** `usePaySheetTemplates({ enabled: showAddDialog })` in `PayrollBatchesTab.tsx` |

## spec_read_ack

- **defect:** `docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01.md` — ReferenceError TDZ on mount
- **file:** `apps/web/hrm/src/components/payroll/PayrollBatchesTab.tsx`
- **before:** hook @ ~L191 used `showAddDialog` declared @ ~L203 → TDZ
- **after:** `useState(false)` @ L201 → `usePaySheetTemplates({ enabled: showAddDialog })` @ L202–205

## Static verify (DOM contracts retained)

| Locator | Present |
|---------|---------|
| `data-testid="pay-batches-precision"` | Yes (list KPI grid — mounts when tab does not crash) |
| `data-testid="pay-batch-add-emp-btn"` | Yes (batch detail — reachable after list loads + open row; Jan period filter `pay-batch-period-option-1-2026`) |
| Button «Lập bảng lương» | `onClick={() => setShowAddDialog(true)}` on list surface (was unreachable while TDZ crashed mount) |

## Tests

| Suite | Result |
|-------|--------|
| `pnpm exec vitest run src/components/payroll` (cwd `apps/web/hrm`) | **7 files / 50 tests PASS** |
| PayrollBatchesTab dedicated vitest | **None exist** — no new heavy mount suite (minimal-diff mandate) |

## Diff scope

- **Only** `PayrollBatchesTab.tsx`: reorder `showAddDialog` state + `@CODE-MEMORY-CHANGE` APPEND
- No payroll formula / enroll / API refactors

## Honesty

`payroll_e2e_ready=false`

## QA retest (copy-ready)

Retest **PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-J-HRM-07-01** / **J-HRM-07** U65 browser:

1. Login `ceo@xe.vn` → `/hr/payroll` → Tính lương → Danh sách
2. Assert **no** `ReferenceError: showAddDialog`
3. Assert `[data-testid="pay-batches-precision"]` visible
4. Filter Jan 2026 (`pay-batch-period-option-1-2026`)
5. Click «Lập bảng lương» → create dialog opens; proceed enroll path if ATT closed same month

## completion_report

- **Closed:** P0 TDZ crash on PayrollBatchesTab mount (R-PAY-BATCHES-SHOWADD-TDZ).
- **Residual:** Full J-HRM-07 enroll→process→payslip still **QA browser**; `payroll_e2e_ready=false`.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-J-HRM-07-01
from_role: pm
to_role: qa
parent: PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-FE-SHOWADD-TDZ-01
entry: FE TDZ FIX READY — docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-fe-showadd-tdz-01.md
task: U65 browser retest J-HRM-07 Jan 2026 — assert no showAddDialog ReferenceError; pay-batches-precision renders; Lập bảng lương reachable; continue enroll→process if ATT closed.
exit: PASS_TO_PM or FAIL with residual · honesty payroll_e2e_ready=false
evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qa-j-hrm-07-01.md (R2 append)
```
