# PO-HRM-MVP-GD1-PAY-06-CLUSTER-BE-01 — Evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-06-CLUSTER-BE-01` |
| **role** | dev-be |
| **spec_ref** | `docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-API-01.md` §4.4–4.5 · `PO-HRM-MVP-GD1-PAY-06-CLUSTER-DATA-01.md` §6.1 |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `payroll_e2e_ready=false` · **≠ PAY-06 / FR-UC-BP-PAY-06 DONE** · **C-SLICE** |

## Closed (BE)

1. **Schema:** `ensurePayrollPayslipsTaxColumn` — `payroll_payslips.tax_amount NUMERIC(15,2) NULL` (DATA-01 §6.1).
2. **F-PAY-TNCN-01:** `pay-tncn-resolver.ts` — taxable bag (merged gross − GTCG − SI) · `loadPayTaxProcessContext` + `readRequiredTaxValue` → **`HRM-SET-TAX-412-MISSING`** · `progressive_vn_v1` (`pay-progressive-vn.constants.ts`) · persist header `tax_amount` once per employee.
3. **Process order:** `processPayrollPeriod` — after `persistPaySiCeilingOnPayslip` (PAY-05 step 8) · before period status finalize; PAY-01..05 loop unchanged ahead of SI.
4. **Guards:** `assertNoPayTaxOverrideInBody` + **`HRM-PAY-TAX-403`** on `POST …/process` and `POST …/enroll`.
5. **Payslip read:** `enrichPayslipTaxDisplay` — `taxableIncomeVnd`, `personalDeductionVnd`, `dependentDeductionVnd`, `taxAmountVnd`, `payTaxRegimeCode`, `bracketSnapshotVersion` on list/get/ESS get.
6. **DENY:** no `POST /payroll/tax-compute` · no `tax_amount` on split segments (unchanged DV-14).

## Files touched

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/payroll/pay-tncn-resolver.ts` | ADD F-PAY-TNCN-01 |
| `apps/api/hrm-api/src/payroll/pay-progressive-vn.constants.ts` | ADD brackets v1 |
| `apps/api/hrm-api/src/payroll/pay-tax-guard.ts` | ADD HRM-PAY-TAX-403 |
| `apps/api/hrm-api/src/payroll/pay-tax.constants.ts` | ADD codes |
| `apps/api/hrm-api/src/payroll/payroll.service.ts` | process step 9 · guards · DTO enrich |
| `apps/api/hrm-api/src/payroll/pay-tncn-resolver.spec.ts` | ADD regression |
| `apps/api/hrm-api/src/payroll/payroll.service.spec.ts` | mock SettingsTaxParamsService |

## Verification

```bash
cd apps/api/hrm-api
pnpm exec jest --testPathPatterns="pay-tncn-resolver|payroll.service.spec|pay-si-ceiling-resolver|pay-gtgc-resolver" --no-cache
```

**Result:** exit **0** · 4 suites · **63** tests passed (2026-08-10).

## Residual (not BE DONE)

- FE enroll/process AC · read-only tax grid (`PO-HRM-MVP-GD1-PAY-06-CLUSTER-FE-01`).
- QA U65 **J-HRM-PAY-06-*** + regression PAY-01..05 browser.
- Formula/net reconciliation after tax (PAY-02 order ideal step 10–11) — C-SLICE; `tax_amount` header does not auto-rebalance `net_amount` from formula pass.
- Optional **`THUE_TNCN_HT`** line xor policy — header `tax_amount` path only GĐ1.
- QC GWC · **≠ payroll_e2e_ready**.

## spec_read_ack

- **srs:** `SRS_HRM_ENTERPRISE.md` FR-UC-BP-PAY-06 Diễn biến #5–#6
- **api_design:** `PO-HRM-MVP-GD1-PAY-06-CLUSTER-API-01.md` §4.4 T1–T7 · §4.10
- **db_design:** `PO-HRM-MVP-GD1-PAY-06-CLUSTER-DATA-01.md` §6.1 `tax_amount`
- **sponsor_confirm:** API-01 CONFIRMED EXPAND + DATA-01 ADD stamp
