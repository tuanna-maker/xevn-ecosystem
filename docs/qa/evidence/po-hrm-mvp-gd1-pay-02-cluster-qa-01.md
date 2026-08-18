# Evidence — QA-PO-HRM-MVP-GD1-PAY-02-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-MVP-GD1-PAY-02-CLUSTER-QA-01` |
| **date** | 2026-08-10 |
| **stamp** | **`PAY02QA1-MSMCDUNG`** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** · C-SLICE · **≠** PAY-02 / PAY module UAT · `payroll_e2e_ready=false` |
| **persona** | `ceo@xe.vn` · `companyId=main` |
| **FE handoff** | `docs/qa/evidence/po-hrm-mvp-gd1-pay-02-cluster-fe-01.md` |
| **BE handoff** | `docs/qa/evidence/po-hrm-mvp-gd1-pay-02-cluster-be-01.md` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-pay-02-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-pay-02-cluster-qa-01.json` |

## Gates

| Gate | Result |
|------|--------|
| L0 | `qc:fe-be-health` **PASS** |
| L1 FE vitest | **PASS (18)** |
| L1 BE jest | **PASS (110 cite BE-01)** (cite BE-01 bundle) |
| Nest `/core` formula SoT | hits **0** (expect 0) |

## Journeys

| J-* | Verdict | Summary |
|-----|---------|---------|
| **J-HRM-PAY-01-04** | PASS_WITH_HOLD | could not create fresh period — cite PAY01QA1 ATT-412 |
| **J-HRM-PAY-02-05** | PASS | bind 409 persisted=true · process → 412 HRM-PAY-FORMULA-412 |
| **J-HRM-PAY-02-07** | PASS | list 200 n=26 · OOS 404 |
| **J-HRM-PAY-02-06** | PASS | BE invent input-line HRM-SC-COMP=true · catalog=17 |
| **J-HRM-PAY-02-01** | PASS | POST salary-components 201 · F5 list contains code=true |
| **J-HRM-PAY-02-02** | PASS | POST draft 201 · F5 list has code · honesty=true |
| **J-HRM-PAY-02-03** | PASS | submit 201 → self-publish 403 HRM-PAY-FORMULA-403-DUAL |
| **J-HRM-PAY-02-04** | PASS | POST preview 201 · lines_table=true · result_box=true |
| **J-HRM-PAY-02-06-FE** | PASS_WITH_HOLD | COMP-01 FE picker-only — gate=BE input-line HRM-SC-COMP (see J-HRM-PAY-02-06) |

## must_keep

- `PAY01QC1-MSMBGWC1` · regression **J-HRM-PAY-01-04** sealed (ATT-412)

## honesty footer

> **payroll_e2e_ready=false** · **C-SLICE** · **≠ PAY-02 / FR-UC-BP-PAY-02 module DONE** · **≠ PAY module UAT** · QC GWC eligible when PASS

**ack_status:** **PASS_TO_PM**
