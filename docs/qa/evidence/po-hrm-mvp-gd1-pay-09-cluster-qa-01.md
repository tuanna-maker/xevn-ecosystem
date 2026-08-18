# Evidence — PO-HRM-MVP-GD1-PAY-09-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-MVP-GD1-PAY-09-CLUSTER-01` (runner `PO-HRM-MVP-GD1-PAY-09-CLUSTER-QA-01`) |
| **BE entry** | `docs/qa/evidence/hrm-mvp-gd1-pay-09-cluster-be-01.md` · READY_FOR_QA |
| **date** | 2026-08-10 |
| **stamp** | **`PAY09QA1-MSN8L7V3`** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** · C-SLICE · **≠** PAY-09 / PAY module UAT · `payroll_e2e_ready=false` |
| **persona** | `ceo@xe.vn` · `companyId=main` · U65 zero-seed |
| **BE handoff** | `docs/qa/evidence/hrm-mvp-gd1-pay-09-cluster-be-01.md` |
| **FE handoff** | **HOLD** `PO-HRM-MVP-GD1-PAY-09-CLUSTER-FE-01` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-pay-09-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-pay-09-cluster-qa-01.json` |
| **commit** | `dc930c5` |

## Gates

| Gate | Result |
|------|--------|
| L0 | `pnpm run qc:fe-be-health` **PASS** |
| L1 BE jest PAY-09 bundle | **PASS (59)** |
| L1 regression cite | **cite BE-01 bundle · delegate PAY08QA1-MSMFFXAZ PAY08 smoke · PAY01..07 deny codes in live** |
| Nest `/core` payroll/group hits | **0** (expect 0) |

## Group probe

```json
{
  "create": {
    "status": 201,
    "id": "71ac7955-304b-49d1-b5b2-787c534376ba",
    "code": "Q09MSN8LT8L"
  },
  "period_create_attempt": {
    "status": 409,
    "code": "HRM-PAY-002",
    "attempt": 0
  },
  "members": {
    "status": 200,
    "count": 0
  },
  "scope": {
    "scopedCreate": {
      "status": 409,
      "code": "HRM-PAY-002"
    },
    "patchPeriod": {
      "status": 200,
      "code": "HRM-PAY-200"
    },
    "elig_status": 200,
    "elig_code": "HRM-PAY-200",
    "period_list_status": 200,
    "period_list_code": "HRM-PAY-200"
  },
  "deny": {
    "dup": {
      "status": 409,
      "code": "HRM-PAY-GROUP-409"
    },
    "retired_bind": {
      "status": 409,
      "code": "HRM-PAY-GROUP-409"
    }
  }
}
```

## Journeys

| J-* | Verdict | Summary |
|-----|---------|---------|
| **J-HRM-PAY-09-01** | PASS_WITH_HOLD | POST group Q09MSN8LT8L → 201 · GET by id 200 · list contains row · F5 list by code 200 · **FE HOLD** (no browser catalog UI) |
| **J-HRM-PAY-09-02** | PASS_WITH_HOLD | GET …/groups/71ac7955…/members?period_id= → 200 · items[] · **FE HOLD** preview UI |
| **J-HRM-PAY-09-03** | PASS_WITH_HOLD | eligibility payroll_group_id filter 200 · scoped period create 409 · **FE HOLD** |
| **J-HRM-PAY-09-04** | PASS_WITH_HOLD | GET payslips?payroll_group_id= → 200 · rows=0 · **FE HOLD** report filter |
| **J-HRM-PAY-09-05** | PASS_WITH_HOLD | L2.5 GET 200 · group snapshot fields no payslip in scope · **FE HOLD** badge |
| **J-HRM-PAY-09-06** | PASS_WITH_HOLD | Mid-month group change → PAY-04 split HOLD U65 (cite PAY04QC1 + jest) · **≠** second payslip via PAY-09 |
| **J-HRM-PAY-09-07** | PASS | duplicate code → 409 HRM-PAY-GROUP-409 · retired bind period → 409 HRM-PAY-GROUP-409 · dual 409 cite jest resolver |
| **J-HRM-PAY-09-08** | PASS | honesty payroll_e2e_ready=false · nest /core hits=0 · must_keep PAY01..08QC1 · ≠ CRUD alone DONE |
| **J-HRM-PAY-01-04** | PASS | regression PAY01 ATT-412 → 412 HRM-PAY-ATT-412 |
| **J-HRM-PAY-03-03** | PASS | regression PAY03 gtgc → 403 HRM-PAY-GTCG-403 |
| **J-HRM-PAY-05-04** | PASS | regression PAY05 si → 403 HRM-PAY-SI-403 |
| **J-HRM-PAY-06-05** | PASS | regression PAY06 tax → 403 HRM-PAY-TAX-403 |
| **J-HRM-PAY-08-05** | PASS | regression PAY08 deny PATCH payslip → 0 null · cite PAY08QA1-MSMFFXAZ |
| **J-HRM-PAY-04-05** | PASS | L1 bundle split/gtgc regression (PAY03/04) |
| **J-HRM-PAY-07-06** | PASS | regression PAY07 cite PAY07QC1 jest bundle |
| **J-HRM-PAY-02-05** | PASS_WITH_HOLD | regression FORMULA-412 cite PAY02QC1 + jest — live HOLD U65 |

## must_keep

- `PAY01QC1-MSMBGWC1` … `PAY08QC1-MSMFFXGWC1` · cite `PAY08QA1-MSMFFXAZ`

## honesty footer

> **payroll_e2e_ready=false** · **C-SLICE** · **≠ PAY-09 / FR-UC-BP-PAY-09 module DONE** · **≠ PAY module UAT**

**ack_status:** **PASS_TO_PM**

## completion_report

**Closed:** Re-run after `HRM-MVP-GD1-PAY-09-CLUSTER-01` BE READY — L0 **PASS** · jest PAY-09 **59/59** · **J-HRM-PAY-09-01..08** API matrix **no FAIL** · members **200** · period list/eligibility **200** (no **HRM-SYS-001**) · dual 409 **J-09-07** · PAY01..08 regression live (ATT-412 / GTCG/SI/TAX 403) · nest `/core` hits **0**.

**Residual / defects:** **J-09-03** scoped period create **409 HRM-PAY-002** (dup label window — eligibility **200** still PASS_WITH_HOLD) · **J-09-05** payslip `payroll_group_*` **PASS_WITH_HOLD** (U65 no payslip row) · **FE-01 HOLD** · **payroll_e2e_ready=false** · **≠ PAY-09 / PAY module DONE**

## next_owner

`qc` (C-SLICE GWC) or `pm` (program seal)

## next_dispatch_prompt

```
work_item_id: QC-HRM-MVP-GD1-PAY-09-CLUSTER-01
entry_criteria: QA PASS_TO_PM stamp PAY09QA1-MSN8L7V3; docs/qa/evidence/po-hrm-mvp-gd1-pay-09-cluster-qa-01.md; payroll_e2e_ready=false; FE-01 HOLD
exit_criteria: GWC audit J-09-01..08 + PAY01..08 must_keep; cấm flip payroll_e2e_ready; cấm claim PAY-09 module DONE; ack GO WITH CONDITIONS or NO-GO with residual list
evidence_path: docs/qa/evidence/qc-po-hrm-mvp-gd1-pay-09-cluster-01.md
```
