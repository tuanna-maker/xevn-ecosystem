# Evidence — PO-HRM-MVP-GD1-PAY-06-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-06-CLUSTER-QA-01` |
| **date** | 2026-08-10 |
| **stamp** | **`PAY06QA1-MSMECGBI`** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** · C-SLICE · **≠** PAY-06 / PAY module UAT · `payroll_e2e_ready=false` |
| **persona** | `ceo@xe.vn` · `companyId=main` · U65 zero-seed |
| **BE handoff** | `docs/qa/evidence/po-hrm-mvp-gd1-pay-06-cluster-be-01.md` |
| **FE handoff** | **HOLD** `PO-HRM-MVP-GD1-PAY-06-CLUSTER-FE-01` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-pay-06-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-pay-06-cluster-qa-01.json` |
| **commit** | `dc930c5` |

## Gates

| Gate | Result |
|------|--------|
| L0 | `pnpm run qc:fe-be-health` **PASS** |
| L1 BE jest PAY-06 bundle | **PASS (63)** |
| L1 regression cite | **cite BE-01 bundle · delegate PAY05QA1-MSMDU2I5 PAY05 smoke · PAY03 gtgc + PAY04 split in bundle** |
| Nest `/core` payroll tax/SI hits | **0** (expect 0) |

## Settings tax CFG probe (admin — not payroll seed)

```json
{
  "regime_status": 200,
  "regime_code": "progressive_vn",
  "prefix_status": 200,
  "prefix_keys": [
    "pay_tax_dependent_deduction_vnd",
    "pay_tax_flags",
    "pay_tax_personal_deduction_vnd",
    "pay_tax_regime"
  ]
}
```

## Payslip tax scan

```json
{
  "list_status": 200,
  "scanned": 120,
  "sampleId": "3a5333f7-237e-4157-bade-39c4b98a3fa9",
  "taxFieldProbe": {
    "taxableIncomeVnd": 9500000,
    "personalDeductionVnd": 11500000,
    "dependentDeductionVnd": 0,
    "taxAmountVnd": 0,
    "payTaxRegimeCode": "progressive_vn",
    "bracketSnapshotVersion": "progressive_vn_v1",
    "segmentCount": 0,
    "segments": []
  },
  "l25_tax_dto_keys": true,
  "splitSample": null,
  "segment_static_tax_absent": true
}
```

## Journeys

| J-* | Verdict | Summary |
|-----|---------|---------|
| **J-HRM-PAY-06-01** | PASS | GET pay_tax_regime → 200 code=progressive_vn · prefix 200 |
| **J-HRM-PAY-06-05** | PASS | (b) POST process tax/net override → 403 HRM-PAY-TAX-403 |
| **J-HRM-PAY-06-05-enroll** | PASS_WITH_HOLD | POST enroll tax_amount → 400 HRM-VAL-001 (DTO whitelist before service guard — process path 403 primary) |
| **J-HRM-PAY-06-05-412** | PASS | L1 pay-tncn-resolver + settings-defaults contract HRM-SET-TAX-412-MISSING · live process stops ATT-412 before tax KV strip U65 |
| **J-HRM-PAY-06-02** | PASS | GET eligibility 200 items=59 reasons[] shape ok |
| **J-HRM-PAY-06-03** | PASS_WITH_HOLD | FE enroll/process after 2xx+F5 HOLD until PO-HRM-MVP-GD1-PAY-06-CLUSTER-FE-01 · API enroll/process RETAIN cite |
| **J-HRM-PAY-06-04** | PASS_WITH_HOLD | L1 computePayTncnBreakdown + progressive_vn_v1 once · live POST process tax_amount_vnd HOLD U65 (ATT-412 gate) |
| **J-HRM-PAY-06-06** | PASS | L2.5 list 200 → GET 3a5333f7-237e-4157-bade-39c4b98a3fa9 200 · tax DTO keys present |
| **J-HRM-PAY-06-07** | PASS | segments scanned — no static TAX/THUE on segment · splitSample=none |
| **J-HRM-PAY-06-08** | PASS | honesty payroll_e2e_ready=false · nest /core hits=0 · must_keep PAY01..05QC1 |
| **J-HRM-PAY-05-04** | PASS | regression POST process si_* → 403 HRM-PAY-SI-403 |
| **J-HRM-PAY-03-03** | PASS | regression POST gtgc override → 403 HRM-PAY-GTCG-403 |
| **J-HRM-PAY-01-04** | PASS | regression POST process → 412 HRM-PAY-ATT-412 |
| **J-HRM-PAY-04-05** | PASS | L1 bundle includes pay-gtgc + split regression (PAY03/04) |
| **J-HRM-PAY-02-05** | PASS_WITH_HOLD | regression FORMULA-412 / gd1_eval_v1 cite PAY02QC1 + jest payroll.service.spec — live HOLD U65 |

## must_keep

- `PAY01QC1-MSMBGWC1` · `PAY02QC1-MSMC4GWC1` · `PAY03QC1-MSMDDGWC1` · `PAY04QC1-MSMCR4GWC1` · `PAY05QC1-MSMDU2GWC1` · cite `PAY05QA1-MSMDU2I5`

## honesty footer

> **payroll_e2e_ready=false** · **C-SLICE** · **≠ PAY-06 / FR-UC-BP-PAY-06 module DONE** · **≠ PAY module UAT**

**ack_status:** **PASS_TO_PM**

## completion_report

**Closed:** L0 PASS · L1 jest **63/63** (pay-tncn-resolver + payroll.service + si + gtgc) · **J-HRM-PAY-06-01** `pay_tax_regime=progressive_vn` via settings GET · **J-HRM-PAY-06-05** `HRM-PAY-TAX-403` on process body · **J-HRM-PAY-06-05-412** L1 `HRM-SET-TAX-412-MISSING` contract · **J-HRM-PAY-06-02** eligibility `reasons[]` · **J-HRM-PAY-06-06** L2.5 tax DTO keys on list→detail · **J-HRM-PAY-06-07** DV-14 segment scan · **J-HRM-PAY-06-08** honesty + must_keep PAY01..05 · regression **J-PAY-01-04** · **J-PAY-03-03** · **J-PAY-05-04** · **J-PAY-04-05**.

**Residual (not promoted):** **J-HRM-PAY-06-03** FE after 2xx+F5 HOLD (`PO-HRM-MVP-GD1-PAY-06-CLUSTER-FE-01`) · **J-HRM-PAY-06-04** live process TNCN persist HOLD U65 (ATT-412 on fresh period) · **J-HRM-PAY-06-05-enroll** enroll override blocked by DTO `HRM-VAL-001` before service guard (process 403 is SoT) · **J-HRM-PAY-02-05** live formula HOLD · **≠** `payroll_e2e_ready` · **≠** PAY-06 / PAY module UAT DONE.

**next_owner:** **qc** (`PO-HRM-MVP-GD1-PAY-06-CLUSTER-QC-01`)

**evidence_path:** `docs/qa/evidence/po-hrm-mvp-gd1-pay-06-cluster-qa-01.md`

### next_dispatch_prompt (qc — copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-06-CLUSTER-QC-01
role: qc
read_first:
  - docs/qa/evidence/po-hrm-mvp-gd1-pay-06-cluster-qa-01.md
  - docs/qa/evidence/po-hrm-mvp-gd1-pay-06-cluster-be-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-BA-01.md (AC-PAY-06-*)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-06-CLUSTER-API-01.md §5 DTO
entry_criteria: QA stamp PAY06QA1-MSMECGBI PASS_TO_PM · L0+L1 PASS · U65 zero-seed
exit_criteria: GWC C-SLICE · honesty payroll_e2e_ready=false · ≠ PAY-06/PAY module UAT DONE · must_keep PAY01QC1+PAY02QC1+PAY03QC1+PAY04QC1+PAY05QC1 · acknowledge J-06-03/04 HOLD (FE + live TNCN process) · J-06-05-enroll VAL-001 vs 403 note · FE-01 HOLD
cấm: claim PAY-06 DONE · flip payroll_e2e_ready · seed
```
