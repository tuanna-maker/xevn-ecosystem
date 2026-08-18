# PO-HRM-MVP-GD1-ATT-06-CLUSTER-BE-01 — evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-06-CLUSTER-BE-01` |
| **uc_ids** | `UC-BP-ATT-06` · `FR-UC-BP-ATT-06` · **BR-BP-LV-03** |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `attendance_uat_ready=false` · **C-SLICE** · **≠ ATT-06 / FR-06 DONE** |

## spec_read_ack

- **srs:** `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` · **FR-UC-BP-ATT-06** · Diễn biến **#1** (duyệt OT → cộng quỹ bù) · **#2** (đơn nghỉ bù / hold)
- **tech_spec / API:** `docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-API-01.md` §4.6–§4.9 · RETAIN §4.1–§4.7 cite
- **db_design:** `docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-DATA-01.md` §5.1 `att_ot_comp_leave_policy` · §5.2 `att_ot_comp_accrual_ledger`
- **api_design:** `GET/PUT /api/hrm/attendance/ot-comp-leave-policy` · accrual hook on `POST …/overtime-requests/:id/approve`
- **change_mode:** ADD (ensureSchema tables + policy routes + approve accrual hook)
- **must_keep:** `pending_days` on `compensatory` · peer ATT05BQC1 / ATT09QC1 / ATT05QC1 seals · **DENY** `att_leave_hold` · **DENY** merge `compensatory`/`carry_over`→`annual` · accrual **≠** sheet close

## Closed (BE)

| Item | Implementation |
|------|----------------|
| Schema §5.1 + §5.2 | `AttOtCompLeavePolicyService.ensureSchema()` — `att_ot_comp_leave_policy` + `att_ot_comp_accrual_ledger` + partial UQ idempotency |
| F-ATT-OT-COMP-POLICY | `GET/PUT …/ot-comp-leave-policy` · `attendance.controller.ts` |
| F-ATT-OT-COMP-ACCRUE | `accrueOnApprovedOvertime` · wired from `approveOvertimeRequest` |
| Mode OFF | Approve 2xx · no ledger / no `entitled_days` Δ |
| Idempotent double-approve | Already `approved` → skip UPDATE · replay ledger |
| Draft guard | `rejected` / non-pending → `HRM-ATT-REQ-404` |
| Scope parity | Accrual uses OT row `company_id` (not query slug alone) |

## Files touched

- `apps/api/hrm-api/src/attendance/att-ot-comp-leave-policy.service.ts`
- `apps/api/hrm-api/src/attendance/att-ot-comp-leave-policy.constants.ts`
- `apps/api/hrm-api/src/attendance/dto/att-ot-comp-leave-policy.dto.ts`
- `apps/api/hrm-api/src/attendance/attendance-requests.service.ts` (@CODE-MEMORY-CHANGE APPEND)
- `apps/api/hrm-api/src/attendance/attendance.controller.ts`
- `apps/api/hrm-api/src/app.module.ts`
- `apps/api/hrm-api/src/attendance/po-hrm-mvp-gd1-att-06-cluster-be-01.spec.ts`
- `apps/api/hrm-api/src/attendance/attendance.controller.spec.ts` (provider mock)

## Verification

```text
cd apps/api/hrm-api
pnpm exec jest src/attendance/po-hrm-mvp-gd1-att-06-cluster-be-01.spec.ts --no-cache
# 8 passed
pnpm exec jest src/attendance/attendance-requests.service.spec.ts --no-cache
```

## Residual (not BE-01)

| ID | Owner |
|----|--------|
| R-ATT-06-PANEL-FE | **dev-fe FE-01** — comp leave form panel |
| R-ATT-06-OT-PICKER | **dev-fe FE-01** — OT `compensation_type` EFF picker |
| R-ATT-06-AGG | HOLD footer ATT-10 when engine LIVE |
| U65 J-HRM-ATT-06-* | **qa** after FE bind |

## QA entry (U65 · no seed)

- Persona: `ceo@xe.vn` / `Xevn@2026`
- **J-HRM-ATT-06-01:** PUT policy ON + ratio → GET reflects `modeEnabled` / `hoursPerLeaveDay`
- **J-HRM-ATT-06-03/04:** Create OT `compensatory_leave` → approve → `accrual.credited_days` + F5 `GET leave-balance?leave_type=compensatory` entitled ↑ once
- **J-HRM-ATT-06-07:** Policy OFF → approve OT → no accrual block · no entitled Δ
- Double approve same OT → `idempotent_replay: true` · single ledger row
