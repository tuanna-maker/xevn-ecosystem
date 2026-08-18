# Evidence — PO-HRM-MVP-GD1-PAY-08-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-08-CLUSTER-QA-01` |
| **date** | 2026-08-10 |
| **stamp** | **`PAY08QA1-MSMFFXAZ`** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** · C-SLICE · **≠** PAY-08 / PAY module UAT · `payroll_e2e_ready=false` |
| **persona** | `ceo@xe.vn` · `companyId=main` · U65 zero-seed |
| **BE handoff** | `docs/qa/evidence/po-hrm-mvp-gd1-pay-08-cluster-be-01.md` |
| **FE handoff** | **HOLD** `PO-HRM-MVP-GD1-PAY-08-CLUSTER-FE-01` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-pay-08-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-pay-08-cluster-qa-01.json` |
| **commit** | `dc930c5` |

## Gates

| Gate | Result |
|------|--------|
| L0 | `pnpm run qc:fe-be-health` **PASS** |
| L1 BE jest PAY-08 bundle | **PASS (49)** |
| L1 regression cite | **cite BE-01 bundle · delegate PAY07QA1-MSMEY7K3 PAY07 smoke · PAY01..06 deny codes in live** |
| Nest `/core` payroll payslip hits | **0** (expect 0) |

## Payslip lifecycle scan

```json
{
  "list_status": 200,
  "scanned": 120,
  "sampleId": "3a5333f7-237e-4157-bade-39c4b98a3fa9",
  "calculatedId": "e5c52976-2c3a-4456-9812-c2263e9625de",
  "publishedId": null,
  "lifecycleProbe": {
    "paymentStatus": null,
    "paymentStatusLabelVi": null,
    "publishedToEss": false,
    "status": "calculated",
    "isFinalPay": false
  },
  "l25_payment_dto_keys": true,
  "l25_final_pay_keys": true
}
```

## Journeys

| J-* | Verdict | Summary |
|-----|---------|---------|
| **J-HRM-PAY-08-01** | PASS | GET payslip 3a5333f7… 200 · payment_status + label_vi on DTO |
| **J-HRM-PAY-08-02** | PASS_WITH_HOLD | POST publish HOLD U65 (no calculated payslip with lines in scope) · jest confirm gate cite BE-01 |
| **J-HRM-PAY-08-03** | PASS_WITH_HOLD | HOLD U65 no published payslip for TT PATCH live |
| **J-HRM-PAY-08-04** | PASS_WITH_HOLD | ESS me/payslips + confirm after 2xx+F5 HOLD until FE-01 · jest ESS 403-ESS + confirm gate cite BE-01 |
| **J-HRM-PAY-08-05** | PASS | PATCH generic payslip → 403 HRM-PAY-PAYSLIP-403 · TT unpublished → 409 HRM-PAY-PUBLISH-409 · fresh process ATT-412 → 412 |
| **J-HRM-PAY-08-06** | PASS | L2.5 list→GET 3a5333f7… payment_status + is_final_pay keys |
| **J-HRM-PAY-08-07** | PASS_WITH_HOLD | Void O22 + posted settlement HOLD U65 (no FE workflow) · jest void route cite BE-01 |
| **J-HRM-PAY-08-08** | PASS | honesty payroll_e2e_ready=false · nest /core hits=0 · must_keep PAY01..07QC1 · ≠ GET alone DONE |
| **J-HRM-PAY-07-06** | PASS | regression PAY07 L2.5 cite PAY07QA1-MSMEY7K3 |
| **J-HRM-PAY-06-05** | PASS | regression PAY06 tax → 403 HRM-PAY-TAX-403 |
| **J-HRM-PAY-05-04** | PASS | regression PAY05 si → 403 HRM-PAY-SI-403 |
| **J-HRM-PAY-03-03** | PASS | regression PAY03 gtgc → 403 HRM-PAY-GTCG-403 |
| **J-HRM-PAY-01-04** | PASS | regression PAY01 ATT-412 → 412 HRM-PAY-ATT-412 |
| **J-HRM-PAY-04-05** | PASS | L1 bundle split/gtgc regression (PAY03/04) |
| **J-HRM-PAY-02-05** | PASS_WITH_HOLD | regression FORMULA-412 cite PAY02QC1 + jest — live HOLD U65 |

## must_keep

- `PAY01QC1-MSMBGWC1` … `PAY07QC1-MSMEY7GWC1` · cite `PAY07QA1-MSMEY7K3`

## honesty footer

> **payroll_e2e_ready=false** · **C-SLICE** · **≠ PAY-08 / FR-UC-BP-PAY-08 module DONE** · **≠ PAY module UAT**

**ack_status:** **PASS_TO_PM**

## completion_report

**Closed:** L0 PASS · L1 jest **49/49** (`pay-payslip-guard` · `pay-payslip-lifecycle.helpers` · `payroll.service.spec` ESS confirm **HRM-PAY-PUBLISH-409**) · **J-HRM-PAY-08-01** GET DTO `payment_status` + `payment_status_label_vi` keys · **J-HRM-PAY-08-05** amount PATCH **HRM-PAY-PAYSLIP-403** · TT unpublished **HRM-PAY-PUBLISH-409** · ATT-412 regression · **J-HRM-PAY-08-06** L2.5 list→GET payment + `is_final_pay` keys · **J-HRM-PAY-08-08** honesty + must_keep PAY01..07 · regression **J-PAY-01-04** · **J-PAY-03-03** · **J-PAY-05-04** · **J-PAY-06-05** · **J-PAY-07-06** cite · **J-PAY-04-05** jest.

**Residual (not promoted):** **J-HRM-PAY-08-02** live POST publish HOLD — calculated id `e5c52976…` without process lines (empty lines → publish 409 per BE) · **J-HRM-PAY-08-03** live PATCH `paid` HOLD (no published payslip after publish gate) · **J-HRM-PAY-08-04** ESS browser + confirm HOLD `PO-HRM-MVP-GD1-PAY-08-CLUSTER-FE-01` · **J-HRM-PAY-08-07** void O22 HOLD U65 · **J-HRM-PAY-08-09** period **HRM-PAY-LOCK-409** live enroll/process on locked period HOLD (cite jest `isPeriodPayrollLocked`) · **J-HRM-PAY-02-05** FORMULA-412 live HOLD · **≠** `payroll_e2e_ready` · **≠** PAY-08 / PAY module UAT DONE.

**next_owner:** **qc** (`PO-HRM-MVP-GD1-PAY-08-CLUSTER-QC-01`)

**evidence_path:** `docs/qa/evidence/po-hrm-mvp-gd1-pay-08-cluster-qa-01.md`

### next_dispatch_prompt (qc — copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-08-CLUSTER-QC-01
role: qc
read_first:
  - docs/qa/evidence/po-hrm-mvp-gd1-pay-08-cluster-qa-01.md
  - docs/qa/evidence/po-hrm-mvp-gd1-pay-08-cluster-be-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-BA-01.md (AC-PAY-SLIP-*)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-08-CLUSTER-API-01.md §4.3–4.11
entry_criteria: QA stamp PAY08QA1-MSMFFXAZ PASS_TO_PM · L0+L1 PASS · U65 zero-seed
exit_criteria: GWC C-SLICE · honesty payroll_e2e_ready=false · ≠ PAY-08/PAY module UAT DONE · must_keep PAY01QC1..PAY07QC1 · acknowledge J-08-02/03/04/07 HOLD (publish lines · TT live · ESS FE · void O22) · J-08-05 403 amount deny not 405-only
cấm: claim PAY-08 DONE · flip payroll_e2e_ready · seed
```
