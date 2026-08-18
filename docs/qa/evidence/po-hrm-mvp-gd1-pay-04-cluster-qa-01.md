# Evidence — PO-HRM-MVP-GD1-PAY-04-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-04-CLUSTER-QA-01` |
| **date** | 2026-08-10 |
| **stamp** | **`PAY04QA1-MSMCR401`** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** · C-SLICE · **≠** PAY-04 / PAY module UAT · `payroll_e2e_ready=false` |
| **persona** | `ceo@xe.vn` · `companyId=main` |
| **BE handoff** | `docs/qa/evidence/po-hrm-mvp-gd1-pay-04-cluster-be-01.md` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-pay-04-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-pay-04-cluster-qa-01.json` |

## Gates

| Gate | Result |
|------|--------|
| L0 | `qc:fe-be-health` **PASS** |
| L1 BE jest | **PASS (52)** (pay-payslip-split + payroll.service) |

## Journeys

| J-* | Verdict | Summary |
|-----|---------|---------|
| **J-HRM-PAY-04-05** | PASS | L1 contract: jest simulateDoubleStatic → blocked HRM-PAY-SPLIT-409 (no U65 FE FAIL scenario) |
| **J-HRM-PAY-01-04** | PASS | PAY01QC1: process no bind → 412 HRM-PAY-ATT-412 |
| **J-HRM-PAY-02-05** | PASS | bind 409 · process → 412 HRM-PAY-FORMULA-412 |
| **J-HRM-PAY-02-07** | PASS | list 200 n=27 · OOS 404 |
| **J-HRM-PAY-02-06** | PASS_WITH_HOLD | regression delegate PAY02QA1 COMP BE · catalog=18 |
| **J-HRM-PAY-04-06** | PASS | GET payslip includes segments[] · sample=3a5333f7-237e-4157-bade-39c4b98a3fa9 |
| **J-HRM-PAY-04-01** | PASS_WITH_HOLD | BLOCKED U65: no mid-period C&B payslip with segment_count≥2 without CORE/FE path (FE-01 HOLD) |
| **J-HRM-PAY-04-02** | PASS_WITH_HOLD | jest+DDL contract OK · live segments HOLD — BLOCKED U65: no mid-period C&B payslip with segment_count≥2 without CORE/FE  |
| **J-HRM-PAY-04-03** | PASS_WITH_HOLD | process order retained in payroll.service.spec · static merge L1 only |
| **J-HRM-PAY-04-04** | PASS_WITH_HOLD | BLOCKED U65: no mid-period C&B payslip with segment_count≥2 without CORE/FE path (FE-01 HOLD) |
| **J-HRM-PAY-04-07** | PASS_WITH_HOLD | closed-hour proration covered in pay-payslip-split.service.spec · no leave/OT HTTP probe this seat |
| **J-HRM-PAY-04-08** | PASS | must_keep PAY01QC1-MSMBGWC1+PAY02QC1-MSMC4GWC1 · nest /core formula hits=0 · honesty C-SLICE |

## PAY-04 segments scan

```json
{
  "list_status": 200,
  "scanned": 25,
  "dtoSample": {
    "payslip_id": "3a5333f7-237e-4157-bade-39c4b98a3fa9",
    "has_segments_array": true,
    "split": false,
    "segmentCount": 0
  },
  "splitSample": null
}
```

## must_keep

- `PAY01QC1-MSMBGWC1` · `PAY02QC1-MSMC4GWC1` · regression PAY-01/02 subset sealed

## honesty footer

> **payroll_e2e_ready=false** · **C-SLICE** · **≠ PAY-04 / FR-UC-BP-PAY-04 module DONE** · **≠ PAY module UAT** · FE-04 preview bind **not in scope** this seat

**ack_status:** **PASS_TO_PM**

## completion_report

**Closed:** L0 PASS · L1 jest **52/52** (`pay-payslip-split.service.spec.ts` + `payroll.service.spec.ts`) · regression **J-HRM-PAY-01-04** · **J-HRM-PAY-02-05/06/07** (PAY01QC1+PAY02QC1) · **J-HRM-PAY-04-05** `HRM-PAY-SPLIT-409` L1 contract · **J-HRM-PAY-04-06** GET payslip `segments[]` DTO (API-01 §5) · **J-HRM-PAY-04-08** honesty/must_keep.

**Residual (not promoted):** **J-HRM-PAY-04-01..04/07** PASS_WITH_HOLD — no U65 live mid-period C&B row with `segment_count≥2` (FE-01 preview bind HOLD; zero-seed) · browser L2.5 PAY-04 deferred · **≠** `payroll_e2e_ready` · **≠** PAY-04 / PAY module UAT DONE.

**next_owner:** **qc** (`PO-HRM-MVP-GD1-PAY-04-CLUSTER-QC-01`)

**evidence_path:** `docs/qa/evidence/po-hrm-mvp-gd1-pay-04-cluster-qa-01.md`

### next_dispatch_prompt (qc — copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-04-CLUSTER-QC-01
role: qc
read_first:
  - docs/qa/evidence/po-hrm-mvp-gd1-pay-04-cluster-qa-01.md
  - docs/qa/evidence/po-hrm-mvp-gd1-pay-04-cluster-be-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-BA-01.md (AC-PAY-04-*)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01.md §5 DTO
entry_criteria: QA stamp PAY04QA1-MSMCR401 PASS_TO_PM · L0+L1 PASS · U65 zero-seed
exit_criteria: GWC C-SLICE · honesty payroll_e2e_ready=false · ≠ PAY-04/PAY module UAT DONE · must_keep PAY01QC1-MSMBGWC1+PAY02QC1-MSMC4GWC1 · acknowledge J-PAY-04-01..04/07 HOLD (mid-period live segments + FE-01) · J-PAY-04-05 SPLIT-409 L1 only · DENY reopen sealed PAY-01/02 journeys
cấm: claim PAY-04 DONE · flip payroll_e2e_ready · seed
```
