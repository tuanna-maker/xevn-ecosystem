# Evidence — PO-HRM-MVP-GD1-CORE-08-CLUSTER-BA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-08-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 · Wave-12 seat #14) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **PASS_TO_PM** · O1–O12 **CONFIRMED** |
| **depends_on** | SA-01 Option A LOCKED · peer CORE-02 SEALED `CORE02QC1-MSL80DU6` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-BA-01.md` |
| **uc_ids** | `UC-BP-CORE-08` |
| **Honesty** | all flags **false** · **C-SLICE** |
| **apps/** | **none** · **no seed** |

## Summary

BA locked AC for KT/KL **execute + payroll_link** on LIVE `/api/hrm/employees/:id/rewards*` + `/discipline*`; paper `/core/reward-discipline` = alias only. amount>0 → period; note-only → not PAY-visible; enforce/cancel unlocked; dual-period 409; locked deny; emp Hoạt động. **ba-data REQUIRED** for link cols. DRAFT `J-HRM-CORE-08-01..04`.

## O1–O12

| # | Verdict |
|---|---------|
| O1–O12 | **CONFIRMED** (see spec) |

## DENY checklist

| Item | Status |
|------|--------|
| Nest `/core` dual RD | **DENIED** |
| PAY process / payslip invent | **OUT** |
| Fold RD into `/decisions` | **DENIED** |
| Claim CORE-02 = pillar DONE | **DENIED** |
| Claim note-CRUD = FR-08 DONE | **DENIED** |
| Reopen J-CORE-02 / J-CORE-01 | **DENIED** |
| Honesty flip / seed / apps/** | **DENIED** |

## Journeys DRAFT

- `J-HRM-CORE-08-01` create + period gate
- `J-HRM-CORE-08-02` enforce → link F5
- `J-HRM-CORE-08-03` cancel unlink / note-only not PAY
- `J-HRM-CORE-08-04` Nest `/core` 0 + CORE-02 must_keep + locked deny

## Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **ba-data** |
| **next_work_item** | `PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01` |
| **Then** | sa API-01 · Dev HOLD |

```text
completion_report: O1–O12 CONFIRMED UC-BP-CORE-08 · physical rewards/discipline + payroll_link · ba-data REQUIRED · J-08 DRAFT · DENY Nest/core dual · PAY invent · CORE-02=DONE · note=FR-08 DONE · C-SLICE
next_owner: ba-data
ack_status: PASS_TO_PM
```
