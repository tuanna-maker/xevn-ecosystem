# Evidence — QA-PO-HRM-MVP-GD1-PAY-01-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-MVP-GD1-PAY-01-CLUSTER-FE-01` |
| **date** | 2026-08-10 |
| **stamp** | **`PAY01FEQA1-MSMBWFOY`** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** · C-SLICE · **≠** PAY-01 / PAY module UAT · `payroll_e2e_ready=false` |
| **persona** | `ceo@xe.vn` · `companyId=main` |
| **FE handoff** | `docs/qa/evidence/po-hrm-mvp-gd1-pay-01-cluster-fe-01.md` |
| **API baseline** | `docs/qa/evidence/po-hrm-mvp-gd1-pay-01-cluster-qa-01.md` (PAY01QA1-MSMBA9OA) |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-pay-01-cluster-fe-01-qa.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-pay-01-cluster-fe-01-qa.json` |

## Gates

| Gate | Result |
|------|--------|
| L0 | `qc:fe-be-health` **PASS** |
| L1 FE vitest | **PASS** (bind ring + source guards) |

## testids

| testid | seen |
|--------|------|
| pay-period-timesheet-binds | ✓ |
| pay-bind-sheet-select | ✓ |
| pay-bind-submit | ✓ |
| pay-bind-timesheet-status | ✓ |

## Journeys (FE bind panel)

| J-* | Verdict | Summary |
|-----|---------|---------|
| **J-HRM-PAY-01-02** | PASS | already bound · F5 rows 1→1 · badge=Đã chốt · DUP+F5 cite · ATT11QC1-MSLXTH9P |
| **J-HRM-PAY-01-03** | PASS | bind submitted UI → POST 412=true toast=true · elig banner peer |
| **J-HRM-PAY-01-04** | PASS | lock/process UI → POST 412=true toast=true HRM-PAY-ATT-412 |

## must_keep

- `ATT12QC1-MSMAIGWC1` · `ATT11QC1-MSLXTH9P` · cite `PAY01QA1-MSMBA9OA`

**≠** `payroll_e2e_ready` · **≠** PAY module UAT · **≠** PAY-01 DONE.

## U65 click path (FE bind panel)

```text
Persona: ceo@xe.vn · companyId=main · portal :5173/hr/payroll
1) Lương → Tính lương → Danh sách bảng lương → deep-link pay_batch_id + pay_period_month/year
2) Khối pay-period-timesheet-binds · GET timesheet-binds 2xx
3) J-02: row «Đã chốt» persisted · F5 parity (U65 prior bind / DUP path)
4) J-03: chọn header submitted → POST 412 · toast VI HRM-PAY-ATT-412
5) J-04: Khóa bảng lương (draft no bind) → process POST 412 · toast
6) Footer pay-bind-honesty-footer · payroll_e2e_ready=false
```

**Screens:** `docs/qa/evidence/screens/po-hrm-mvp-gd1-pay-01-cluster-fe-01-qa/`

## Residual (not promoted)

- **J-HRM-PAY-01-05** `HRM-PAY-FORMULA-412` — PAY-02/06 HOLD (API baseline PASS_WITH_HOLD)
- **G-PAY-01-ELIG-FE** widen on main PAY tab
- **≠** PAY module UAT · **≠** `payroll_e2e_ready`

## completion_report

**Closed:** L0 PASS · FE vitest 21 PASS · U65 browser **J-HRM-PAY-01-02/03/04** on bind panel (testids ✓) — closed bind F5 + badge · submitted 412+toast · lock/process 412+toast · honesty/must_keep ATT12+ATT11 · cite PAY01QA1.

**Open:** Formula/process depth J-05 · eligibility FE widen · C-SLICE honesty retained.

**next_owner:** **qc** (`PO-HRM-MVP-GD1-PAY-01-CLUSTER-QC-01` narrow GWC FE slice or confirm prior PAY01QC1-MSMBGWC1 + FE stamp)

**evidence_path:** `docs/qa/evidence/po-hrm-mvp-gd1-pay-01-cluster-fe-01-qa.md`

**ack_status:** **PASS_TO_PM**

### next_dispatch_prompt (qc — copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-PAY-01-CLUSTER-QC-01
role: qc
read_first:
  - docs/qa/evidence/po-hrm-mvp-gd1-pay-01-cluster-fe-01-qa.md (stamp PAY01FEQA1-MSMBWFOY)
  - docs/qa/evidence/po-hrm-mvp-gd1-pay-01-cluster-qa-01.md (PAY01QA1-MSMBA9OA)
  - docs/qa/evidence/po-hrm-mvp-gd1-pay-01-cluster-qc-01.md (prior GWC PAY01QC1-MSMBGWC1)
entry_criteria: QA FE-01 PASS_TO_PM · L0–L2.5 bind panel J-02/03/04 PASS · U65 zero-seed
exit_criteria: GWC C-SLICE FE bind slice sealed or note FE stamp on existing GWC · honesty payroll_e2e_ready=false · ≠ PAY-01/PAY UAT · must_keep ATT12QC1+ATT11QC1 · J-05 FORMULA-412 HOLD acknowledged
cấm: flip payroll_e2e_ready · seed · claim PAY module UAT DONE
```
