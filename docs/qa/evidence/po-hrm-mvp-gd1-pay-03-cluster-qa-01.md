# Evidence — PO-HRM-MVP-GD1-PAY-03-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-03-CLUSTER-QA-01` |
| **date** | 2026-08-10 |
| **stamp** | **`PAY03QA1-MSMDDHP3`** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** · C-SLICE · **≠** PAY-03 / PAY module UAT · `payroll_e2e_ready=false` |
| **persona** | `ceo@xe.vn` · `companyId=main` · U65 zero-seed |
| **BE handoff** | `docs/qa/evidence/po-hrm-mvp-gd1-pay-03-cluster-be-01.md` |
| **FE handoff** | **HOLD** `PO-HRM-MVP-GD1-PAY-03-CLUSTER-FE-01` (read-only GTCG UI not shipped) |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-pay-03-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-pay-03-cluster-qa-01.json` |
| **commit** | `dc930c5` |

## Gates

| Gate | Result |
|------|--------|
| L0 | `pnpm run qc:fe-be-health` **PASS** |
| L1 BE jest PAY-03 | **PASS (29)** |
| L1 BE jest regression cite | **cite BE-01 bundle 44+29 PASS · delegate PAY01QA1-MSMBA9OA/PAY02QA1-MSMC9D0I/PAY04QA1-MSMCR401** |
| Nest `/core` payroll SoT hits | **0** (expect 0) |

## CFG fixture (admin — not payroll seed)

```json
{
  "ok": false,
  "reason": "NO_DATABASE_URL"
}
```

## Journeys

| J-* | Verdict | Summary |
|-----|---------|---------|
| **J-HRM-PAY-03-03** | PASS | POST process override → 403 HRM-PAY-GTCG-403 |
| **J-HRM-PAY-01-04** | PASS | regression POST process → 412 HRM-PAY-ATT-412 |
| **J-HRM-CORE-01-03** | PASS | POST dependents → 201 ONE SoT F-CORE-DEP-01 |
| **J-HRM-PAY-01-02** | PASS_WITH_HOLD | regression closed bind → 412 |
| **J-HRM-PAY-03-02** | PASS_WITH_HOLD | no closed bind — GTCG resolver L1 via jest |
| **J-HRM-PAY-02-05** | PASS_WITH_HOLD | cite PAY02QC1-MSMC4GWC1 |
| **J-HRM-PAY-03-04** | PASS | PATCH effective_to 200 · re-process — count=— |
| **J-HRM-PAY-03-05** | PASS | segment rows gtgc_amount absent · cite PAY04QC1-MSMCR4GWC1 |
| **J-HRM-PAY-04-05** | PASS | SPLIT-409 cite PAY04QA1-MSMCR401 jest |
| **J-HRM-PAY-04-08** | PASS | PAY-04 seals cite PAY04QC1-MSMCR4GWC1 |
| **J-HRM-PAY-01-01** | PASS_WITH_HOLD | regression cite PAY01QA1-MSMBA9OA |
| **J-HRM-PAY-01-06** | PASS | no leave/OT cross-read on process (narrow) |
| **J-HRM-PAY-02-06** | PASS_WITH_HOLD | cite PAY02QA1-MSMC9D0I COMP-01 |
| **J-HRM-PAY-02-07** | PASS_WITH_HOLD | cite PAY02QA1-MSMC9D0I formula scope |
| **J-HRM-PAY-03-01** | PASS_WITH_HOLD | profile dependents GET 200 · F5 text=false · F-CORE-DEP-01 |
| **J-HRM-PAY-03-03-UI** | PASS | payroll grid gtgc inputs=0 (expect 0) |
| **J-HRM-PAY-03-06** | PASS | L2.5 list 200 detail 200 gtgcFields=true · FE read-only HOLD |

## must_keep

- `PAY01QC1-MSMBGWC1` · `PAY02QC1-MSMC4GWC1` · `PAY04QC1-MSMCR4GWC1` · cite `PAY01QA1-MSMBA9OA` · `PAY02QA1-MSMC9D0I` · `PAY04QA1-MSMCR401`

## honesty footer

> **payroll_e2e_ready=false** · **C-SLICE** · **≠ PAY-03 / FR-UC-BP-PAY-03 module DONE** · **≠ PAY module UAT**

**ack_status:** **PASS_TO_PM**
