# Evidence — PO-HRM-MVP-GD1-PAY-05-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-05-CLUSTER-QA-01` |
| **date** | 2026-08-10 |
| **stamp** | **`PAY05QA1-MSMDU2I5`** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** · C-SLICE · **≠** PAY-05 / PAY module UAT · `payroll_e2e_ready=false` |
| **persona** | `ceo@xe.vn` · `companyId=main` · U65 zero-seed |
| **BE handoff** | `docs/qa/evidence/po-hrm-mvp-gd1-pay-05-cluster-be-01.md` |
| **FE handoff** | **HOLD** `PO-HRM-MVP-GD1-PAY-05-CLUSTER-FE-01` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-pay-05-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-pay-05-cluster-qa-01.json` |
| **commit** | `dc930c5` |

## Gates

| Gate | Result |
|------|--------|
| L0 | `pnpm run qc:fe-be-health` **PASS** |
| L1 BE jest PAY-05 bundle | **PASS (79)** |
| L1 regression cite | **cite BE-01 bundle · delegate PAY03QA1-MSMDDHP3/PAY04QA1-MSMCR401 · PAY03 gtgc + PAY04 split specs in bundle** |
| Nest `/core` payroll SI hits | **0** (expect 0) |

## Settings SI CFG probe (admin — not payroll seed)

```json
{
  "list_status": 200,
  "active_count": 5
}
```

## Payslip SI scan

```json
{
  "list_status": 200,
  "scanned": 120,
  "sampleId": "3a5333f7-237e-4157-bade-39c4b98a3fa9",
  "siFieldProbe": {
    "consolidatedInsuranceBaseVnd": 0,
    "siEmployeeAmountVnd": 0,
    "siEmployerAmountVnd": 0,
    "segmentCount": 0,
    "segments": []
  },
  "l25_fields_present": true
}
```

## Journeys

| J-* | Verdict | Summary |
|-----|---------|---------|
| **J-HRM-PAY-05-04** | PASS | POST process si_* override → 403 HRM-PAY-SI-403 |
| **J-HRM-PAY-05-03** | PASS | segments scanned — no si_* on segment DTO · splitSample=none · SPLIT-409 cite jest |
| **J-HRM-PAY-03-03** | PASS | regression POST gtgc override → 403 HRM-PAY-GTCG-403 |
| **J-HRM-PAY-01-04** | PASS | regression POST process → 412 HRM-PAY-ATT-412 |
| **J-HRM-PAY-04-05** | PASS | L1 contract: pay-payslip-split.service.spec HRM-PAY-SPLIT-409 in PAY-05 jest bundle |
| **J-HRM-PAY-04-08** | PASS | must_keep PAY01+PAY02+PAY03+PAY04 seals · nest /core payroll hits=0 |
| **J-HRM-PAY-05-05** | PASS | L1 jest failOnMissingCfg → HRM-SET-SI-412-MISSING · live U65 stops at ATT-412 before SI (no payroll seed to strip CFG) |
| **J-HRM-PAY-05-02** | PASS_WITH_HOLD | L1 applyPaySiCeiling min(base,ceiling) once · live E2E process+SI preview HOLD U65 (no closed bind in fresh period) |
| **J-HRM-PAY-05-06** | PASS | L2.5 list 200 → GET 3a5333f7-237e-4157-bade-39c4b98a3fa9 200 · SI DTO keys present |

## must_keep

- `PAY01QC1-MSMBGWC1` · `PAY02QC1-MSMC4GWC1` · `PAY03QC1-MSMDDGWC1` · `PAY04QC1-MSMCR4GWC1` · cite `PAY03QA1-MSMDDHP3` · `PAY04QA1-MSMCR401`

## honesty footer

> **payroll_e2e_ready=false** · **C-SLICE** · **≠ PAY-05 / FR-UC-BP-PAY-05 module DONE** · **≠ PAY module UAT**

**ack_status:** **PASS_TO_PM**

## completion_report

**Closed:** L0 PASS · L1 jest **79/79** (pay-si-ceiling + gtgc + split + payroll.service) · **J-HRM-PAY-05-04** `HRM-PAY-SI-403` · **J-HRM-PAY-05-03** DV-14 segment scan · **J-HRM-PAY-05-05** `HRM-SET-SI-412-MISSING` L1 jest · **J-HRM-PAY-05-06** L2.5 list→detail SI DTO keys · regression **J-HRM-PAY-03-03** · **J-HRM-PAY-01-04** · **J-HRM-PAY-04-05/08**.

**Residual (not promoted):** **J-HRM-PAY-05-02** PASS_WITH_HOLD — live U65 full process 2xx + non-zero `si_*` after closed bind chain not exercised (fresh period → ATT-412) · **FE-01** read-only SI preview HOLD · **≠** `payroll_e2e_ready` · **≠** PAY-05 / PAY module UAT DONE.

**next_owner:** **qc** (`PO-HRM-MVP-GD1-PAY-05-CLUSTER-QC-01`)

**evidence_path:** `docs/qa/evidence/po-hrm-mvp-gd1-pay-05-cluster-qa-01.md`

### next_dispatch_prompt (qc — copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-05-CLUSTER-QC-01
role: qc
read_first:
  - docs/qa/evidence/po-hrm-mvp-gd1-pay-05-cluster-qa-01.md
  - docs/qa/evidence/po-hrm-mvp-gd1-pay-05-cluster-be-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-BA-01.md (AC-PAY-05-*)
  - docs/program/specs/PO-HRM-MVP-GD1-PAY-05-CLUSTER-API-01.md §5 DTO
entry_criteria: QA stamp PAY05QA1-MSMDU2I5 PASS_TO_PM · L0+L1 PASS · U65 zero-seed
exit_criteria: GWC C-SLICE · honesty payroll_e2e_ready=false · ≠ PAY-05/PAY module UAT DONE · must_keep PAY01QC1+PAY02QC1+PAY03QC1+PAY04QC1 · acknowledge J-PAY-05-02 HOLD (live process+SI) · J-PAY-05-05 live 412 deferred to jest+ATT gate · FE-01 HOLD
cấm: claim PAY-05 DONE · flip payroll_e2e_ready · seed
```
