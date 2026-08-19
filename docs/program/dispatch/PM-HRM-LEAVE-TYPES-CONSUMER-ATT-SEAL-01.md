# PM seal — leave_types ATT consumer (AC-SET-CONSUMER-LV-ATT-01)

| Meta | Value |
|------|--------|
| **work_item_id** | `PM-HRM-LEAVE-TYPES-CONSUMER-ATT-SEAL-01` |
| **date** | 2026-08-10 |
| **qa_stamp** | `ATTLVTCON1-MSNO8B9F` |
| **qc_stamp** | `ATTLVTCONQC1-MSNO8BQC1` · [QC GWC leave_types ATT consumer narrow](db1ff8f4-ded3-4017-b7fa-190f15da3c1e) |

## GWC — closed in slice

**AC-SET-CONSUMER-LV-ATT-01** — LeaveTab 12/12 EFF; Reminders wiring via `useAttLeaveTypesEffective` (VAL-LV-ATT-FE-01)

Evidence: `docs/qa/evidence/qc-hrm-leave-types-consumer-att-gwc-01.md`

## Retain

**ATTLVTSOTQC1-MSNGQC01** · ETCTR · WHPOS · RECCH · DEPTCONREG1 · QACONPAYSTQC1

## Denied

`settings_catalog_e2e_ready` flip · UF-HRM-10 full

## Carry 🟡 (non-blocking)

Dashboard Reminders **live** pending-row label until U65 pending leave feasible (no seed)
