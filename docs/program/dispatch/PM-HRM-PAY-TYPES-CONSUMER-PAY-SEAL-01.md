# PM seal — pay_types Payroll consumer (AC-SET-CONSUMER-PT-PAY-01)

| Meta | Value |
|------|--------|
| **work_item_id** | `PM-HRM-PAY-TYPES-CONSUMER-PAY-SEAL-01` |
| **date** | 2026-08-10 |
| **qa_stamp** | `PTPAYQA-MSNPHTEC` |
| **qc_stamp** | `PTPAYQC1-MSNPHTECQC1` · [QC narrow gate pay_types consumer slice](468a335e-4dff-469c-b502-27f58ad692c2) |

## GWC — closed in slice (CREATE + F5)

**AC-SET-CONSUMER-PT-PAY-01** — Lương → Thành phần lương · **Bản chất** (`component_type` catalog code): picker 3=3 EFF, POST 201 `cham_cong`, F5 label **Chấm công**, invent **400** `HRM-PAY-TYPE-KEY`.

Evidence: `docs/qa/evidence/qc-po-hrm-pay-types-consumer-pay-01.md` · **J-HRM-PAY-E2-01** narrow.

## Carry

PATCH edit bản chất in browser (non-blocking).

## Retain

`JGRECQC1-MSNP1AXQC1` · `ETCTRQC1-MSNNRUQC1` · `RECCHQC1-MSNKIJ5QC1` · `QACONPAYSTQC1` · `ATTLVTSOTQC1` / `ATTLVTCONQC1` · pay-stale regression seals.

## Denied

`settings_catalog_e2e_ready` flip · `payroll_e2e_ready` flip · UF-HRM-10 full · Settings module UAT.

## Program note

SRS §16.7 allow-list **consumer leg** `pay_types` → Payroll **CLOSED** on CREATE slice; **BR-SET-CONSUMER-MATRIX-01** remains **OPEN** (PERF E3, portal tabs, optional carries).
