# PO-HRM-MVP-GD1-ATT-06-CLUSTER-BE-02 — evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-06-CLUSTER-BE-02` |
| **uc_ids** | `UC-BP-ATT-06` · `FR-UC-BP-ATT-06` · **BR-BP-LV-03** |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `attendance_uat_ready=false` · **C-SLICE** · **≠ ATT-06 / FR-06 DONE** |

## spec_read_ack

- **srs:** `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` · **FR-UC-BP-ATT-06** · Diễn biến **#1** (duyệt OT → cộng quỹ bù) · J-HRM-ATT-06-04 F5 panel
- **tech_spec / API:** `docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-API-01.md` §4.6–§4.9 · GET `leave-balance` / `leave-balance/panel`
- **db_design:** `docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-DATA-01.md` §5.2 `att_ot_comp_accrual_ledger` · `employee_leave_balances`
- **api_design:** F-ATT-OT-COMP-ACCRUE write + F-ATT-LEAVE-BAL read compensatory
- **change_mode:** FIX (read/write partition parity)
- **must_keep:** `ATT05BQC1` · `ATT05QC1` · `ATT09QC1` · DENY merge compensatory→annual · pending_days hold · ledger `company_id` = OT row

## Root cause (D-ATT-06-QA-ACCRUAL-BALANCE)

| Layer | Issue |
|-------|--------|
| **Write** | OT accrual upsert `employee_leave_balances` với `ot.company_id` (`holding` sau persist) |
| **Read** | GET balance filter `company_id = employee.company_id` (pilot UUID / `main` trên row NV) |
| **Result** | Ledger + `credited_days=0.5` trên approve 201 · compensatory `entitled_days` read = 0 |

## Fix

| File | Change |
|------|--------|
| `leave-balance.service.ts` | Query balance với `expandPayrollAttendanceSheetCompanyIds` (main↔holding↔pilot UUID); `pickPreferredBalanceRow` |
| `att-ot-comp-leave-policy.service.ts` | Balance upsert dùng `employees.company_id` partition (ledger vẫn `ot.company_id`) |

## Verification

```text
cd apps/api/hrm-api
pnpm exec jest src/attendance/po-hrm-mvp-gd1-att-06-cluster-be-02.spec.ts --no-cache
pnpm exec jest src/attendance/leave-balance.service.spec.ts --no-cache
pnpm exec jest src/attendance/po-hrm-mvp-gd1-att-06-cluster-be-01.spec.ts --no-cache
```

| Suite | Result |
|-------|--------|
| `po-hrm-mvp-gd1-att-06-cluster-be-02.spec.ts` | **1 passed** |
| `leave-balance.service.spec.ts` | **12 passed** (incl. ATT-06 partition regression) |
| `po-hrm-mvp-gd1-att-06-cluster-be-01.spec.ts` | **8 passed** |

## QA entry (U65 · retest J-04)

- Persona: `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · OU **holding**
- Employee: `0f6e1369-4170-42e3-ad6b-3d04b3ec2edd` (or fresh OT slice)
- **J-HRM-ATT-06-03:** approve 201 · `credited_days=0.5` · `ledger_id` present
- **J-HRM-ATT-06-04:** GET `leave_type=compensatory` · `entitled_days` ↑ 0.5 (± rounding) · F5 persist
- Harness: `scripts/qa/_tmp-po-hrm-mvp-gd1-att-06-cluster-qa-01.mjs` · `fetchBalance(..., 'compensatory')`

## Residual

| ID | Owner |
|----|--------|
| R-ATT-06-AGG | HOLD ATT-10 peer |
| **≠ ATT-06 / ATT UAT DONE** | honesty retained |
| QC-01 | blocked until J-04 PASS |

## completion_report

**Closed:** Partition mismatch accrual write vs balance read; compensatory entitled read path; forward write on employee partition; jest regression BE-02 + leave-balance + BE-01 green.

**Open:** U65 browser J-04 F5 (QA); QC GWC C-SLICE after J-04 PASS.

**next_owner:** **qa**

**evidence_path:** `docs/qa/evidence/po-hrm-mvp-gd1-att-06-cluster-be-02.md`

**ack_status:** **READY_FOR_QA**
