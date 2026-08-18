# PO-HRM-MVP-GD1-ATT-12-CLUSTER-BE-01 — evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-12-CLUSTER-BE-01` |
| **role** | dev-be |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-10 |
| **honesty** | `attendance_uat_ready=false` · **C-SLICE** · **≠ ATT-12 / FR-12 DONE** · **≠ ATT UAT** |

## spec_read_ack

| Artifact | Cite |
|----------|------|
| srs | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-12** Diễn biến #1–#2 · **BR-BP-LC-03** · **BR-BP-LC-03-HALF** |
| tech_spec | `PO-HRM-MVP-GD1-ATT-12-CLUSTER-API-01.md` §4.5–4.8 |
| db_design | `PO-HRM-MVP-GD1-ATT-12-CLUSTER-DATA-01.md` §6.1 `att_activate_enroll_ledger` · §6.2 `att_shift_assignment` |
| api_design | §4.6 enroll-on-activate · §4.7 consumer · §4.8 shift-assignments · RETAIN PUT tracked-entitlement |
| sponsor_confirm | API-01 CONFIRMED RETAIN+GAP · DATA-01 CONFIRMED HOLD §6 |

## Closed (BE slice)

1. **ensureSchema** — `att_activate_enroll_ledger` (UQ `idempotency_key`) + `att_shift_assignment` (partial UQ open `activate_default`).
2. **R-ATT-12-CONSUMER** — `AttEmployeeActivatedConsumer` registers on `HrmRealtimeService.publishEmployeeActivated`.
3. **F-ATT-LEAVE-BAL enroll-on-activate** — LVRULE effective per MVP type · upsert `employee_leave_balances` (same cols as tracked-entitlement).
4. **R-ATT-12-HALF-MONTH** — `floor(annual_days/2)` when `effective_date` is last calendar day (vi-VN parse from dd/MM/yyyy).
5. **R-ATT-12-IDEMPOTENT** — ledger dedupe · replay → `{ enrolled: false, skipped: true }`.
6. **F-ATT-SHIFT-02** — `activate_default` row on `att_shift_assignment` · resolve shift via ATT-02 specificity + work_shifts catalog.
7. **HTTP** — `POST /api/hrm/attendance/leave-balance/enroll-on-activate` · `PUT /api/hrm/attendance/shift-assignments`.
8. **RETAIN** — `PUT leave-balance/tracked-entitlement` unchanged · **DENY** `att_leave_hold` CREATE · **DENY** merge buckets · **DENY** grant on `employees.service`.

## Tests

```text
pnpm exec jest src/attendance/po-hrm-mvp-gd1-att-12-cluster-be-01.spec.ts
→ 5 passed
```

## QA entry (U65)

- J-HRM-ATT-12-01..07 after FE strip
- Regression: J-HRM-ATT-06-04 · J-HRM-ATT-07-03..05 when grant paths touched
- Persona: `ceo@xe.vn` · activate → F5 leave-balance/panel · half-month case end-of-month EFF

## Residual

- FE confirm strip (FE-01 HOLD)
- QC GWC C-SLICE · full R-ATT-01-ASSIGN grid OPEN
- F-ATT-LEAVE-04 periodic HOLD

## completion_report

ATT-12 BE GAP closed for migrate §6.1/§6.2, consumer, idempotent grant, half-month branch, default shift bind. Emit-only CORE boundary preserved.

## next_owner

**dev-fe** — `PO-HRM-MVP-GD1-ATT-12-CLUSTER-FE-01`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-ATT-12-CLUSTER-FE-01
role: dev-fe
read_first:
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-12-CLUSTER-API-01.md §4.3 panel · R-ATT-12-FE-CONFIRM
  - docs/qa/evidence/po-hrm-mvp-gd1-att-12-cluster-be-01.md
entry_criteria: BE READY_FOR_QA · activate emit LIVE · enroll consumer LIVE
exit_criteria: HCNS profile strip display-ready quỹ+ca sau activate · F5 parity · ≠ ATT-12 DONE · C-SLICE
```
